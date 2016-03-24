# Session Presenter

A lot of Vidyano projects see the need to offer some global context for the data being displayed, e.g. in function of a specific cost center. This can be done via the Vidyano Session persistent object.

In order to give the user the possibility to switch context, you can add a control to  the application menu with the following insertion point:


```html
<vi-session-presenter vi-menu-element="footer">
    <template is="dom-template">
        <vi-persistent-object-attribute-presenter attribute="[[session.attributes.CostCenter]]" no-label></vi-persistent-object-attribute-presenter>
    </template>
</vi-session-presenter>
```

> Notes:
- Take care to not forget the ```is="dom-template"``` attribute on ```template```.
- Always use one-way bindings to the session object properties.