using HtmlAgilityPack;
using System;
using System.IO;
using System.Text;

namespace Vidyano.Web2.Build
{
    class Program
    {
        static void Main(string[] args)
        {
            var basePath = Path.Combine(Environment.CurrentDirectory, "src");
            Console.WriteLine(basePath);

            var webComponentsFolder = Path.Combine(basePath, "WebComponents");

            foreach (var html in Directory.GetFiles(webComponentsFolder, "*.html", SearchOption.AllDirectories))
            {
                var doc = new HtmlDocument();
                doc.Load(html);

                var links = doc.DocumentNode.SelectNodes("dom-module/template/link[@rel='stylesheet']");
                if (links != null)
                {
                    foreach (var link in links)
                    {
                        var href = link.GetAttributeValue("href", null);
                        if (href == null)
                            continue;

                        var cssFile = Path.Combine(Path.GetDirectoryName(html), href);
                        if (!cssFile.StartsWith(webComponentsFolder))
                            continue;

                        Console.WriteLine($"Inlining style: {cssFile}");

                        link.ParentNode.ReplaceChild(HtmlNode.CreateNode($"<style>{File.ReadAllText(cssFile)}</style>"), link);

                        File.Delete(cssFile);
                    }
                }

                var scripts = doc.DocumentNode.SelectNodes("script");
                if (scripts != null)
                {
                    foreach (var script in scripts)
                    {
                        var src = script.GetAttributeValue("src", null);
                        if (src == null)
                            continue;

                        var jsFile = Path.Combine(Path.GetDirectoryName(html), src);
                        if (!jsFile.StartsWith(webComponentsFolder))
                            continue;

                        Console.WriteLine($"Inlining script: {jsFile}");

                        script.ParentNode.ReplaceChild(HtmlNode.CreateNode($"<script>{File.ReadAllText(jsFile)}</script>"), script);

                        File.Delete(jsFile);
                    }
                }

                doc.Save(html, Encoding.UTF8);
            }
        }
    }
}