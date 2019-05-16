using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Vidyano.Web2.Core.Controllers
{
    [Route("{*id}")]
    [ApiController]
    public class WebsitesController : ControllerBase
    {
        public static string Website;
        public static string Web2Version;

        [HttpGet]
        public IActionResult Get(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                var path = Path.Combine(Vidyano.Web2.Core.Controllers.Vulcanizer.RootPath, id);
                var mimeType = Helpers.MimeMapping.GetMimeMapping(path);
                if (System.IO.File.Exists(path))
                    return PhysicalFile(path, mimeType);

                if (mimeType != "application/octet-stream")
                    return NotFound();
            }

            var index = System.IO.File.ReadAllText(Path.Combine(Vidyano.Web2.Core.Controllers.Vulcanizer.RootPath, "App_Data", "Websites", Website, "index.html"));

            index = index.Replace("<head>", $"<head><base href=\"{Request.Scheme}://{Request.Host}/\">");
            var web2Version = Web2Version.StartsWith("http") ? Web2Version.TrimEnd('/') : $"https://cdn.vidyano.com/{Web2Version}";
            index = Regex.Replace(index, "\"web2/(.+?)\"", match =>
            {
                if (!match.Groups[1].Value.StartsWith("vulcanize", true, CultureInfo.CurrentCulture))
                    return $"\"{web2Version}/" + match.Groups[1].Value + "\"";

                return match.Value;
            });

            return Content(index, "text/html");
        }
    }
}