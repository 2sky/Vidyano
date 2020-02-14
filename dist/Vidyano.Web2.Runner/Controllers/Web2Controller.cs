using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace Vidyano.Web2.Runner.Controllers
{
    [Route("{*id}")]
    [ApiController]
    public class Web2Controller : ControllerBase
    {
        [HttpGet]
        public IActionResult Get(string id)
        {
            var filePath = Path.Combine(Vulcanizer.RootPath, id);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(id, out var mimeType))
                mimeType = "application/octet-stream";

            if (mimeType != "text/html")
                return PhysicalFile(filePath, mimeType);

            var html = Vulcanizer.Generate(id, System.IO.File.ReadAllText(filePath));
            return Content(html, "text/html");
        }
    }

    public static class Vulcanizer
    {
        public static string RootPath = @"/vidyano/src";
        private static readonly Regex linkRe = new Regex("<link.*?href=[\"'](.+?.css)[\"'].*?>");

        public static string Generate(string path, string html)
        {
            var directory = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(directory))
                directory = directory.Replace('\\', '/') + "/";

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