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
    export class PersistentObjectAttributeDropDown extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, true).catch(Vidyano.noop);
        }

        private _computeRadio(attribute: Vidyano.PersistentObjectAttribute): boolean {
            return attribute && attribute.getTypeHint("inputtype", undefined, undefined, true) === "radio";
        }

        private _isRadioChecked(option: string, value: string): boolean {
            return option === value || (!option && !value);
        }

        private _radioLabel(option: string): string {
            return option != null ? option : "—";
        }

        private _radioChanged(e: CustomEvent) {
            e.stopPropagation();

            this.attribute.setValue((<any>e).model.option, true).catch(Vidyano.noop);
        }
    }
}