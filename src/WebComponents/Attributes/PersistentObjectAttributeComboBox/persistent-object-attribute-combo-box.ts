namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            newValue: {
                type: String,
                value: null,
                notify: true
            },
            comboBoxOptions: {
                type: Array,
                readOnly: true
            },
            canAdd: {
                type: Boolean,
                computed: "_computeCanAdd(newValue, comboBoxOptions)"
            }
        }
    })
    export class PersistentObjectAttributeComboBox extends WebComponents.Attributes.PersistentObjectAttribute {
        readonly comboBoxOptions: string[]; private _setComboBoxOptions: (options: string[]) => void;
        newValue: string;

        protected _editingChanged() {
            super._editingChanged();

            if (this.newValue) {
                this.newValue = null;
                this._optionsChanged();
            }
        }

        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, true).catch(Vidyano.noop);
        }

        protected _optionsChanged() {
            const options = this.attribute.options ? (<string[]>this.attribute.options).slice() : [];

            let empty = options.indexOf(null);
            if (empty < 0)
                empty = options.indexOf("");

            if (options.indexOf(this.attribute.value) < 0) {
                options.splice(empty >= 0 ? empty + 1 : 0, 0, this.attribute.value);
            }

            this._setComboBoxOptions(options);
        }

        private _add() {
            this.value = this.newValue;
            this._optionsChanged();
        }

        private _computeCanAdd(newValue: string, options: string[]): boolean {
            return newValue != null && options && !options.some(o => o === newValue);
        }

        protected _onFocus(e: FocusEvent) {
            this._focusElement(this.shadowRoot.querySelector("vi-select"));
        }
    }
}