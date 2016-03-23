namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            maxlength: Number
        }
    })
    export class PersistentObjectAttributeMultiLineString extends PersistentObjectAttribute {
        maxlength: number;

        protected _attributeChanged() {
            super._attributeChanged();

            if (this.attribute) {
                const maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                this.maxlength = maxlength > 0 ? maxlength : null;
            }
        }

        private _editTextAreaBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true);
        }
    }
}