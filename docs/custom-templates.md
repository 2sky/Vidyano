# Custom templates

More than often, developers will want to extend Vidyano applications with custom user interface components. The Vidyano Web Client takes advantage of Polymer's ```dom-bind``` template functionality to accomplish this.

## Persistent Object Attribute templates

The ```vi-persistent-object-attribute-presenter``` component uses the ```vi-persistent-object-attribute-config``` element for influencing the rendering behavior. If you want to override the complete DOM template for an attribute, you will simply have to add a ```<template>``` child element to it:  

```html
<vi-persistent-object-attribute-config type="String">
	<template>
		<div>{{attribute.displayValue}}</div>
	</template>
</vi-persistent-object-attribute-config>
```

It is worth noting that you are able to reuse the existing attribute controls. For instance, in case you want to keep the default rendering behavior and append it with a button that does something specific:

```html
<vi-persistent-object-attribute-config type="String">
	<template>
		<div class="horizontal layout">
			<vi-persistent-object-attribute-string class="flex" attribute="{{attribute}}"></vi-persistent-object-attribute-string>
			<button>Click me</button>
		</div>
	</template>
</vi-persistent-object-attribute-config>
```