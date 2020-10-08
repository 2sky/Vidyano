using HtmlAgilityPack;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vidyano.Web2.Build
{
    class Program
    {
        static async Task Main(string[] args)
        {
            if (args.Length < 1)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Usage: dotnet run <version> [<prerelease>] [deploy]");
                return;
            }

            var version = args[0];
            var versionParam = $"--vidyano-version={version}";
            string prerelease = null;
            string prereleaseParam = null;

            bool deploy = false;

            if (args.Length > 1)
            {
                if (args[1] != "deploy")
                {
                    prerelease = args.Length > 1 ? args[1] : null;
                    prereleaseParam = prerelease != null ? $"--vidyano-version-prerelease={prerelease}" : string.Empty;

                    deploy = args.Length > 2 && args[2] == "deploy";
                }
                else
                    deploy = args[1] == "deploy";
            }

            var fullVersion = $"{version}{(prerelease != null ? $"-{prerelease}" : String.Empty)}";
            Console.WriteLine($"Building Vidyano version {fullVersion}");

            // Run grunt
            Grunt("nuget", versionParam, prereleaseParam);

            // Vulcanize
            var sourceFolder = "../../dist/Vidyano.Web2/src/";
            var outFolder = $"builds/{fullVersion}";

            if (Directory.Exists(outFolder))
                Directory.Delete(outFolder, true);

            Directory.CreateDirectory(outFolder);

            CopyFolder(sourceFolder, outFolder);

            foreach (var html in Directory.GetFiles(outFolder, "*.html", SearchOption.AllDirectories))
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
                        if (!cssFile.StartsWith(outFolder) && link.GetAttributeValue("inline", null) == null)
                            continue;

                        Console.WriteLine($"Inlining style: {cssFile}");

                        link.ParentNode.ReplaceChild(HtmlNode.CreateNode($"<style>{FixCss(File.ReadAllText(cssFile))}</style>"), link);
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
                        if (!jsFile.StartsWith(outFolder) && script.GetAttributeValue("inline", null) == null)
                            continue;

                        Console.WriteLine($"Inlining script: {jsFile}");

                        var scriptContent = Regex.Replace(File.ReadAllText(jsFile), "//[#@]\\s(source(?:Mapping)?URL)=\\s*(\\S+)", "");
                        script.ParentNode.ReplaceChild(HtmlNode.CreateNode($"<script>{scriptContent}</script>"), script);
                        File.Delete(jsFile);
                    }
                }

                doc.Save(html, Encoding.UTF8);
            }

            File.Copy("../Vidyano.Web2/vidyano.d.ts", Path.Combine(outFolder, "vidyano.d.ts"));
            File.Copy(Path.Combine(outFolder, "Libs/webcomponentsjs/webcomponents-lite.js"), Path.Combine(outFolder, "webcomponents-lite.js"));
            File.Copy(Path.Combine(outFolder, "Libs/webcomponentsjs/webcomponents-lite.min.js"), Path.Combine(outFolder, "webcomponents-lite.min.js"));

            // Cleanup
            Grunt("nugetrevert", versionParam, prereleaseParam);

            if (deploy)
                await Deploy.Run(fullVersion, outFolder);
        }

        private static void Grunt(params string[] args)
        {
            using var process = Process.Start(
            new ProcessStartInfo("grunt", string.Join(' ', args))
            {
                WorkingDirectory = "../.."
            });
            process.WaitForExit();
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

        private static void CopyFolder(string sourceFolder, string destFolder)
        {
            if (!Directory.Exists(destFolder))
                Directory.CreateDirectory(destFolder);
            
            var files = Directory.GetFiles(sourceFolder);
            foreach (var file in files)
            {
                var name = Path.GetFileName(file);
                var dest = Path.Combine(destFolder, name);
                File.Copy(file, dest);
            }

            var folders = Directory.GetDirectories(sourceFolder);
            foreach (string folder in folders)
            {
                var name = Path.GetFileName(folder);
                var dest = Path.Combine(destFolder, name);
                CopyFolder(folder, dest);
            }
        }
    }
}