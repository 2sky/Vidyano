namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register
    export class PersistentObjectAttributePassword extends WebComponents.Attributes.PersistentObjectAttribute {
        private _editInputBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true);
        }
    }
}