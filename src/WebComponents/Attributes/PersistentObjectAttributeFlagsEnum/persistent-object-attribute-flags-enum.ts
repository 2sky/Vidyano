﻿namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register
    export class PersistentObjectAttributeFlagsEnum extends WebComponents.Attributes.PersistentObjectAttribute {
        private _disablePopup(readonly: boolean, disabled: boolean): boolean {
            return readonly || disabled;
        }
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
        option: Vidyano.Common.IKeyValuePair;

        private _checkedChanged() {
            if (this._skipCheckedChanged || !this.attribute)
                return;

            const myValue = parseInt(this.option.key);
            if (this.checked && myValue === 0)
                this.attribute.value = this.option.value;
            else {
                const currentOptions = Enumerable.from(<Vidyano.Common.IKeyValuePair[]>this.attribute.options);
                let currentValue = this.attribute.value ? this._values(this.attribute.value).sum(v => parseInt(currentOptions.first(o => o.value === v).key)) : 0;
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
                    this.attribute.value = currentOptions.first(o => o.key === "0").value;
                    if (myValue === 0)
                        this.checked = true;
                }
            }
        }

        private _computeLabel(option: Vidyano.Common.IKeyValuePair): string {
            return option.value;
        }

        private _valueChanged(value: string, label: string) {
            try {
                this._skipCheckedChanged = true;

                const currentOptions = Enumerable.from(<Vidyano.Common.IKeyValuePair[]>this.attribute.options);
                const currentValue = this.attribute.value ? this._values(this.attribute.value).sum(v => parseInt(currentOptions.first(o => o.value === v).key)) : 0;
                const myValue = parseInt(this.option.key);

                this.checked = (currentValue === 0 && myValue === 0) || (myValue !== 0 && (currentValue & myValue) === myValue);
            }
            finally {
                this._skipCheckedChanged = false;
            }
        }

        private _values(value: string): linqjs.Enumerable<string> {
            return Enumerable.from(value.split(",")).select(v => v.trim());
        }
    }
}