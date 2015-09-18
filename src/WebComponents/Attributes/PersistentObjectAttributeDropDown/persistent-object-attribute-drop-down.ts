module Vidyano.WebComponents.Attributes {
    @PersistentObjectAttribute.register
    export class PersistentObjectAttributeDropDown extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue != this.attribute.value)
                this.attribute.setValue(newValue, true);
        }
    }
}