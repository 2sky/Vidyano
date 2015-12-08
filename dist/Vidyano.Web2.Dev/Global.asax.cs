using System.Web;
using System.Web.Routing;

namespace Vidyano.Web2.Dev
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            RouteTable.Routes.MapVidyanoWeb2Route("{*id}");
        }
    }
}