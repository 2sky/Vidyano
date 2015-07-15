module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        toggle() {
            if (this.attribute.parent.isEditing && !this.attribute.isReadOnly)
                this.attribute.setValue(!this.value); // If value was null, we also toggle to 'true'
        }
    }

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

        private _notNull(value: any): boolean {
            return value != null;
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeBoolean, {
        listeners: {
            "tap": "toggle"
        }
    });

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeNullableBoolean, {
        properties: {
            options: Array
        }
    });
}