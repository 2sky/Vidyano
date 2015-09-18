module Vidyano.WebComponents {
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
            }
        },
        listeners: {
            "tap": "toggle"
        }
    })
    export class Checkbox extends WebComponents.WebComponent {
        checked: boolean;
        label: string;
        disabled: boolean;

        toggle() {
            if (this.disabled)
                return;

            this.checked = !!!this.checked;
        }

        private _computeIsNull(checked: boolean): boolean {
            return checked !== false && checked !== true;
        }
    }
}