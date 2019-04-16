using HtmlAgilityPack;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace Vidyano.Web2.Build
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 1)
            {
                Console.WriteLine("Missing argument: sourcefolder");
                return;
            }

            var sourceFolder = args[0];
            var outdir = args.FirstOrDefault(a => a.StartsWith("-outdir=", StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrEmpty(outdir))
            {
                outdir = outdir.Split(new[] { '=' }, 2)[1];
                if (!Directory.Exists(outdir))
                    Directory.CreateDirectory(outdir);
            }

            foreach (var html in Directory.GetFiles(sourceFolder, "*.html", SearchOption.AllDirectories))
            {
                var doc = new HtmlDocument();
                doc.Load(html);

                var links = doc.DocumentNode.SelectNodes("//link[@rel='stylesheet']");
                if (links != null)
                {
                    foreach (var link in links)
                    {
                        var href = link.GetAttributeValue("href", null);
                        if (href == null)
                            continue;

                        var cssFile = Path.Combine(Path.GetDirectoryName(html), href);
                        if (!cssFile.StartsWith(sourceFolder) && link.GetAttributeValue("inline", null) == null)
                            continue;

                        Console.WriteLine($"Inlining style: {cssFile}");

                        link.ParentNode.ReplaceChild(HtmlNode.CreateNode($"<style>{FixCss(File.ReadAllText(cssFile))}</style>"), link);

                        if (string.IsNullOrEmpty(outdir))
                            File.Delete(cssFile);
                    }
                }

                var scripts = doc.DocumentNode.SelectNodes("//script");
                if (scripts != null)
                {
                    foreach (var script in scripts)
                    {
                        var src = script.GetAttributeValue("src", null);
                        if (src == null)
                            continue;

                        var jsFile = Path.Combine(Path.GetDirectoryName(html), src);
                        if (!jsFile.StartsWith(sourceFolder) && script.GetAttributeValue("inline", null) == null)
                            continue;

                        Console.WriteLine($"Inlining script: {jsFile}");

                        var scriptContent = Regex.Replace(File.ReadAllText(jsFile), "//[#@]\\s(source(?:Mapping)?URL)=\\s*(\\S+)", "");
                        script.ParentNode.ReplaceChild(HtmlNode.CreateNode($"<script>{scriptContent}</script>"), script);

                        if (string.IsNullOrEmpty(outdir))
                            File.Delete(jsFile);
                    }
                }

                doc.Save(string.IsNullOrEmpty(outdir) ? html : Path.Combine(outdir, Path.GetFileName(html)), Encoding.UTF8);
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