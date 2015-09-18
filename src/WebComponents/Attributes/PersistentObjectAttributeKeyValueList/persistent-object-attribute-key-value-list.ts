module Vidyano.WebComponents.Attributes {
    @PersistentObjectAttribute.register
    export class PersistentObjectAttributeKeyValueList extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue != this.attribute.value)
                this.attribute.setValue(newValue, true);
        }
    }
}