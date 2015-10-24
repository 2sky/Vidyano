using System.Web.Http;
using System.Web.Routing;

namespace Vidyano.Web2
{
    public static class Web2ControllerFactory
    {
        public static Route MapVidyanoWeb2Route(this RouteCollection routes, string routeTemplate = "web2/{*id}")
        {
            return routes.MapHttpRoute("VidyanoWeb2", routeTemplate, new { controller = "Web2", id = RouteParameter.Optional });
        }
    }
}