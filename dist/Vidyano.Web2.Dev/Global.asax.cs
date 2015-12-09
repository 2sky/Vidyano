using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Routing;

namespace Vidyano.Web2.Dev
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(config =>
            {
                config.EnableCors(new EnableCorsAttribute("*", "*", "*"));
            });

            RouteTable.Routes.MapVidyanoWeb2Route("");
        }
    }
}