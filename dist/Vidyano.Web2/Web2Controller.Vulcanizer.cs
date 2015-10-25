using System.IO;
using System.Text.RegularExpressions;

namespace Vidyano.Web2
{
    partial class Web2Controller
    {
        private static class Vulcanizer
        {
            private static readonly Regex scriptRe = new Regex("<script src=\"(.+?)\".*?</script>");

            public static string Generate(string path, string html)
            {
                if (Vulcanize)
                {
                    var directory = Path.GetDirectoryName(path);
                    if (!string.IsNullOrEmpty(directory))
                        directory += "/";

                    html = scriptRe.Replace(html, match =>
                    {
                        var src = match.Groups[1].Value;
                        var script = GetEmbeddedResource(directory + src);

                        return "<script>" + script + "</script>";
                    });
                }

                return html;
            }
        }
    }
}