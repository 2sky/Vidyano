module Vidyano.WebComponents {
    export class Button extends WebComponents.WebComponent {
    }

    WebComponent.register(Button, WebComponents, "vi", {
        extends: "button",
        properties: {
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            },
            inverse: {
                type: String,
                reflectToAttribute: true
            }
        }
    });
}