module Vidyano.WebComponents {
    export class Button extends WebComponents.WebComponent {
    }

    WebComponent.register(Button, WebComponents, "vi", {
        extends: "button",
        properties: {
            inverse: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    });
}