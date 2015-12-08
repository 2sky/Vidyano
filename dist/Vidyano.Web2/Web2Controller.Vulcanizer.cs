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

            public static string Generate(string path, string html)
            {
                if (Vulcanize)
                {
                    var directory = Path.GetDirectoryName(path);
                    if (!string.IsNullOrEmpty(directory))
                        directory += "/";

#if !DEBUG
                    html = scriptRe.Replace(html, match =>
                    {
                        var src = match.Groups[1].Value;
                        var script = GetEmbeddedResource(directory + src);

                        return "<script>" + script + "</script>";
                    });
#endif

                    html = linkRe.Replace(html, match =>
                    {
                        var id = directory + match.Groups[1].Value;
#if DEBUG
                        var filePath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), "../../src/" + id);
                        return "<style>" + File.ReadAllText(filePath) + "</style>";
#else
                        return "<style>" + GetEmbeddedResource(id) + "</style>";
#endif
                    });
                }

                return html;
            }
        }
    }
}