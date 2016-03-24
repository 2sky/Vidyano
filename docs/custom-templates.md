# Custom templates

The Vidyano Web² client allows developers to override the DOM template for persistent objects, tabs, attributes and queries. Templates are matched to the Vidyano model via configuration elements on ```vi-app```. To override the entire DOM template, simply add a ```<template is="dom-template">``` child element.

## Query templates

The ```vi-query-items-presenter``` component checks for a ```vi-query-config``` element on the the ```vi-app``` that corresponds to the current query.

```html
<vi-query-config id="ba6e297b-5ea8-42a3-8ee9-484ec8768305">
	<template is="dom-template">
		<vi-scroller>
			<template is="dom-repeat" items="[[query.items]]">
				<div>[[item.values.FirstName]]</div>
			</template>
		</vi-scroller>
	</template>
</vi-query-config>
```

#### Bound properties
| Property      | Description                 |
| ------------- | --------------------------- |
| query         | Represents the query object |

## Persistent Object templates

The ```vi-persistent-object-presenter``` component checks for a ```vi-persistent-object-config``` element on the the ```vi-app``` that corresponds to the current persistent object.

```html
<vi-persistent-object-config id="506ddde6-6eb1-41f6-af9b-399474fd69a5">
	<template is="dom-template">
		<h1>[[persistentObject.label]]</h1>
		<vi-scroller>
			<div>
				<vi-persistent-object-attribute-presenter attribute="[[persistentObject.attributes.FirstName]]" non-edit no-label></vi-persistent-object-attribute-presenter>
				<vi-persistent-object-attribute-presenter attribute="[[persistentObject.attributes.LastName]]"></vi-persistent-object-attribute-presenter>
			</div>
		</vi-scroller>
	</template>
</vi-persistent-object-config>
```

#### Bound properties
| Property         | Description                      |
| ---------------- | -------------------------------- |
| persistentObject | Represents the persistent object |

## Persistent Object Tab templates

The ```vi-persistent-object-tab-presenter``` component checks for a ```vi-persistent-object-tab-config``` element on the the ```vi-app``` that corresponds to the current persistent object tab.

```html
<vi-persistent-object-tab-config type="Customer" name="Customer">
	<template is="dom-template">
		<div>
			<h1>[[tab.label]]</h1>
			<div>
				<template is="dom-repeat" items="[[tab.attributes]]" as="attribute">
					<div>[[attribute.label]]: [[attribute.displayValue]]</div>
				</template>
			</div>
		</div>
	</template>
</vi-persistent-object-tab-config>
```

#### Bound properties
| Property | Description                          |
| -------- | ------------------------------------ |
| tab      | Represents the persistent object tab |

## Persistent Object Attribute templates

The ```vi-persistent-object-attribute-presenter``` component uses the ```vi-persistent-object-attribute-config``` element for tweaking the rendering behavior.

```html
<vi-persistent-object-attribute-config type="String">
	<template is="dom-template">
		<div>[[attribute.displayValue]]</div>
	</template>
</vi-persistent-object-attribute-config>
```

#### Bound properties
| Property  | Description                                |
| --------- | ------------------------------------------ |
| attribute | Represents the persistent object attribute |

It is worth noting that you are able to reuse the existing attribute controls. For instance, in case you want to keep the default rendering behavior and append it with a button that does something specific:

```html
<vi-persistent-object-attribute-config type="String">
	<template is="dom-template">
		<div class="horizontal layout">
			<vi-persistent-object-attribute-string class="flex" attribute="[[attribute]]"></vi-persistent-object-attribute-string>
			<button>Click me</button>
		</div>
	</template>
</vi-persistent-object-attribute-config>
```