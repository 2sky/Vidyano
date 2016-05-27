using System.Web.Http;
using System.Web.Routing;

namespace Vidyano.Web2
{
    public static class Web2ControllerFactory
    {
        static Web2ControllerFactory()
        {
            GlobalConfiguration.Configuration.MessageHandlers.Add(new CorsHandler());
        }

        public static void MapVidyanoWeb2Route(this RouteCollection routes, string routeTemplate = "web2/")
        {
            routes.MapHttpRoute("VidyanoWeb2 Vulcanize", routeTemplate + "vulcanize/{*id}", new { controller = "Web2", action = "Vulcanize", id = RouteParameter.Optional });
            routes.MapHttpRoute("VidyanoWeb2", routeTemplate + "{*id}", new { controller = "Web2", action = "Get", id = RouteParameter.Optional });
        }

        public static void MapVidyanoWeb2Route(this HttpRouteCollection routes, string routeTemplate = "web2/")
        {
            routes.MapHttpRoute("VidyanoWeb2 Vulcanize", routeTemplate + "vulcanize/{*id}", new { controller = "Web2", action = "Vulcanize", id = RouteParameter.Optional });
            routes.MapHttpRoute("VidyanoWeb2", routeTemplate + "{*id}", new { controller = "Web2", action = "Get", id = RouteParameter.Optional });
        }
    }
}