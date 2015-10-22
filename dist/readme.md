# Adding the Vidyano Web2 Client to your project

#### 1. In the ```global.asax.cs``` file, add a route that exposes the web2 endpoint:

```cs
using Vidyano.Service;
using Vidyano.Web2;

public class Global : HttpApplication
{
    protected void Application_Start()
    {
        var routes = RouteTable.Routes;
        routes.MapHttpRoute(
            name: "Web2",
            routeTemplate: "web2/{*id}",
            defaults: new { controller = typeof(Web2Controller).Name.Replace("Controller", null), id = RouteParameter.Optional }
        );
        routes.MapVidyanoRoute();
    }
}
```

*Note: You may have to add a global.asax file to your project if it doesn't exist yet.*

#### 2. Open your ```web.config```and remove or comment the default Vidyano route:

```xml
<!--<add name="Vidyano" type="Vidyano.Service.WebControllerModule, Vidyano.Service" />-->
```

#### 3. Add a new html file to your project with the following code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<title>Your project name</title>

	<script src="web2/Libs/webcomponentsjs/webcomponents-lite.js"></script>
	<link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800" rel="stylesheet" type="text/css">
    <link rel="import" href="web2/vidyano.html" />
</head>

<body>
    <vi-app uri="" label="Your project name"></vi-app>
</body>
</html>
```

#### 4. Run your project and navigate to the html file.
