module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        toggle() {
            if (this.attribute.parent.isEditing && !this.attribute.isReadOnly)
                this.value = this.value ? false : true; // If value was null, we also toggle to 'true'
        }
    }

    export class PersistentObjectAttributeNullableBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        options: Common.KeyValuePair[];

        attached() {
            super.attached();

            if (!this.options) {
                this.options = [
                    {
                        key: null,
                        value: ""
                    },
                    {
                        key: true,
                        value: this.translations.Yes
                    },
                    {
                        key: false,
                        value: this.translations.No
                    }];
            }
        }

        private _notNull(value: any): boolean {
            return value !== null;
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeBoolean, {
        listeners: {
            "tap": "toggle"
        }
    }, ctor => {
            Attributes["PersistentObjectAttributeYesNo"] = ctor;
        });

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeNullableBoolean, {
        properties: {
            options: Array
        }
    });
}