namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            canClear: {
                type: Boolean,
                computed: "_computeCanClear(value, readOnly)"
            },
            fileName: {
                type: String,
                computed: "_computeFileName(value)"
            }
        },
        observers: [
            "_registerInput(attribute, isConnected)"
        ]
    })
    export class PersistentObjectAttributeBinaryFile extends WebComponents.Attributes.PersistentObjectAttribute {
        private _inputContainer: HTMLDivElement;
        private _inputAttribute: Vidyano.PersistentObjectAttribute;

        private async _change(e: Event) {
            const targetInput = <HTMLInputElement>e.target;
            if (targetInput.files && targetInput.files.length > 0) {
                this.value = targetInput.files[0].name;
                if (this.attribute.triggersRefresh)
                    await this.attribute._triggerAttributeRefresh(true);
            }
        }

        private _registerInput(attribute: Vidyano.PersistentObjectAttribute, isConnected: boolean) {
            if (this._inputAttribute) {
                this._inputAttribute.input = null;
                this._inputAttribute = null;
            }

            if (this._inputContainer)
                this._inputContainer.textContent = "";

            if (attribute && isConnected) {
                this._inputAttribute = attribute;

                const input = document.createElement("input");
                this._inputAttribute.input = input;
                input.type = "file";
                input.accept = this.attribute.getTypeHint("accept");

                if (!this._inputContainer) {
                    this._inputContainer = document.createElement("div");
                    this._inputContainer.setAttribute("slot", "upload");

                    this.appendChild(this._inputContainer);
                }
                this._inputContainer.appendChild(input);
            }
        }

        private _clear() {
            this.value = null;
        }

        private _computeCanClear(value: string, readOnly: boolean): boolean {
            return !readOnly && !StringEx.isNullOrEmpty(value);
        }

        private _computeFileName(value: string): string {
            if (StringEx.isNullOrEmpty(value))
                return "";

            return value.split("|")[0];
        }
    }
}