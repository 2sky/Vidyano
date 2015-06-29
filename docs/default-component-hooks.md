# Default component insertion points

A lot of the default components have insertion points that developers can take advantage of and add custom UI components without effort. What follows is a list of the most common used.

## Menu

Quite often we see the need to add a component that is available throughout the entire application. For example, a component that allows you to make changes to the session object such as setting the current customer, the year for which to see all the data in the application, and so on. Since this happens frequently, and having to overwrite the entire template for the menu is a bit cumbersome, there is an insertion point on the app that allows you to do this easily. Just add any element under the vi-app and add the ```menu-element``` attribute to it.

Setting the attribute value to <font color="blue">```start```</font> will position it by default between the application label and the search box. Whereas <font color="blue">```end```</font> will position it at the bottom of the menu, right above the user component.

```html
<vi-app uri="...">
	<div menu-element="end">
	    <!-- Custom elements and components -->
	</div>
</vi-app>
```