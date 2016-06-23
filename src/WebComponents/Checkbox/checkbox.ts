namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            checked: {
                type: Boolean,
                reflectToAttribute: true,
                notify: true
            },
            label: String,
            isNull: {
                type: Boolean,
                value: true,
                computed: "_computeIsNull(checked)"
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            },
            radio: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
        },
        hostAttributes: {
            "tabindex": 0
        },
        listeners: {
            "tap": "toggle"
        },
        keybindings: {
            "space": "toggle",
            "enter": "toggle"
        }
    })
    export class Checkbox extends WebComponents.WebComponent {
        checked: boolean;
        label: string;
        disabled: boolean;
        radio: boolean;

        toggle() {
            if (this.disabled)
                return;

            if (!this.radio)
                this.checked = !this.checked;
            else
                this.fire("changed", null);
        }

        private _computeIsNull(checked: boolean): boolean {
            return checked !== false && checked !== true;
        }

        private _computeIcon(radio: boolean): string {
            return !radio ? "Selected" : "SelectedRadio";
        }
    }
}