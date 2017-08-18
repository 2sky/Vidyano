using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace Vidyano.Web2
{
    partial class Web2Controller
    {
        private static class Vulcanizer
        {
            private static readonly Regex scriptRe = new Regex("<script src=[\"'](.+?)[\"'].*?</script>");
            private static readonly Regex linkRe = new Regex("<link.*?href=[\"'](.+?.css)[\"'].*?>");
            private static readonly string[] scriptDependencies = {
                "d3.min.js"
            };
            private static readonly string[] polymerDependencies = {
                "iron-a11y-keys",
                "iron-a11y-keys-behavior",
                "iron-collapse",
                "iron-list",
                "iron-media-query",
                "iron-overlay-behavior",
                "iron-resizable-behavior",
                "iron-scroll-target-behavior",
                "polymer",
                "paper-ripple"
            };
            private static readonly Regex linkPolymerRe = new Regex("<link.*?href=\".+?(" + string.Join("|", polymerDependencies) + ")\\.html\".*?>");

            public static string Generate(string path, string html, bool useLocalFileSystem = false, bool stripPolymerLinks = true)
            {
                var directory = Path.GetDirectoryName(path);
                if (!string.IsNullOrEmpty(directory))
                    directory = directory.Replace('\\', '/') + "/";

                if (stripPolymerLinks)
                {
                    html = linkPolymerRe.Replace(html, string.Empty);
                    html = scriptRe.Replace(html, match =>
                    {
                        var src = match.Groups[1].Value;
                        if (scriptDependencies.Contains(Path.GetFileName(src)))
                            return string.Empty;

                        return match.Value;
                    });
                }

#if !DEBUG
                html = scriptRe.Replace(html, match =>
                {
                    var src = match.Groups[1].Value;
                    if (useLocalFileSystem)
                    {
                        var filePath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), directory + src);
                        if (!File.Exists(filePath))
                        {
                            filePath = Path.Combine(Web2Home, directory + src);
                            if (!File.Exists(filePath))
                                return match.Value;
                        }

                        return "<script>" + File.ReadAllText(filePath) + "</script>";
                    }

                    var script = GetEmbeddedResource(directory + src);
                    return "<script>" + script + "</script>";
                });
#endif

                var styleTag = "<style is='custom-style' include='iron-flex iron-positioning'>";
                html = linkRe.Replace(html, match =>
                {
                    var id = directory + match.Groups[1].Value;
                    if (UseWeb2Home)
                    {
                        var file = Path.Combine(Web2Home, id);
                        if (File.Exists(file))
                            return styleTag + File.ReadAllText(file) + "</style>";
                    }

                    if (useLocalFileSystem)
                        return styleTag + File.ReadAllText(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), id)) + "</style>";

                    return styleTag + GetEmbeddedResource(id) + "</style>";
                });

                return html;
            }
        }
    }
}