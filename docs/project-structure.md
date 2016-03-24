# Project structure

What follows is a brief description of the project structure.

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

## src/webcomponents
This folder is where you will find all web components that make up the single page application.

> For more information on the structure of an individual web component, please refer to the [Web component structure](web-component-structure.md) documentation.

## src/libs
This folder contains dependencies on external support libraries as well as the vidyano base library for interaction with a Vidyano backend.

#### Dependencies

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

## dist

This folder contains the C# project for exposing the Vidyano Web² client files via an ASP.NET Web API controller. You do not need to compile this project as the result is offered to you via a NuGet package on the Vidyano MyGet feed.