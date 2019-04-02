# Web Component Structure

This section describes the structure of a Web Component in a Vidyano application. This will allow you to better understand the default web components of the Vidyano Web² client and will allow you to roll your own.

## component.html

This file will contain the template for your web component. For example:

```html
<dom-module id="my-component">
    <template>
        <link rel="import" href="component.css" />
        <div>Some content</div>
    </template>
</dom-module>

<script src="component.js"></script>
```

* The ```id="my-component```" of the dom-module needs to contain your full custom element name. This name needs to contain a prefix with at least one dash (-) in order to provide some scope and avoid collision with other components.

* The css file import needs to be inside the main template tag.

* The last line of this file will import the supporting JavaScript code for you component.

## component.ts

The supporting code for your component resides in the TypeScript file:

```ts
namespace MyProject.WebComponents {
    @Vidyano.WebComponents.WebComponent.register({}, "my")
    export class Component extends Vidyano.WebComponents.WebComponent {
    }
}
```

* This code will register the Component object as the supporting code for your Web Component and set the prefix to ```my```.

* The ```Vidyano.WebComponents.WebComponent``` base class is required for all custom components.

* The first argument to the static ```register``` decorator function on WebComponent is an object that contains the registration information.
Cfr: [Declared properties](https://www.polymer-project.org/1.0/docs/devguide/properties.html), [Events](https://www.polymer-project.org/1.0/docs/devguide/events.html)

  ```ts
  @Vidyano.WebComponents.WebComponent.register({
      properties: {
          // Contains the Polymer properties registration information
      },
      listeners: {},
      observers: []
    }, "my")
  ```

## component.scss

In Vidyano Web², all css is generated via Sass. You are of course free to choose your own css generator or write plain css.

```sass
:host {
    // Your Sass code
}
```

* ```:host``` refers to your component.

* You can take advantage of Polymers Scoped Styling and Custom CSS properties. For more information, please refer to the Polymer website: [Styling local DOM](https://www.polymer-project.org/1.0/docs/devguide/styling.html)

* For more information on Sass, please refer to the [Sass documentation](http://sass-lang.com/).