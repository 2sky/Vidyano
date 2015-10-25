using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using dotless.Core;
using dotless.Core.Importers;
using dotless.Core.Input;
using dotless.Core.Loggers;
using dotless.Core.Parser;
using dotless.Core.Stylizers;

namespace Vidyano.Web2
{
    partial class Web2Controller
    {
        private static class Less
        {
            private static readonly HashSet<string> colors;
            private static readonly Dictionary<string, string> themeColors = new Dictionary<string, string>();

            static Less()
            {
                var themeColor = GetEmbeddedResource("theme-color.less", null);
                themeColors["background-color"] = themeColor;
                foreach (var prop in new[] { "color", "fill", "border-right-color", "border-color" })
                    themeColors[prop] = themeColor.Replace("background-color", prop);

                colors = new HashSet<string>(Regex.Matches(GetEmbeddedResource("WebComponents/colors.less"), "@([a-z-]+):").Cast<Match>().Select(m => m.Groups[1].Value));
            }

            public static string Generate(string fileName, string less, string color1, string color2)
            {
                var reader = new CustomFileReader(color1, color2);
                var importer = new Importer(reader);
                var parser = new Parser(new PlainStylizer(), importer, false);
                var lessEngine = new LessEngine(parser, NullLogger.Instance, true, false);
                less = Regex.Replace(less, "\\.theme-color\\(([a-z-]+),? ?", Evaluate);

                lessEngine.CurrentDirectory = Path.GetDirectoryName(fileName);

                return lessEngine.TransformToCss(less, Path.GetFileName(fileName));
            }

            private static string Evaluate(Match match)
            {
                var prop = match.Groups[1].Value;
                if (!themeColors.ContainsKey(prop))
                    themeColors[prop] = themeColors["background-color"].Replace("background-color", prop);

                return match.Result(".theme-color-$1(");
            }

            private sealed class CustomFileReader : IFileReader
            {
                private readonly string color1;
                private readonly string color2;
                private static readonly int[] colorNumbers = { 50, 100, 300, 500, 700, 900 };

                public CustomFileReader(string color1, string color2)
                {
                    this.color1 = color1;
                    this.color2 = color2;
                }

                public bool UseCacheDependencies => false;

                public bool DoesFileExist(string fileName)
                {
                    return names.ContainsKey("src." + GetPath(fileName));
                }

                public byte[] GetBinaryFileContents(string fileName)
                {
                    throw new NotSupportedException();
                }

                public string GetFileContents(string fileName)
                {
                    var less = GetEmbeddedResource(fileName);
                    var result = Regex.Replace(less, "\\.theme-color\\(([a-z-]+),? ?", Evaluate);

                    if (fileName.EndsWith("vidyano.less"))
                    {
                        var beginIndex = result.IndexOf(".theme-color(@prop", StringComparison.Ordinal);
                        var endIndex = result.IndexOf("\n}", beginIndex, StringComparison.Ordinal);
                        result = result.Remove(beginIndex, endIndex - beginIndex + 2);

                        result += "\n" + string.Join("\n", themeColors.Values);

                        result = ChangeColor(defaultColor1, color1, result);
                        result = ChangeColor(defaultColor2, color2, result);
                    }

                    return result;
                }

                private static string ChangeColor(string color, string otherColor, string result)
                {
                    if (otherColor != color)
                    {
                        if (!colors.Contains(otherColor))
                        {
                            var colorVariants = otherColor.Split(',');
                            if (colorVariants.Length == colorNumbers.Length)
                            {
                                for (var i = 0; i < colorNumbers.Length; i++)
                                {
                                    var colorNumber = colorNumbers[i];
                                    if (colorNumber == 500)
                                        result = result.Replace("@" + color + ";", "#" + colorVariants[i] + ";");
                                    else
                                        result = result.Replace("@" + color + "-" + colorNumber + ";", "#" + colorVariants[i] + ";");
                                }
                            }
                        }
                        else
                            result = result.Replace("@" + color, "@" + otherColor);
                    }

                    return result;
                }
            }
        }
    }
}