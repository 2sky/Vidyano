namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            characterCasing: {
                type: String,
                readOnly: true,
                observer: "_characterCasingChanged"
            },
            editInputStyle: {
                type: String,
                readOnly: true
            },
            suggestions: {
                type: Array,
                readOnly: true
            },
            hasSuggestions: {
                type: Boolean,
                computed: "_computeHasSuggestions(filteredSuggestions, readOnly)"
            },
            filteredSuggestions: {
                type: Array,
                computed: "_computeFilteredSuggestions(suggestions, value)"
            },
            inputtype: {
                type: String,
                readOnly: true
            },
            maxlength: {
                type: Number,
                readOnly: true
            },
            link: {
                type: String,
                computed: "_computeLink(attribute, attribute.value)"
            },
            linkTitle: {
                type: String,
                computed: "_computeLinkTitle(attribute.displayValue, sensitive)"
            }
        },
    })
    export class PersistentObjectAttributeString extends PersistentObjectAttribute {
        private _suggestionsSeparator: string;
        readonly editInputStyle: string; private _setEditInputStyle: (style: string) => void;
        readonly suggestions: string[]; private _setSuggestions: (suggestions: string[]) => void;
        readonly inputtype: string; private _setInputtype: (inputtype: string) => void;
        readonly characterCasing: string; private _setCharacterCasing: (characterCasing: string) => void;
        readonly maxlength: number; private _setMaxlength: (maxlength: number) => void;

        protected _attributeChanged() {
            super._attributeChanged();

            if (this.attribute instanceof Vidyano.PersistentObjectAttribute) {
                this._setCharacterCasing(this.attribute.getTypeHint("CharacterCasing", "Normal"));
                this._setInputtype(this.attribute.getTypeHint("InputType", "text"));
                const maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                this._setMaxlength(maxlength > 0 ? maxlength : null);

                this._suggestionsSeparator = this.attribute.getTypeHint("SuggestionsSeparator");
                if (this._suggestionsSeparator != null && this.attribute.options != null && this.attribute.options.length > 0) {
                    const value = <string>this.attribute.value;
                    this._setSuggestions((<string[]>this.attribute.options).filter(o => !StringEx.isNullOrEmpty(o) && (value == null || !value.contains(o))));
                }
            }
        }

        private _editInputBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true).catch(Vidyano.noop);
        }

        private _editInputFocus(e: FocusEvent) {
            const input = <HTMLInputElement>e.target;
            if (!input.value || !this.attribute.getTypeHint("SelectAllOnFocus"))
                return;

            input.selectionStart = 0;
            input.selectionEnd = input.value.length;
        }

        protected _valueChanged(value: any, oldValue: any) {
            let selection: number[];
            let input: HTMLInputElement;

            if (this.editing && value && this.characterCasing !== "Normal") {
                value = this.characterCasing === "Upper" ? value.toUpperCase() : value.toLowerCase();
                if (value !== this.value) {
                    input = <HTMLInputElement>this.$.input || <HTMLInputElement>this.shadowRoot.querySelector("input");
                    if (input != null)
                        selection = [input.selectionStart, input.selectionEnd];
                }
            }

            if (value === this.value)
                super._valueChanged(value, oldValue);
            else
                this.attribute.setValue(value, false).catch(Vidyano.noop);

            if (selection != null) {
                input.selectionStart = selection[0];
                input.selectionEnd = selection[1];
            }
        }

        private _characterCasingChanged(casing: string) {
            if (casing === "Upper")
                this._setEditInputStyle("text-transform: uppercase;");
            else if (casing === "Lower")
                this._setEditInputStyle("text-transform: lowercase;");
            else
                this._setEditInputStyle(undefined);
        }

        private _addSuggestion(e: Polymer.TapEvent) {
            const suggestion = e.model.suggestion;
            this.attribute.setValue(StringEx.isNullOrEmpty(this.value) ? suggestion : (this.value.endsWith(this._suggestionsSeparator) ? this.value + suggestion : this.value + this._suggestionsSeparator + suggestion)).catch(Vidyano.noop);
        }

        private _computeFilteredSuggestions(suggestions: string[], value: string): string[] {
            if (!suggestions || suggestions.length === 0)
                return [];

            if (StringEx.isNullOrEmpty(value))
                return suggestions;

            return suggestions.filter(s => value.indexOf(s) < 0);
        }

        private _computeHasSuggestions(suggestions: string[], readOnly: boolean): boolean {
            return !readOnly && suggestions && suggestions.length > 0;
        }

        private _computeLink(attribute: Vidyano.PersistentObjectAttribute, value: string): string {
            const link = attribute.getTypeHint("Link", "").toLowerCase();
            if (!link)
                return null;

            return link === "email" ? `mailto:${value}` : (!!value ? value : null);
        }

        private _computeLinkTitle(displayValue: string, sensitive: boolean): string {
            return !sensitive ? displayValue : "";
        }
    }
}