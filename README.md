# Vidyano Web2 Client

The Vidyano Web2 Client provides a modern out of the box scaffolded UI that connects to a Vidyano backend.

## Dependencies

This project is heavily based on the [Polymer project](https://www.polymer-project.org/). if you want to add your own web components to your application, check out the site for all library documentation, including getting started guides and tutorials, developer reference, and more.

Apart from Polymer, the Vidyano Client also uses a number of support libraries such as:

* [moment.js](http://momentjs.com/)
* [linq.js](http://linqjs.codeplex.com/)
* [masked input](http://digitalbush.com/projects/masked-input-plugin/)
* [PathJS](https://github.com/mtrpcic/pathjs)
* [es6-promise](https://github.com/jakearchibald/es6-promise) (subset of [rsvp.js](https://github.com/tildeio/rsvp.js))
* [promise-queue](https://github.com/azproduction/promise-queue/)
* [Sortable](https://github.com/RubaXa/Sortable)

## Project structure

The project structure of the Vidyano Web Client looks something like this:

```
/
├── bower.json
├── gruntfile.js
├── package.json
├── dist/
│   ├── demo.html
│   ├── vidyano.html
│   ├── 2sky.png
│   ├── Libs/
│   │   ├── es6-promise/
│   │   │   └── es6-promise.js
│   │   ├── ...
│   ├── WebComponents/
│   │   ├── ActionBar/
│   │   │   ├── action-bar.html
│   │   │   ├── action-bar.css
│   │   │   └── action-bar.js
│   │   ├── ActionButton/
│   │   │   ├── action-button.html
│   │   │   ├── action-button.css
│   │   │   └── action-button.js
│   │   ├── App/
│   │   │   ├── app.html
│   │   │   ├── app.css
│   │   │   └── app.js
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
│   │   ├── vidyano.less
│   │   ├── ActionBar/
│   │   │   ├── action-bar.html
│   │   │   ├── action-bar.less
│   │   │   ├── action-bar.css
│   │   │   ├── action-bar.min.css
│   │   │   ├── action-bar.ts
│   │   │   └── action-bar.js
│   │   ├── ActionButton/
│   │   │   ├── action-button.html
│   │   │   ├── action-button.less
│   │   │   ├── action-button.css
│   │   │   ├── action-button.min.css
│   │   │   ├── action-button.ts
│   │   │   └── action-button.js
│   │   ├── App/
│   │   │   ├── app.html
│   │   │   ├── app.less
│   │   │   ├── app.css
│   │   │   ├── app.min.css
│   │   │   ├── app.ts
│   │   │   └── app.js
│   │   ├── ...
```

The WebComponents folder is where you will find all individual web components that make up your web application.
The Libs folder contains dependencies on external support libraries as well as the vidyano javascript library for interaction with a Vidyano backend.

We provide compiled CSS for LESS and JS for TypeScript files.

## Getting Started

The recommended way to install the Vidyano Web Client is through Bower. To install Bower, see the [Bower web site](http://bower.io/). After installing Bower, go into the project folder and run **```bower install --save Vidyano```** to install.

### Setting up your index.html

As shown in the demo.html file in the dist folder, you will have to include the webcomponents-lite.js script and import the vidyano.html file to get started.

You will then add a ```vi-app``` component and points its ```uri``` attribute to a Vidyano backend. You can also set the label for your application and supply an image that will be shown on the sign in page. 

```html
<head>
	...
	<script src="dist/libs/webcomponentsjs/webcomponents-lite.js"></script>
    <link rel="import" href="dist/vidyano.html" />
</head>

<body>
    <vi-app uri="<your-backend-url>" label="My application" sign-in-image="signin.png"></vi-app>
</body>
</html>
```

## Documentation

Vidyano Web Client's documentation is included in this repo in the [docs](./docs) folder.

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, Vidyano is maintained under [the Semantic Versioning guidelines](http://semver.org/) and we will adhere to those rules whenever possible.

## Copyright and license

Code and documentation copyright 2011-2015 2sky NV. Code released under the MIT license available [here](./LICENSE)
