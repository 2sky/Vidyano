# Custom templates

More than often, developers will want to extend Vidyano applications with custom user interface components. The Vidyano Web Client takes advantage of Polymer's ```dom-bind``` template functionality to accomplish this.

## Query templates

The ```vi-query-items-presenter``` component checks for a ```vi-query-config``` element on the the ```vi-app``` that corresponds to the current query. Add a ```<template>``` child element to this configuration element in order to override the complete DOM template for displaying the items of a query.

```html
<vi-query-config id="ba6e297b-5ea8-42a3-8ee9-484ec8768305">
	<template>
		<vi-scroller>
			<template is="dom-repeat" items="{{query.items}}">
				<div>{{item.values.FirstName}}</div>
			</template>
		</vi-scroller>
	</template>
</vi-query-config>
```

## Query Chart templates

The ```vi-query-items-presenter``` component checks for a ```vi-query-chart-config``` element on the the ```vi-app``` that corresponds to the current query. Add a ```<template>``` child element to this configuration element in order to present the data as a custom chart.

```html
<vi-query-chart-config id="ba6e297b-5ea8-42a3-8ee9-484ec8768305">
	<template>
		<my-d3js-chart chart="{{chart}}"></my-d3js-chart>
	</template>
</vi-query-config>
```


## Persistent Object Tab templates

The ```vi-persistent-object-tab-presenter``` component checks for a ```vi-persistent-object-tab-config``` element on the the ```vi-app``` that corresponds to the current persistent object's tab. If you want to override the complete DOM template for a tab, you will simply have to add a ```<template>``` child element to it:

```html
<vi-persistent-object-tab-config type="Customer" name="General">
	<template>
		<div>{{tab.label}}</div>
	</template>
</vi-persistent-object-tab-config>
```

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