# Adding the Vidyano Web2 Client to your project

#### 1. In the ```global.asax.cs``` file

<sub>*Note: You may have to add a global.asax file to your project if it doesn't exist yet.*</sub>

Add a route for the web2 controller:

```cs
using Vidyano.Service;
using Vidyano.Web2;

public class Global : HttpApplication
{
    protected void Application_Start()
    {
        var routes = RouteTable.Routes;
        routes.MapVidyanoWeb2Route();
        routes.MapVidyanoRoute();
    }
}
```

#### 2. In the ```web.config``` file

Remove the default Vidyano route:

```xml
<!--<add name="Vidyano" type="Vidyano.Service.WebControllerModule, Vidyano.Service" />-->
```

Next, make sure ```runAllManagedModulesForAllRequests``` is set to ```true```

```xml
<configuration>
  ...
  <system.webServer>
    ...
    <modules runAllManagedModulesForAllRequests="true"></modules>
    ...
  </system.webServer>
  ...
</configuration>
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
