using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Hosting;
using System.Web.Http;

namespace Vidyano.Web2
{
    public partial class Web2Controller : ApiController
    {
        private static readonly Encoding utf8NoBom = new UTF8Encoding(false);
        private static readonly Assembly assembly = typeof(Web2Controller).Assembly;
        private static readonly Dictionary<string, Tuple<string, string>> cache = new Dictionary<string, Tuple<string, string>>();
        private static readonly Dictionary<string, string> mediaTypes = new Dictionary<string, string>
        {
            [".css"] = "text/css",
            [".js"] = "application/javascript",
            [".html"] = "text/html"
        };
        private static readonly Dictionary<string, string> names = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<string, string> cachedResources = new Dictionary<string, string>();
        private static readonly object syncRoot = new object();

        private static readonly string Web2Home = Environment.GetEnvironmentVariable("WEB2_HOME");
        internal static readonly bool UseWeb2Home = Web2Home != null && ConfigurationManager.AppSettings["Vidyano.UseWeb2Home"] == "True";

        public static bool Compress = true;

        static Web2Controller()
        {
            var skipLength = (typeof(Web2Controller).Namespace?.Length ?? 0) + 1;
            foreach (var name in assembly.GetManifestResourceNames())
            {
                var cleanName = name.Substring(skipLength);
                names[cleanName.Replace("-", "_")] = cleanName;
            }
        }

        [AcceptVerbs("GET")]
        public HttpResponseMessage Get(string id = null, string branch = null)
        {
            if (UseWeb2Home && string.IsNullOrEmpty(id))
                return new HttpResponseMessage { Content = new StringContent(File.ReadAllText(HostingEnvironment.MapPath("~/index.html")), Encoding.UTF8, "text/html") };

            var extension = Path.GetExtension(id);
            string mediaType;
            if (extension == null || !mediaTypes.TryGetValue(extension, out mediaType))
                return new HttpResponseMessage(HttpStatusCode.NotFound);

            if (UseWeb2Home)
            {
                if (id.ToLower() == "webcomponents-lite.js" || id.ToLower() == "webcomponents-lite.min.js")
                    id = "Libs/webcomponentsjs/" + id;

                // NOTE: In development we serve the files directly from disk
                var srcFolder = Path.Combine(Web2Home, branch + "/src");
                var filePath = Path.Combine(srcFolder, id);
                switch (extension)
                {
                    case ".html":
                        var html = Vulcanizer.Generate(id, File.ReadAllText(filePath), true, false, srcFolder);
                        return new HttpResponseMessage { Content = new StringContent(html, Encoding.UTF8, mediaTypes[extension]) }.AddVersion(id);

                    case ".css":
                    case ".js":
                        {
                            var js = File.ReadAllText(filePath);
                            if (id == "Libs/Vidyano/vidyano.js" || id == "ServiceWorker/service-worker.js")
                            {
                                var lastUpdated = new DirectoryInfo(srcFolder).GetFiles("*.*", SearchOption.AllDirectories).OrderByDescending(f => f.LastWriteTime).First();
                                js = js.Replace("\"latest\"", "\"latest." + lastUpdated.LastWriteTime.ToLongTimeString().Replace(":", ".") + "\"");
                            }

                            return new HttpResponseMessage { Content = new StringContent(js, Encoding.UTF8, mediaTypes[extension]) };
                        }
                }
            }

            var ifNoneMatch = Request.Headers.IfNoneMatch.FirstOrDefault();
            Tuple<string, string> cacheInfo;
            if (cache.TryGetValue(id, out cacheInfo) && ifNoneMatch?.Tag == cacheInfo.Item1)
                return new HttpResponseMessage(HttpStatusCode.NotModified).AddVersion(id);

            string content;
            lock (syncRoot)
            {
                if (cacheInfo == null && !cache.TryGetValue(id, out cacheInfo))
                {
                    try
                    {
                        content = GetEmbeddedResource(id);

                        switch (extension)
                        {
                            case ".css":
                            case ".js":
                                break;

                            case ".html":
                                content = Vulcanizer.Generate(id, content, false, false);
                                break;

                            default:
                                return new HttpResponseMessage(HttpStatusCode.BadRequest);
                        }

                        cacheInfo = Tuple.Create("\"" + GetSHA256(content) + "\"", content);
                        cache[id] = cacheInfo;
                    }
                    catch (FileNotFoundException fnfe)
                    {
                        Trace.WriteLine($"Missing path '{fnfe.FileName}' on '{id}'.");
                        return new HttpResponseMessage(HttpStatusCode.NotFound);
                    }
                }
                else if (ifNoneMatch?.Tag == cacheInfo.Item1)
                    return new HttpResponseMessage(HttpStatusCode.NotModified);
                else
                    content = cacheInfo.Item2;
            }

            HttpContent httpContent = new StringContent(content, utf8NoBom, mediaType);
            if (Compress)
            {
                var encoding = Request.Headers.AcceptEncoding.OrderByDescending(ae => ae.Quality).Select(ae => ae.Value).FirstOrDefault();
                if (encoding != null && (encoding == "gzip" || encoding == "deflate"))
                    httpContent = new CompressedContent(httpContent, encoding);
            }

            var response = new HttpResponseMessage { Content = httpContent }.AddVersion(id);
            response.Headers.ETag = new EntityTagHeaderValue(cacheInfo.Item1);

            return response;
        }

        [AcceptVerbs("GET")]
        public HttpResponseMessage Vulcanize(string id)
        {
            var rootPath = HostingEnvironment.MapPath("~");
            var filePath = Path.Combine(rootPath, id);
            if (!File.Exists(filePath))
                return new HttpResponseMessage(HttpStatusCode.NotFound);

            var mimeType = System.Web.MimeMapping.GetMimeMapping(id);
            if (mimeType == "text/html")
            {
                var html = Vulcanizer.Generate(id, File.ReadAllText(filePath), true);
                return new HttpResponseMessage { Content = new StringContent(html, Encoding.UTF8, mimeType) };
            }

            if (id.StartsWith("WebComponents", StringComparison.OrdinalIgnoreCase))
            {
                var result = new HttpResponseMessage(HttpStatusCode.OK) { Content = new StreamContent(new FileStream(filePath, FileMode.Open, FileAccess.Read)) };
                result.Content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

                return result;
            }

            return new HttpResponseMessage(HttpStatusCode.NotFound);
        }

        private string GetCookie(string name)
        {
            return Request.Headers.GetCookies(name).Select(c => c[name].Value).FirstOrDefault();
        }

        private static string GetPath(string fileName)
        {
            return new Uri("C:\\" + fileName).AbsolutePath.Substring(3).Replace("/", ".").Replace("-", "_");
        }

        private static string GetEmbeddedResource(string path, string prefix = "src.")
        {
            string name;
            if (!names.TryGetValue(prefix + GetPath(path), out name))
                throw new FileNotFoundException("File not found.", path);

            string result;
            if (!cachedResources.TryGetValue(name, out result))
            {
                lock (syncRoot)
                {
                    if (!cachedResources.TryGetValue(name, out result))
                    {
                        var ms = new MemoryStream();
                        using (var stream = assembly.GetManifestResourceStream(typeof(Web2Controller), name))
                            stream?.CopyTo(ms);

                        var cachedResource = utf8NoBom.GetString(ms.ToArray());
                        if (cachedResource[0] == 0xfeff)
                            cachedResource = cachedResource.Substring(1);

                        cachedResources[name] = result = cachedResource;
                    }
                }
            }

            return result;
        }

        private static string GetSHA256(string content)
        {
            var bytes = utf8NoBom.GetBytes(content);
            using (var hasher = SHA256.Create())
                bytes = hasher.ComputeHash(bytes);

            var sb = new StringBuilder();
            foreach (var b in bytes)
                sb.Append(b.ToString("X2"));
            return sb.ToString();
        }
    }

    static class HttpResponseMessageEx
    {
        private static readonly string version = typeof(Web2Controller).Assembly.GetName().Version.ToString(3);

        public static HttpResponseMessage AddVersion(this HttpResponseMessage message, string id)
        {
            if (string.Equals(id, "vidyano.html"))
            {
                var cookie = new CookieHeaderValue("__vi", version)
                {
                    HttpOnly = true,
                    Path = "/",
                    Expires = DateTimeOffset.Now.AddYears(1)
                };

                message.Headers.TryAddWithoutValidation("Set-Cookie", cookie.ToString());
            }

            return message;
        }
    }
}