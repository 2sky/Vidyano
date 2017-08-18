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
            label: String,
            busy: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        listeners: {
            "tap": "_tap"
        }
    })
    export class Button extends WebComponents.WebComponent {
        readonly customLayout: boolean; private _setCustomLayout: (custom: boolean) => void;
        disabled: boolean;

        connectedCallback() {
            super.connectedCallback();

            this._setCustomLayout(Array.from(this.children).length > 0);
        }

        private _tap(e: TapEvent) {
            if (this.disabled) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }
    }
}