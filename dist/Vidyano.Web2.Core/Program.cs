using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Vidyano.Web2.Core
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Vidyano.Web2.Core.Controllers.Vulcanizer.RootPath = args[0];
            Vidyano.Web2.Core.Controllers.WebsitesController.Website = args[1];
            Vidyano.Web2.Core.Controllers.WebsitesController.Web2Version = args.Length >= 3 ? args[2] : "edge";

            Console.WriteLine($"Serving website {args[1]} from folder {args[0]}");
            
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
    }
}
