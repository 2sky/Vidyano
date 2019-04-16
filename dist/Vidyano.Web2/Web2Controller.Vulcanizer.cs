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
            private static readonly Regex stripCommentRe = new Regex("<!--.*?-->", RegexOptions.Singleline);
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

            public static string Generate(string path, string html, bool useLocalFileSystem = false, bool stripPolymerLinks = true, string web2homeFolder = null)
            {
                var directory = Path.GetDirectoryName(path);
                if (!string.IsNullOrEmpty(directory))
                    directory = directory.Replace('\\', '/') + "/";

                html = stripCommentRe.Replace(html, string.Empty);

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

                html = linkRe.Replace(html, match =>
                {
                    var id = directory + match.Groups[1].Value;
                    if (UseWeb2Home)
                    {
                        var file = Path.Combine(web2homeFolder, id);
                        if (File.Exists(file))
                            return "<style>" + FixCss(File.ReadAllText(file)) + "</style>";
                    }

                    if (useLocalFileSystem)
                        return "<style>" + FixCss(File.ReadAllText(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), id))) + "</style>";

                    return "<style>" + GetEmbeddedResource(id) + "</style>";
                });

                return html;
            }
        }

        private static string FixCss(string css)
        {
            // Fix :host(...) with parent selectors
            css = Regex.Replace(css, ":host([^{( ->][^{> ,]+)([{> ,])", ":host($1)$2");

            // Transform --at-apply: to @apply
            // More info: https://www.xanthir.com/b4o00, to be replaced with: https://www.w3.org/TR/css-shadow-parts-1/
            css = Regex.Replace(css, "--at-apply:([^;}]+)", "@apply($1)");

            return css;
        }
    }
}