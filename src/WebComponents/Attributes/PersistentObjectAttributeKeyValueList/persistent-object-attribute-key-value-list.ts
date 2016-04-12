namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            radio: {
                type: Boolean,
                computed: "_computeRadio(attribute)"
            }
        }
    })
    export class PersistentObjectAttributeKeyValueList extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, true);
        }

        private _computeRadio(attribute: Vidyano.PersistentObjectAttribute): boolean {
            return attribute && attribute.getTypeHint("inputtype", undefined, undefined, true) === "radio";
        }

        private _isRadioChecked(option: Vidyano.Common.IKeyValuePair, value: string): boolean {
            return option == null && value == null || (option && option.key === value);
        }

        private _radioLabel(option: Vidyano.Common.IKeyValuePair): string {
            return option.value != null ? option.value : "—";
        }

        private _radioChanged(e: CustomEvent) {
            e.stopPropagation();

            this.attribute.setValue((<any>e).model.option.key, true);
        }
    }
}