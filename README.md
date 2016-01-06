# Vidyano Web²

The Vidyano Web² client provides a modern out of the box scaffolded UI that connects to a Vidyano backend.

## Dependencies

This project is heavily based on the [Polymer project](https://www.polymer-project.org/). if you want to add your own web components to your application, check out the site for all library documentation, including getting started guides and tutorials, developer reference, and more.

Apart from Polymer, the Vidyano Web² client also uses a number of support libraries such as:

* [bignumber.js](https://github.com/MikeMcl/bignumber.js/)
* [moment.js](http://momentjs.com/)
* [linq.js](http://linqjs.codeplex.com/)
* [masked input](http://digitalbush.com/projects/masked-input-plugin/)
* [PathJS](https://github.com/mtrpcic/pathjs)
* [es6-promise](https://github.com/jakearchibald/es6-promise) (subset of [rsvp.js](https://github.com/tildeio/rsvp.js))
* [promise-queue](https://github.com/azproduction/promise-queue/)
* [Sortable](https://github.com/RubaXa/Sortable)

## Project structure

The project structure of the Vidyano Web² client looks something like this:

```
/
├── bower.json
├── gruntfile.js
├── package.json
├── dist/
│   ├── readme.md
│   ├── Vidyano.Web2
│   │   ├── .nuget
│   │   ├── Embedded
│   │   ├── Properties
│   │   ├── Vidyano.Web2.csproj
│   │   ├── Vidyano.Web2.sln
│   │   ├── Web2Controller.cs
│   │   ├── ...
├── docs/
│   ├── default-component-hooks.md
│   ├── ...
├── src/
│   ├── demo.html
│   ├── vidyano.html
│   ├── 2sky.png
│   ├── Libs/
│   │   ├── es6-promise/
│   │   │   └── es6-promise.js
│   │   ├── ...
│   ├── WebComponents/
│   │   ├── vidyano.scss
│   │   ├── ActionBar/
│   │   │   ├── action-bar.html
│   │   │   ├── action-bar.scss
│   │   │   ├── action-bar.ts
│   │   ├── ActionButton/
│   │   │   ├── action-button.html
│   │   │   ├── action-button.scss
│   │   │   ├── action-button.ts
│   │   ├── App/
│   │   │   ├── app.html
│   │   │   ├── app.scss
│   │   │   ├── app.ts
│   │   ├── ...
```

The [src/WebComponents](https://github.com/2sky/Vidyano/tree/master/src/WebComponents) folder is where you will find all individual web components that make up the Vidyano web application.

The [src/Libs](https://github.com/2sky/Vidyano/tree/master/src/Libs) folder contains dependencies on external support libraries as well as the vidyano base library for interaction with a Vidyano backend.

The [dist/Vidyano.Web2](https://github.com/2sky/Vidyano/tree/master/dist/Vidyano.Web2) folder contains the C# project for exposing the Vidyano Web² client files via an ASP.NET Web API controller. You do not need to compile this project as the result is offered to you via a NuGet package on the 2sky MyGet channel.

## Getting Started

As mentioned above, the latest version of the Vidyano Web² client is available via the 2sky MyGet channel. You can however also add the client via Bower. To install Bower, see the [Bower web site](http://bower.io/). After installing Bower, go into the project folder and run **```bower install --save Vidyano```** to install.

### Setting up your index.html

As shown in the [demo.html](https://github.com/2sky/Vidyano/blob/master/src/demo.html) file, you will have to include the webcomponents-lite.js script and import the vidyano.html file to get started.

You will then add a ```vi-app``` component and points its ```uri``` attribute to a Vidyano backend. You can also set the label for your application and supply an image that will be shown on the sign in page.

```html
<head>
	...
	<script src="web2/webcomponentsjs/webcomponents-lite.js"></script>
    <link rel="import" href="web2/vidyano.html" />
</head>

<body>
    <vi-app uri="<your-backend-url>" label="My application" sign-in-image="signin.png"></vi-app>
</body>
</html>
```

## Documentation

Vidyano Web² client's documentation is included in this repo in the [docs](./docs) folder.

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Vidyano is maintained under [the Semantic Versioning guidelines](http://semver.org/) and we will adhere to those rules whenever possible.

## Copyright and license

Code and documentation copyright 2011-2015 2sky NV. Code released under the MIT license available [here](./LICENSE)
