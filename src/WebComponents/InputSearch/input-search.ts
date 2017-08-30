namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            value: {
                type: String,
                notify: true,
                value: ""
            },
            hasValue: {
                type: Boolean,
                computed: "_computeHasValue(value)"
            },
            focused: {
                type: Boolean,
                reflectToAttribute: true
            },
            autofocus: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    })
    export class InputSearch extends WebComponent {
        value: string;
        focused: boolean;
        autofocus: boolean;

        connectedCallback() {
            super.connectedCallback();

            if (this.autofocus)
                this.focus();
        }

        private _searchKeypressed(e: KeyboardEvent) {
            if (e.keyCode === 13)
                this._searchClick();
        }

        private _searchClick(e?: Polymer.TapEvent) {
            this.dispatchEvent(new CustomEvent("search", { detail: this.value }));

            if (e && !this.value)
                e.stopPropagation();
        }

        private _resetClick(e?: Polymer.TapEvent) {
            this.dispatchEvent(new CustomEvent("search", { detail: this.value = "" }));

            if (e && !this.value)
                e.stopPropagation();
        }

        private _input_focused() {
            this.focused = true;
        }

        private _input_blurred() {
            this.focused = false;
        }

        private _stop_tap(e: Polymer.TapEvent) {
            e.stopPropagation();
            this.focus();
        }

        private _computeHasValue(value: string): boolean {
            return !!value;
        }

        focus() {
            this.$.input.focus();
        }
    }
}