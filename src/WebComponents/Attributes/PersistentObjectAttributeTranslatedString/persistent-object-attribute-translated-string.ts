namespace Vidyano.WebComponents.Attributes {
    "use strict";

    export interface ITranslatedString {
        key: string;
        label: string;
        value: string;
    }

    @PersistentObjectAttribute.register({
        properties: {
            strings: {
                type: Array,
                readOnly: true
            },
            multiline: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeMultiline(attribute)"
            },
            canShowDialog: {
                type: Boolean,
                computed: "_computeCanShowDialog(strings)"
            }
        }
    })
    export class PersistentObjectAttributeTranslatedString extends PersistentObjectAttribute {
        private _defaultLanguage: string;
        strings: ITranslatedString[];
        multiline: boolean;

        private _setStrings: (strings: ITranslatedString[]) => void;

        protected _optionsChanged(options: string[] | Common.IKeyValuePair[]) {
            super._optionsChanged(options);

            const strings: ITranslatedString[] = [];
            this._defaultLanguage = <string>this.attribute.options[1];
            const data = JSON.parse(<string>this.attribute.options[0]);
            const labels = JSON.parse(<string>this.attribute.options[2]);

            for (const key in labels) {
                strings.push({
                    key: key,
                    value: data[key] || "",
                    label: labels[key]
                });
            }

            this._setStrings(strings);
        }

        protected _valueChanged(newValue: string) {
            if (newValue === this.attribute.value)
                return;

            super._valueChanged(newValue);

            Enumerable.from(this.strings).first(s => s.key === this._defaultLanguage).value = newValue;

            const newOption = {};
            this.strings.forEach(val => {
                newOption[val.key] = val.value;
            });

            this.set("attribute.options.0", JSON.stringify(newOption));
        }

        private _editInputBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true).catch(Vidyano.noop);
        }

        private _computeMultiline(attribute: Vidyano.PersistentObjectAttribute): boolean {
            return attribute && attribute.getTypeHint("MultiLine") === "True";
        }

        private _computeCanShowDialog(strings: ITranslatedString[]) {
            return strings.length > 1;
        }

        private async _showLanguagesDialog() {
            if (this.readOnly)
                return;

            const result = await this.app.showDialog(new Vidyano.WebComponents.Attributes.PersistentObjectAttributeTranslatedStringDialog(this.attribute.label, this.strings.slice(), this.multiline, this.readOnly));
            if (!result)
                return;

            const newData = {};
            result.forEach(s => {
                newData[s.key] = this.strings[s.key] = s.value;
                if (s.key === this._defaultLanguage)
                    this.attribute.value = s.value;
            });

            this.attribute.options[0] = JSON.stringify(newData);

            this.attribute.isValueChanged = true;
            this.attribute.parent.triggerDirty();

            await this.attribute.setValue(this.value = this.attribute.value, true);
        }
    }

    @Dialog.register({
        properties: {
            label: String,
            strings: Array,
            readonly: Boolean,
            multiline: {
                type: Boolean,
                reflectToAttribute: true,
            }
        }
    })
    export class PersistentObjectAttributeTranslatedStringDialog extends Dialog {
        constructor(public label: string, public strings: ITranslatedString[], public multiline: boolean, public readonly: boolean) {
            super();
        }

        private _ok() {
            this.close(this.strings);
        }

        private _onCaptureTab() {
            // Skip default tab navigation behavior
        }
    }
}