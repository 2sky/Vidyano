module Vidyano.WebComponents {
    @WebComponent.register({
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
    })
    export class Button extends WebComponents.WebComponent {
        private _setCustomLayout: (custom: boolean) => void;

        attached() {
            super.attached();

            this._setCustomLayout(Polymer.dom(this).children.length > 0);
        }
    }
}