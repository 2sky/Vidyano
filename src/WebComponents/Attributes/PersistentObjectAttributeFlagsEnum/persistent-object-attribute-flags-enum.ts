namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register()
    export class PersistentObjectAttributeFlagsEnum extends WebComponents.Attributes.PersistentObjectAttribute {
    }

    @WebComponent.register({
        properties: {
            attribute: Object,
            checked: {
                type: Boolean,
                notify: true,
                observer: "_checkedChanged",
                value: false
            },
            label: {
                type: String,
                computed: "_computeLabel(option)"
            },
            option: Object,
            value: {
                type: String,
                computed: "attribute.value"
            }
        },
        observers: [
            "_valueChanged(value, label)"
        ],
        forwardObservers: [
            "attribute.value"
        ]
    })
    export class PersistentObjectAttributeFlagsEnumFlag extends WebComponents.WebComponent {
        private _skipCheckedChanged: boolean;
        attribute: Vidyano.PersistentObjectAttribute;
        checked: boolean;
        label: string;
        option: PersistentObjectAttributeOption;

        private _checkedChanged() {
            if (this._skipCheckedChanged || !this.attribute)
                return;

            const myValue = parseInt(this.option.key);
            if (this.checked && myValue === 0)
                this.attribute.value = this.option.value;
            else {
                const currentOptions = <PersistentObjectAttributeOption[]>this.attribute.options;
                let currentValue = this.attribute.value ? this._values(this.attribute.value).sum(v => parseInt(currentOptions.find(o => o.value === v).key)) : 0;
                if (this.checked)
                    currentValue |= myValue;
                else
                    currentValue &= ~myValue;

                const value = [];
                currentOptions.orderByDescending(o => parseInt(o.key)).forEach(option => {
                    const optionKey = parseInt(option.key);
                    if (optionKey !== 0 && (currentValue & optionKey) === optionKey) {
                        currentValue &= ~optionKey;
                        value.splice(0, 0, option.value);
                    }
                });

                if (value.length > 0)
                    this.attribute.value = value.join(", ");
                else {
                    this.attribute.value = currentOptions.find(o => o.key === "0").value;
                    if (myValue === 0)
                        this.checked = true;
                }
            }
        }

        private _computeLabel(option: PersistentObjectAttributeOption): string {
            return option.value;
        }

        private _valueChanged(value: string, label: string) {
            try {
                this._skipCheckedChanged = true;

                const currentOptions = <PersistentObjectAttributeOption[]>this.attribute.options;
                const currentValue = this.attribute.value ? this._values(this.attribute.value).sum(v => parseInt(currentOptions.find(o => o.value === v).key)) : 0;
                const myValue = parseInt(this.option.key);

                this.checked = (currentValue === 0 && myValue === 0) || (myValue !== 0 && (currentValue & myValue) === myValue);
            }
            finally {
                this._skipCheckedChanged = false;
            }
        }

        private _values(value: string): string[] {
            return value.split(",").map(v => v.trim());
        }
    }
}