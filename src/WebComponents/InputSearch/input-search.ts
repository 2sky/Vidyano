module Vidyano.WebComponents {
    export class InputSearch extends WebComponent {
        value: string;
        focused: boolean;
        collapsed: boolean;

        private _searchKeypressed(e: KeyboardEvent) {
            if (e.keyCode == 13) {
                var input = <HTMLInputElement>this.$$("#input");
                if (input)
                    input.blur();

                this._searchClick();
            }
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
            setTimeout(() => {
                var input = (<HTMLInputElement>this.$$("#input"));
                if (input)
                    input.focus();
            }, 100);
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
            },
            collapsed: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
        }
    });
}