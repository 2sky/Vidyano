module Vidyano.WebComponents.Attributes {
    @PersistentObjectAttribute.register
    export class PersistentObjectAttributeBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue != this.attribute.value)
                this.attribute.setValue(newValue, true);
        }
    }

    @PersistentObjectAttribute.register({
        properties: {
            options: Array
        }
    })
    export class PersistentObjectAttributeNullableBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        options: Common.KeyValuePair[];

        attached() {
            super.attached();

            if (!this.options && this.attribute) {
                this.options = [
                    {
                        key: null,
                        value: ""
                    },
                    {
                        key: true,
                        value: this.translations[this.attribute.getTypeHint("TrueKey", "Yes")]
                    },
                    {
                        key: false,
                        value: this.translations[this.attribute.getTypeHint("FalseKey", "No")]
                    }];
            }
        }

        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue != this.attribute.value)
                this.attribute.setValue(newValue, true);
        }

        private _notNull(value: any): boolean {
            return value != null;
        }
    }
}