using System;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.Framework.DependencyInjection;

namespace Vidyano.Web2
{
    public class Startup
    {
        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void Configure(IApplicationBuilder app)
        {
            app.Use((context, next) =>
            {
                context.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });
                context.Response.Headers.Add("Access-Control-Allow-Headers", new[] { "*" });
                context.Response.Headers.Add("Access-Control-Allow-Methods", new[] { "*" });
                return next();
            });
        }
    }
}
