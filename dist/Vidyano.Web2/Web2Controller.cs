using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http;

namespace Vidyano.Web2
{
    public partial class Web2Controller : ApiController
    {
        private const string defaultColor1 = "steel-blue";
        private const string defaultColor2 = "teal";

        private static readonly Encoding utf8NoBom = new UTF8Encoding(false);
        private static readonly Assembly assembly = typeof(Web2Controller).Assembly;
        private static readonly Dictionary<Tuple<string, string, string>, Tuple<string, string>> cache = new Dictionary<Tuple<string, string, string>, Tuple<string, string>>();
        private static readonly Dictionary<string, string> mediaTypes = new Dictionary<string, string>
        {
            [".css"] = "text/css",
            [".js"] = "application/javascript",
            [".html"] = "text/html"
        };
        private static readonly Dictionary<string, string> names = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<string, string> cachedResources = new Dictionary<string, string>();
        private static readonly object syncRoot = new object();

        public static bool Compress = true;
        public static bool Vulcanize = true;

        static Web2Controller()
        {
            Embedded.AssemblyResolver.Initialize();

            var skipLength = (typeof(Web2Controller).Namespace?.Length ?? 0) + 1;
            foreach (var name in assembly.GetManifestResourceNames())
            {
                var cleanName = name.Substring(skipLength);
                names[cleanName.Replace("-", "_")] = cleanName;
            }
        }

        public HttpResponseMessage Get(string id, string color1 = null, string color2 = null)
        {
            var extension = Path.GetExtension(id);
            string mediaType;
            if (extension == null || !mediaTypes.TryGetValue(extension, out mediaType))
                return new HttpResponseMessage(HttpStatusCode.NotFound);

            if (extension == ".css")
                id = Path.ChangeExtension(id, "less");

            var args = Tuple.Create(id, color1 ?? GetCookie("ThemeColor1") ?? defaultColor1, color2 ?? GetCookie("ThemeColor2") ?? defaultColor2);
            var ifNoneMatch = Request.Headers.IfNoneMatch.FirstOrDefault();
            Tuple<string, string> cacheInfo;
            if (cache.TryGetValue(args, out cacheInfo) && ifNoneMatch?.Tag == cacheInfo.Item1)
                return new HttpResponseMessage(HttpStatusCode.NotModified);

            string content;
            lock (syncRoot)
            {
                if (cacheInfo == null && !cache.TryGetValue(args, out cacheInfo))
                {
                    try
                    {
                        content = GetEmbeddedResource(id);

                        switch (extension)
                        {
                            case ".css":
                                content = Less.Generate(id, content, args.Item2, args.Item3);
                                break;

                            case ".js":
                                break;

                            case ".html":
                                content = Vulcanizer.Generate(id, content, args.Item2, args.Item3);
                                break;

                            default:
                                return new HttpResponseMessage(HttpStatusCode.BadRequest);
                        }

                        cacheInfo = Tuple.Create("\"" + GetSHA256(content) + "\"", content);
                        cache[args] = cacheInfo;
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

            var response = new HttpResponseMessage { Content = httpContent };
            response.Headers.ETag = new EntityTagHeaderValue(cacheInfo.Item1);

            if (id.EndsWith("vidyano.html", StringComparison.OrdinalIgnoreCase) && (color1 != null || color2 != null || !Request.Headers.GetCookies("ThemeColor1").Any()))
            {
                response.Headers.AddCookies(new[]
                {
                    new CookieHeaderValue("ThemeColor1", color1 ?? defaultColor1) { Expires = DateTimeOffset.Now.AddYears(1) },
                    new CookieHeaderValue("ThemeColor2", color2 ?? defaultColor2) { Expires = DateTimeOffset.Now.AddYears(1) }
                });
            }

            return response;
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
}