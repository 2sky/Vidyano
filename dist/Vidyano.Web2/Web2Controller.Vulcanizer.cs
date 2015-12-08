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

            public static string Generate(string path, string html, string color1, string color2)
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
#if DEBUG
                        var id = directory + match.Groups[1].Value;
                        var filePath = Path.Combine(System.Web.Hosting.HostingEnvironment.MapPath("~"), "../../src/" + id);
                        return "<style>" + File.ReadAllText(filePath) + "</style>";
#else
                        var id = directory + (match.Groups[1].Value.Replace(".css", ".less"));
                        try
                        {
                            return "<style>" + Less.Generate(id, GetEmbeddedResource(id), color1, color2) + "</style>";
                        }
                        catch (FileNotFoundException)
                        {
                            /* LESS file for this css request was not found. */
                        }
#endif

                        return match.Value;
                    });
                }

                return html;
            }
        }
    }
}