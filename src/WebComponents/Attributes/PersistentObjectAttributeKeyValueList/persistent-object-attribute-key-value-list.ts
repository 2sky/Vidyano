module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeKeyValueList extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue != this.attribute.value)
                this.attribute.setValue(newValue, true);
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeKeyValueList, {
    });
}