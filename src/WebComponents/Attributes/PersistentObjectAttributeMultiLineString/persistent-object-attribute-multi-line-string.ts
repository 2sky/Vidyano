module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeMultiLineString extends PersistentObjectAttribute {
        maxlength: number;
        height: string; // TODO(sleeckx): Implement height

        protected _attributeChanged() {
            super._attributeChanged();

            if (this.attribute) {
                var maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                this.maxlength = maxlength > 0 ? maxlength : null;
            }
        }

        private _editTextAreaBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true);
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeMultiLineString, {
        properties: {
            maxlength: Number
        }
    }, ctor => {
            Attributes["PersistentObjectAttributeMultiString"] = ctor;
        });
}