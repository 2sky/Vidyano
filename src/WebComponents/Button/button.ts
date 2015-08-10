module Vidyano.WebComponents {
    export class Button extends WebComponents.WebComponent {
        private _setCustomLayout: (custom: boolean) => void;

        attached() {
            super.attached();

            this._setCustomLayout(Polymer.dom(this).children.length > 0);
        }
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
            },
            customLayout: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            icon: String,
            label: String
        }
    });
}