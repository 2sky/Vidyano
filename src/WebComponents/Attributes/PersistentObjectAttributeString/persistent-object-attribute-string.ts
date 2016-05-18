namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            characterCasing: {
                type: String,
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
            inputtype: String,
            maxlength: Number,
        },
    })
    export class PersistentObjectAttributeString extends PersistentObjectAttribute {
        private _suggestionsSeparator: string;
        characterCasing: string;
        editInputStyle: string;
        inputtype: string;
        maxlength: number;
        suggestions: string[];

        private _setEditInputStyle: (style: string) => void;
        private _setSuggestions: (suggestions: string[]) => void;

        protected _attributeChanged() {
            super._attributeChanged();

            if (this.attribute instanceof Vidyano.PersistentObjectAttribute) {
                this.characterCasing = this.attribute.getTypeHint("CharacterCasing", "Normal");
                this.inputtype = this.attribute.getTypeHint("InputType", "text");
                const maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                this.maxlength = maxlength > 0 ? maxlength : null;

                this._suggestionsSeparator = this.attribute.getTypeHint("SuggestionsSeparator");
                if (this._suggestionsSeparator != null && this.attribute.options != null && this.attribute.options.length > 0) {
                    const value = <string>this.attribute.value;
                    this._setSuggestions((<string[]>this.attribute.options).filter(o => !StringEx.isNullOrEmpty(o) && (value == null || !value.contains(o))));
                }
            }
        }

        private _editInputBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true).catch(() => { });
        }

        protected _valueChanged() {
            const newValue = this._changeCasing(this.value);
            if (newValue === this.value)
                super._valueChanged(newValue);
            else
                this.attribute.setValue(newValue, false).catch(() => { });
        }

        private _addSuggestion(e: TapEvent) {
            const suggestion = e.model.suggestion;
            this.attribute.setValue(StringEx.isNullOrEmpty(this.value) ? suggestion : (this.value.endsWith(this._suggestionsSeparator) ? this.value + suggestion : this.value + this._suggestionsSeparator + suggestion)).catch(() => { });
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

        private _characterCasingChanged(casing: string) {
            if (casing === "Upper")
                this._setEditInputStyle("text-transform: uppercase;");
            else if (casing === "Lower")
                this._setEditInputStyle("text-transform: lowercase;");
            else
                this._setEditInputStyle(undefined);
        }

        private _changeCasing(val: string) {
            if (val == null)
                return null;

            if (this.characterCasing === "Normal")
                return val;

            return this.characterCasing === "Upper" ? val.toUpperCase() : val.toLowerCase();
        }
    }
}