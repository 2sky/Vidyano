namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            value: {
                type: String,
                notify: true,
                value: ""
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

        attached() {
            super.attached();

            if (this.autofocus)
                this.focus();
        }

        private _searchKeypressed(e: KeyboardEvent) {
            if (e.keyCode === 13)
                this._searchClick();
        }

        private _searchClick(e?: TapEvent) {
            this.fire("search", this.value);

            if (e && !this.value)
                e.stopPropagation();
        }

        private _input_focused() {
            this.focused = true;
        }

        private _input_blurred() {
            this.focused = false;
        }

        private _stop_tap(e: TapEvent) {
            e.stopPropagation();
            this.focus();
        }

        focus() {
            this.$["input"].focus();
        }
    }
}