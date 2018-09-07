namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            input: {
                type: String,
            },
            tags: Array,
            editing: Boolean,
            sensitive: Boolean,
            readonly: Boolean,
            editMode: Boolean,
        

        },
        observers: [
            "_onEditingChange(editing, sensitive)"
        ],
        forwardObservers: [
            "editing",
        ]
    })
    export class Tags extends WebComponent {
        private input: string;
        private tags: any[];
        private sensitive: boolean;
        private readonly: boolean;
        private editing: boolean;
        private editMode: boolean;
      
        private _onEditingChange() {
            if (!this.readonly && !this.sensitive)
                this.editMode = this.editing

            else this.editMode = false
        }

        private _pasFocus(e: TapEvent) {
            this.$$("#tagsInput").focus();
        }

        private _checkKeyPress(e: KeyboardEvent) {
            if (e.key == "Enter" && this.input != undefined && this.input != "") {
                this._addTag(this.input);
            }
            else if (this.input != undefined) {
                const newWidth = (this.input.length * 8) + 30;
                this.customStyle["--tags-input--width"] = `${newWidth}px`;
            }
            this.updateStyles();

        }

        private _onInputBlur() {
            if (this.input != undefined && this.input != "") {
                this._addTag(this.input);
            }
            else null
        }

        private _addTag(input: string) {
            if (!((/^\s*$/.test(input)))) {
                    const newItem = new Attributes.PersistentObjectAttributeMultiStringItem(input);
                    newItem.sensitive = this.sensitive;
                    newItem.isReadOnly = this.readonly;
                    this.push("tags", newItem)
                    this.input = undefined;
                this.customStyle["--tags-input--width"] = "30px";
                this.updateStyles();
            }
            else {
                this.input = undefined;
            }
        }

        private _onDeleteTap(e: TapEvent) {
            const tag: string = e.model.tag;
            const index = this.tags.indexOf(tag);
            this.splice("tags", index, 1);
        }

    }
}