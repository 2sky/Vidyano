namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            canToggle: {
                type: Boolean,
                computed: "_computeCanToggle(editing, readOnly)"
            },
            defaultInputtype: {
                type: String,
                readOnly: true
            },
            checkBox: {
                type: Boolean,
                computed: "_computeCheckBox(attribute, defaultInputtype)"
            }
        }
    })
    export class PersistentObjectAttributeBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        readonly defaultInputtype: string; private _setDefaultInputtype: (defaultInputtype: string) => void;

        connectedCallback() {
            super.connectedCallback();

            this._setDefaultInputtype(this.app.configuration.getSetting("vi-persistent-object-attribute-boolean.inputtype", "toggle").toLowerCase());
        }

        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, true).catch(Vidyano.noop);
        }

        private _computeCanToggle(editing: boolean, isReadOnly: boolean): boolean {
            return editing && !isReadOnly;
        }

        private _computeIsDisabled(isReadOnly: boolean, isFrozen: boolean): boolean {
            return isReadOnly || isFrozen;
        }

        private _computeCheckBox(attribute: Vidyano.PersistentObjectAttribute, defaultInputtype: string): boolean {
            return attribute.getTypeHint("inputtype", defaultInputtype, undefined, true) === "checkbox";
        }
    }

    @WebComponent.register({
        properties: {
            booleanOptions: {
                type: Array,
                computed: "_computeBooleanOptions(attribute, translations)"
            }
        }
    })
    export class PersistentObjectAttributeNullableBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        private _computeBooleanOptions(attribute: Vidyano.PersistentObjectAttribute): KeyValuePair<boolean, string>[] {
            const options = attribute.type.startsWith("Nullable") ? [
                {
                    key: null,
                    value: ""
                }
            ] : [];

            return options.concat([
                {
                    key: true,
                    value: this.translations[this.attribute.getTypeHint("TrueKey", "Yes")]
                },
                {
                    key: false,
                    value: this.translations[this.attribute.getTypeHint("FalseKey", "No")]
                }
            ]);
        }

        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, true).catch(Vidyano.noop);
        }

        private _notNull(value: any): boolean {
            return value != null;
        }

        private _isDisabled(isReadOnly: boolean, isFrozen: boolean): boolean {
            return isReadOnly || isFrozen;
        }
    }
}