# Vidyano

*[Vidyano](http://www.vidyano.com) is .NET based application platform for building data-driven applications.*

For instructions about _using_ Vidyano to develop applications, please refer to [www.vidyano.com](http://www.vidyano.com)

# What is Vidyano Web²
This repository contains the complete code for our next generation web client, **Vidyano Web²**. It provides an out of the box, scaffolded, modern Single Page Application (SPA) that interacts with a Vidyano backend.

# Quick Setup
The easiest way to use the Vidyano Web² client for your Vidyano application is by adding our NuGet package to your backend project. We host this package via our MyGet feed.

**1. In Visual Studio, register the Vidyano MyGet feed (https://www.myget.org/F/vidyano/) as package source:**

![RegisterPackageSource](docs/images/register-myget.png "Register MyGet package source")

**2. Add the Vidyano.Web2 NuGet package to your Vidyano project.
*Note: make sure to select the Vidyano package source and optionally include prerelease packages.***

![InstallPackage](docs/images/select-web2-package.png)

**3. Add a new html file to your project with the following code:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Your project name</title>

    <script src="web2/Libs/webcomponentsjs/webcomponents-lite.js"></script>
    <link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800" rel="stylesheet" type="text/css">
    <link rel="import" href="web2/vidyano.html" />
</head>

<body class="fullbleed">
    <vi-app uri="" label="Your project name" class="fit"></vi-app>
</body>
</html>
```

**4. Run your project and navigate to the html file in your browser.**

## Table of Contents
*The following is a table of contents for the documentation found in the docs folder of this repository.*

* [Overview](docs/overview.md)
* [Getting Started](docs/getting-started.md)
* [Project Structure](docs/project-structure.md)
* [Web Component Structure](docs/web-component-structure.md)
* [Custom Templates](docs/custom-templates.md)
* [Session Presenter](docs/session-presenter.md)


## Copyright and license

Code and documentation copyright 2011-2016 2sky NV. Code released under the MIT license available [here](./LICENSE)
