using System.IO;
using System.Text.RegularExpressions;

namespace Vidyano.Web2
{
    partial class Web2Controller
    {
        private static class Vulcanizer
        {
            private static readonly Regex scriptRe = new Regex("<script src=\"(.+?)\".*?</script>");
            private static readonly Regex linkRe = new Regex("<link.*?href=\"(.+?.css)\".*?>");

            private static readonly string[] polymerDependencies = {
                "iron-a11y-keys",
                "iron-a11y-keys-behavior",
                "iron-list",
                "iron-resizable-behavior",
                "iron-scroll-target-behavior",
                "polymer",
                "paper-ripple",
            };
            private static readonly Regex linkPolymerRe = new Regex("<link.*?href=\".+?(" + string.Join("|", polymerDependencies) + ")\\.html\".*?>");

            public static string Generate(string path, string html, bool useLocalFileSystem = false, bool stripPolymerLinks = true)
            {
#if DEBUG
                useLocalFileSystem = true;
#endif
                var directory = Path.GetDirectoryName(path);
                if (!string.IsNullOrEmpty(directory))
                    directory += "/";

                if (stripPolymerLinks)
                    html = linkPolymerRe.Replace(html, string.Empty);

#if !DEBUG

                html = scriptRe.Replace(html, match =>
                {
                    var src = match.Groups[1].Value;

                    if (useLocalFileSystem)
                    {
                        var filePath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), directory + src);
                        return "<script>" + File.ReadAllText(filePath) + "</script>";
                    }

                    var script = GetEmbeddedResource(directory + src);
                    return "<script>" + script + "</script>";
                });
#endif

                html = linkRe.Replace(html, match =>
                {
                    var id = directory + match.Groups[1].Value;
#if DEBUG
                    return "<style>" + File.ReadAllText(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), "../../src/" + id)) + "</style>";
#else
                    if (useLocalFileSystem)
                        return "<style>" + File.ReadAllText(Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), id)) + "</style>";

                    return "<style>" + GetEmbeddedResource(id) + "</style>";
#endif
                });

                return html;
            }
        }
    }
}