namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register
    export class PersistentObjectAttributeBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, true).catch(Vidyano.noop);
        }
    }

    @PersistentObjectAttribute.register({
        properties: {
            options: {
                type: Array,
                computed: "_computeOptions(attribute, isAttached)"
            }
        }
    })
    export class PersistentObjectAttributeNullableBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        private _computeOptions(attribute: Vidyano.PersistentObjectAttribute): Common.IKeyValuePair[] {
            if (!attribute)
                return [];

            const options = attribute.type.startsWith("Nullable") ? [
                {
                    key: null,
                    value: ""
                }
            ] : [];

            return options.concat([
                {
                    key: true,
                    value: this.translations[this.attribute.getTypeHint("TrueKey", "Yes")]
                },
                {
                    key: false,
                    value: this.translations[this.attribute.getTypeHint("FalseKey", "No")]
                }
            ]);
        }

        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, true).catch(Vidyano.noop);
        }

        private _notNull(value: any): boolean {
            return value != null;
        }
    }
}