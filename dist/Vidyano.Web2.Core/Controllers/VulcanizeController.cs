using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Vidyano.Web2.Core.Controllers
{
    [Route("web2/vulcanize/{*id}")]
    [ApiController]
    public class VulcanizeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(string id)
        {
            var filePath = Path.Combine(Vulcanizer.RootPath, id);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var mimeType = Helpers.MimeMapping.GetMimeMapping(id);
            if (mimeType == "text/html")
            {
                var html = Vulcanizer.Generate(id, System.IO.File.ReadAllText(filePath), true);
                return Content(html, "text/html");
            }

            if (id.StartsWith("WebComponents", StringComparison.OrdinalIgnoreCase))
            {
                return PhysicalFile(filePath, mimeType);
            }

            return NotFound();
        }
    }

    public static class Vulcanizer
    {
        public static string RootPath = null;

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

            html = linkRe.Replace(html, match =>
            {
                var id = directory + match.Groups[1].Value;
                return "<style>" + FixCss(File.ReadAllText(Path.Combine(RootPath, id))) + "</style>";
            });

            return html;
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