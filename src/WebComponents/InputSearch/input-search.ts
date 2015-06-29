module Vidyano.WebComponents {
    export class InputSearch extends WebComponent {
        value: string;
        focused: boolean;

        private _searchKeypressed(e: KeyboardEvent) {
            if (e.keyCode == 13) {
                var input = <HTMLInputElement>this.$["input"];
                input.blur();

                this._searchClick();
            }
        }

        private _searchClick() {
            this.fire("search", this.value);
        }

        private _input_focused() {
            this.focused = true;
        }

        private _input_blurred() {
            this.focused = false;
        }

        focus() {
            this.$["input"].focus();
        }
    }

    WebComponent.register(InputSearch, WebComponents, "vi", {
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
    });
}