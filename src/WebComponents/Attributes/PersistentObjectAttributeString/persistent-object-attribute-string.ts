module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeString extends PersistentObjectAttribute {
        characterCasing: string;
        editInputStyle: string;
        inputtype: string;
        maxlength: number;
        suggestions: string[]; // TODO(sleeckx): Implement suggestions

        private _setEditInputStyle: (style: string) => void;

        protected _attributeChanged() {
            super._attributeChanged();

            if (this.attribute instanceof Vidyano.PersistentObjectAttribute) {
                this.characterCasing = this.attribute.getTypeHint("CharacterCasing", "Normal");
                this.inputtype = this.attribute.getTypeHint("InputType", "text");
                var maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                this.maxlength = maxlength > 0 ? maxlength : null;

                var suggestionsSeparator = this.attribute.getTypeHint("SuggestionsSeparator");
                if (suggestionsSeparator != null && this.attribute.options != null && this.attribute.options.length > 0) {
                    var value = <string>this.attribute.value;
                    this.suggestions = (<string[]>this.attribute.options).filter(o => !StringEx.isNullOrEmpty(o) && (value == null || !value.contains(o)));
                }
            }
        }

        private _editInputBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true);
        }

        protected _valueChanged() {
            var newValue = this._changeCasing(this.value);
            if (newValue == this.value)
                super._valueChanged(newValue);
            else
                this.attribute.setValue(newValue, false);
        }

        //private _addSuggestion(e: MouseEvent) {
        //    var value = <string>this.target.value;
        //    var suggestionsSeparator = this.target.getTypeHint("SuggestionsSeparator");
        //    var option = (<Paper.PaperItem>e.target).label;
        //    this.target.setValue(StringEx.isNullOrEmpty(value) ? option : (value.endsWith(suggestionsSeparator) ? value + option : value + suggestionsSeparator + option));
        //    this.suggestions.remove(option);
        //}

        private _characterCasingChanged(casing: string) {
            if (casing == "Upper")  
                this._setEditInputStyle("text-transform: uppercase;");
            else if (casing == "Lower")
                this._setEditInputStyle("text-transform: lowercase;");
            else
                this._setEditInputStyle(undefined);
        }

        private _changeCasing(val: string) {
            if (val == null)
                return null;

            if (this.characterCasing == "Normal")
                return val;

            return this.characterCasing == "Upper" ? val.toUpperCase() : val.toLowerCase();
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeString, {
        properties: {
            characterCasing: {
                type: String,
                observer: "_characterCasingChanged"
            },
            editInputStyle: {
                type: String,
                readOnly: true
            },
            suggestions: Array,
            inputtype: String,
            maxlength: Number,
        },
    },
        ctor => {
            Attributes["PersistentObjectAttributeGuid"] = ctor;
            Attributes["PersistentObjectAttributeNullableGuid"] = ctor;
        });
}