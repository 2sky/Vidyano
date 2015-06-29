module Vidyano.WebComponents {
    export class Checkbox extends WebComponents.WebComponent {
        checked: boolean;
        label: string;
        disabled: boolean;

        toggle() {
            if (this.disabled)
                return;

            this.checked = !!!this.checked;
        }
    }

    WebComponent.register(Checkbox, WebComponents, "vi", {
        properties: {
            checked: {
                type: Boolean,
                reflectToAttribute: true,
                notify: true
            },
            label: String,
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        listeners: {
            "tap": "toggle"
        }
    });
}