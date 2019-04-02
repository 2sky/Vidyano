namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            toggled: {
                type: Boolean,
                reflectToAttribute: true,
                notify: true
            },
            label: {
                type: String,
                value: null
            },
            isNull: {
                type: Boolean,
                value: true,
                computed: "_computeIsNull(toggled)"
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        hostAttributes: {
            "tabindex": "0"
        },
        listeners: {
            "tap": "toggle"
        },
        keybindings: {
            "space": "_keyToggle",
            "enter": "_keyToggle"
        }
    })
    export class Toggle extends WebComponents.WebComponent {
        toggled: boolean;
        label: string;
        disabled: boolean;
        radio: boolean;

        toggle() {
            if (this.disabled)
                return;

            this.toggled = !this.toggled;
        }

        private _keyToggle(e: KeyboardEvent) {
            if (document.activeElement !== this)
                return true;

            this.toggle();
        }

        private _computeIsNull(toggled: boolean): boolean {
            return toggled !== false && toggled !== true;
        }
    }
}