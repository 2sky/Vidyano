using System;
using System.Collections.Concurrent;
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
using System.Text.RegularExpressions;
using System.Web.Http;
using dotless.Core;
using dotless.Core.Importers;
using dotless.Core.Input;
using dotless.Core.Loggers;
using dotless.Core.Parser;
using dotless.Core.Stylizers;

namespace Vidyano.Web2
{
    public class Web2Controller : ApiController
    {
        private const string defaultColor1 = "steel-blue";
        private const string defaultColor2 = "teal";

        private static readonly Encoding utf8NoBom = new UTF8Encoding(false);
        private static readonly Assembly assembly = typeof(Web2Controller).Assembly;
        private static readonly Dictionary<string, string> names = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly Dictionary<string, string> cachedResources = new Dictionary<string, string>();
        private static readonly object syncRoot = new object();
        private static readonly ConcurrentDictionary<Tuple<string, string, string>, string> cachedCssFiles = new ConcurrentDictionary<Tuple<string, string, string>, string>();

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
            switch (extension)
            {
                case ".css":
                    var lessFilename = Path.ChangeExtension(id, "less");
                    color1 = Request.Headers.GetCookies("ThemeColor1").Select(c => c["ThemeColor1"].Value).FirstOrDefault() ?? defaultColor1;
                    color2 = Request.Headers.GetCookies("ThemeColor2").Select(c => c["ThemeColor2"].Value).FirstOrDefault() ?? defaultColor2;
                    var css = cachedCssFiles.GetOrAdd(Tuple.Create(lessFilename, color1, color2), args => Less.Parse(GetEmbeddedResource(args.Item1), args.Item1, args.Item2, args.Item3));
                    return GetContentIfChanged(css, "text/css");

                case ".js":
                    return GetContentIfChanged(GetEmbeddedResource(id), "application/javascript");

                case ".html":
                    var response = GetContentIfChanged(GetEmbeddedResource(id), "text/html");
                    if (id.EndsWith("vidyano.html", StringComparison.OrdinalIgnoreCase) && (color1 != null || color2 != null || !Request.Headers.GetCookies("ThemeColor1").Any()))
                    {
                        response.Headers.AddCookies(new[]
                        {
                            new CookieHeaderValue("ThemeColor1", color1 ?? defaultColor1) { Expires = DateTimeOffset.Now.AddYears(1) },
                            new CookieHeaderValue("ThemeColor2", color2 ?? defaultColor2) { Expires = DateTimeOffset.Now.AddYears(1) }
                        });
                    }
                    return response;

#if DEBUG
                case ".log":
                    return new HttpResponseMessage { Content = new StringContent("Colors:\n" + string.Join("\n", Less.Colors) + "\n\nProperties:\n" + string.Join("\n", Less.Properties) + "\n\nExceptions:\n" + string.Join("\n", Less.Exceptions)) };
#endif

                default:
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
            }
        }

        private HttpContent Compress(HttpContent content, bool canCompress = true)
        {
            if (canCompress)
            {
                var encoding = Request.Headers.AcceptEncoding.OrderByDescending(ae => ae.Quality).Select(ae => ae.Value).FirstOrDefault();
                if (encoding != null && (encoding == "gzip" || encoding == "deflate"))
                    return new CompressedContent(content, encoding);
            }
            return content;
        }

        private HttpResponseMessage GetContentIfChanged(string content, string mediaType)
        {
            var hash = "\"" + GetSHA256(content) + "\"";
            if (Request.Headers.IfNoneMatch.Any(ifm => ifm.Tag == hash))
                return new HttpResponseMessage(HttpStatusCode.NotModified);

            var message = new HttpResponseMessage { Content = Compress(new StringContent(content, utf8NoBom, mediaType)) };
            message.Headers.ETag = new EntityTagHeaderValue(hash);
            return message;
        }

        private static string GetPath(string fileName)
        {
            return new Uri("C:\\" + fileName).AbsolutePath.Substring(3).Replace("/", ".").Replace("-", "_");
        }

        private static string GetEmbeddedResource(string path, string prefix = "src.")
        {
            string name;
            if (!names.TryGetValue(prefix + GetPath(path), out name))
                return string.Empty;

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

        private static class Less
        {
            private static readonly Dictionary<string, string> themeColors = new Dictionary<string, string>();
            private static readonly List<string> exceptions = new List<string>();
            private static readonly HashSet<string> colors;

            static Less()
            {
                var themeColor = GetEmbeddedResource("theme-color.less", null);
                themeColors["background-color"] = themeColor;
                foreach (var prop in new[] { "color", "fill", "border-right-color", "border-color" })
                    themeColors[prop] = themeColor.Replace("background-color", prop);

                colors = new HashSet<string>(Regex.Matches(GetEmbeddedResource("WebComponents/colors.less"), "@([a-z-]+):").Cast<Match>().Select(m => m.Groups[1].Value));
            }

            public static IEnumerable<string> Properties => themeColors.Keys;

            public static IEnumerable<string> Exceptions => exceptions;

            public static IEnumerable<string> Colors => colors;

            public static string Parse(string less, string fileName, string color1, string color2)
            {
                lock (themeColors)
                {
                    var reader = new CustomFileReader(color1, color2);
                    var importer = new Importer(reader);
                    var parser = new Parser(new PlainStylizer(), importer, false);
                    var lessEngine = new LessEngine(parser, NullLogger.Instance, true, false);
                    less = Regex.Replace(less, "\\.theme-color\\(([a-z-]+),? ?", Evaluate);

                    lessEngine.CurrentDirectory = Path.GetDirectoryName(fileName);
                    try
                    {
                        var result = lessEngine.TransformToCss(less, Path.GetFileName(fileName));
                        if (!lessEngine.LastTransformationSuccessful)
                        {
                            if (lessEngine.LastTransformationError != null)
                                exceptions.Add(fileName + ":\n" + lessEngine.LastTransformationError);
                            else
                                exceptions.Add(fileName + ":\n(Nothing)");
                        }

                        return result;
                    }
                    catch (Exception ex)
                    {
                        exceptions.Add(fileName + ":\n" + ex);

                        throw;
                    }
                }
            }

            private static string Evaluate(Match match)
            {
                var prop = match.Groups[1].Value;
                if (!themeColors.ContainsKey(prop))
                    themeColors[prop] = themeColors["background-color"].Replace("background-color", prop);

                return match.Result(".theme-color-$1(");
            }

            private sealed class CustomFileReader : IFileReader
            {
                private readonly string color1;
                private readonly string color2;
                private static readonly int[] colorNumbers = { 50, 100, 300, 500, 700, 900 };

                public CustomFileReader(string color1, string color2)
                {
                    this.color1 = color1;
                    this.color2 = color2;
                }

                public bool UseCacheDependencies => false;

                public bool DoesFileExist(string fileName)
                {
                    return names.ContainsKey("src." + GetPath(fileName));
                }

                public byte[] GetBinaryFileContents(string fileName)
                {
                    throw new NotSupportedException();
                }

                public string GetFileContents(string fileName)
                {
                    var less = GetEmbeddedResource(fileName);
                    var result = Regex.Replace(less, "\\.theme-color\\(([a-z-]+),? ?", Evaluate);

                    if (fileName.EndsWith("vidyano.less"))
                    {
                        var beginIndex = result.IndexOf(".theme-color(@prop", StringComparison.Ordinal);
                        var endIndex = result.IndexOf("\n}", beginIndex, StringComparison.Ordinal);
                        result = result.Remove(beginIndex, endIndex - beginIndex + 2);

                        result = result.Insert(beginIndex, "\n" + string.Join("\n", themeColors.Values));

                        result = ChangeColor(defaultColor1, color1, result);
                        result = ChangeColor(defaultColor2, color2, result);
                    }

                    return result;
                }

                private static string ChangeColor(string color, string otherColor, string result)
                {
                    if (otherColor != color)
                    {
                        if (!colors.Contains(otherColor))
                        {
                            var colorVariants = otherColor.Split(',');
                            if (colorVariants.Length == colorNumbers.Length)
                            {
                                for (var i = 0; i < colorNumbers.Length; i++)
                                {
                                    var colorNumber = colorNumbers[i];
                                    if (colorNumber == 500)
                                        result = result.Replace("@" + color + ";", "#" + colorVariants[i] + ";");
                                    else
                                        result = result.Replace("@" + color + "-" + colorNumber + ";", "#" + colorVariants[i] + ";");
                                }
                            }
                        }
                        else
                            result = result.Replace("@" + color, "@" + otherColor);
                    }

                    return result;
                }
            }
        }
    }
}