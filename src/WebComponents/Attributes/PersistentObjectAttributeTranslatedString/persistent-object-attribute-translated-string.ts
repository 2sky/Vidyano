module Vidyano.WebComponents.Attributes {
    //x TODO
    //x http://localhost/VidyanoWeb2/#!/Management/PersistentObject.27d6baf2-ecb3-4eec-82f6-eb415b8987f9/ActionNotImplemented

    export interface TranslatedString {
        key: string;
        label: string;
        value: string;
    }

    export class PersistentObjectAttributeTranslatedString extends PersistentObjectAttribute {
        private _defaultLanguage: string;
        strings: TranslatedString[];

        protected _optionsChanged() {
            super._optionsChanged();

            var strings: TranslatedString[] = [];
            this._defaultLanguage = <string>this.attribute.options[1];
            var data = JSON.parse(<string>this.attribute.options[0]);
            var labels = JSON.parse(<string>this.attribute.options[2]);

            for (var key in labels) {
                strings.push({
                    key: key,
                    value: data[key] || "",
                    label: labels[key]
                });
            }

            this.strings = strings;
        }

        protected _valueChanged(newValue: string) {
            if (newValue === this.attribute.value)
                return;

            super._valueChanged(newValue);

            Enumerable.from(this.strings).first(s => s.key == this._defaultLanguage).value = newValue;

            var newOption = {};
            this.strings.forEach(val => {
                newOption[val.key] = val.value;
            });

            this.set("attribute.options[0]", JSON.stringify(newOption));
        }

        private _editInputBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true);
        }

        private _computeMultiLine(attribute: Vidyano.PersistentObjectAttribute): boolean {
            return attribute && attribute.getTypeHint("MultiLine") == "True";
        }

        private _showLanguagesDialog() {
            var dialog = <PersistentObjectAttributeTranslatedStringDialog>this.$$("#dialog");
            dialog.strings = this.strings.slice();

            return dialog.show().then(result => {
                if (!result)
                    return;

                var newData = {};
                result.forEach(s => {
                    newData[s.key] = this.strings[s.key] = s.value;
                    if (s.key === this._defaultLanguage)
                        this.attribute.value = s.value;
                });

                this.attribute.options[0] = JSON.stringify(newData);

                this.attribute.isValueChanged = true;
                this.attribute.parent.triggerDirty();

                this.attribute.setValue(this.value = this.attribute.value, true);
            });
        }
    }

    export class PersistentObjectAttributeTranslatedStringDialog extends WebComponent {
        private _dialog: DialogInstance;
        label: string;
        strings: TranslatedString[];

        show(): Promise<any> {
            var dialog = <Vidyano.WebComponents.Dialog><any>this.$["dialog"];
            this._dialog = dialog.show();

            return this._dialog.result;
        }

        private _ok() {
            this._dialog.resolve(this.strings);
        }

        private _cancel() {
            this._dialog.reject(null);
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeTranslatedString, {
        properties: {
            multiline: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeMultiLine(attribute)"
            }
        }
    });

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Attributes.PersistentObjectAttributeTranslatedStringDialog, Vidyano.WebComponents, "vi",
        {
            properties: {
                label: String,
                strings: Array,
                multiline: {
                    type: Boolean,
                    reflectToAttribute: true,
                }
            }
        });
}