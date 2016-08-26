namespace Vidyano.WebComponents {
    "use strict";

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
            elevation: {
                type: Number,
                reflectToAttribute: true
            },
            icon: String,
            label: String
        },
        listeners: {
            "tap": "_tap"
        }
    })
    export class Button extends WebComponents.WebComponent {
        disabled: boolean;

        private _setCustomLayout: (custom: boolean) => void;

        attached() {
            super.attached();

            this._setCustomLayout(Polymer.dom(this).children.length > 0);
        }

        private _tap(e: TapEvent) {
            if (this.disabled) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }
    }
}