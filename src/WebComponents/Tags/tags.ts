namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            input: String,
            tags: Array,
            readonly: {
                type: Boolean,
                reflectToAttribute: true
            },
            sensitive: {
                type: Boolean,
                reflectToAttribute: true,
                value: true
            }
        }
    })
    export class Tags extends WebComponent {
        input: string;
        tags: string[];
        readonly: boolean;

        private _passFocus(e: TapEvent) {
            if (this.readonly)
                return;

            const input = <HTMLInputElement>Polymer.dom(this.root).querySelector("#tagsInput");
            if (!input)
                return;

            input.focus();

            const scroller = <Scroller>Polymer.dom(this.root).querySelector("#scroller");
            scroller.scrollToBottom();
        }

        private _checkKeyPress(e: KeyboardEvent) {
            if (!this.input)
                return;

            if (e.keyCode === Keyboard.KeyCodes.enter)
                this._addTag(this.input);
            else {
                const newWidth = (this.input.length * 8) + 30;
                this.customStyle["--tags-input--width"] = `${newWidth}px`;
                this.updateStyles();
            }
        }

        private _onInputBlur() {
            if (!this.input || this.readonly) {
                this.input = "";
                return;
            }

            this._addTag(this.input);
        }

        private _addTag(input: string) {
            if (!((/^\s*$/.test(input)))) {
                this.push("tags", input);
                this.input = undefined;
                this.customStyle["--tags-input--width"] = "30px";
                this.updateStyles();
            }
            else
                this.input = undefined;
        }

        private _onDeleteTap(e: TapEvent) {
            this.splice("tags", this.tags.indexOf(e.model.tag), 1);
        }
    }
}