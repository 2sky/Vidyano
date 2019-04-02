namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            unitBefore: {
                type: String,
                reflectToAttribute: true,
                value: null
            },
            unitAfter: {
                type: String,
                reflectToAttribute: true,
                value: null
            },
            focused: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            }
        }
    })
    export class PersistentObjectAttributeNumeric extends WebComponents.Attributes.PersistentObjectAttribute {
        private _allowDecimal: boolean;
        private _isNullable: boolean;
        private _decimalSeparator: string;
        private _dataType: string;
        readonly focused: boolean; private _setFocused: (val: boolean) => void;
        unitBefore: string;
        unitAfter: string;

        private static _decimalTypes = ["NullableDecimal", "Decimal", "NullableSingle", "Single", "NullableDouble", "Double"];
        private static _unsignedTypes = ["Byte", "NullableByte", "UInt16", "NullableUInt16", "UInt32", "NullableUInt32", "UInt64", "NullableUInt64"];

        _attributeChanged() {
            super._attributeChanged();

            if (this.attribute) {
                this._allowDecimal = PersistentObjectAttributeNumeric._decimalTypes.indexOf(this.attribute.type) >= 0;
                this._isNullable = this.attribute.type.startsWith("Nullable") && !this.attribute.parent.isBulkEdit;
                this._decimalSeparator = CultureInfo.currentCulture.numberFormat.numberDecimalSeparator;

                const displayFormat = this.attribute.getTypeHint("displayformat", null, null, true);
                if (displayFormat) {
                    const groups = /^([^{]*)({.+?})(.*)$/.exec(displayFormat);
                    this.unitBefore = groups[1];
                    this.unitAfter = groups[3];
                }
            }
        }

        protected _attributeValueChanged() {
            if (this.attribute.value == null) {
                this.value = "";
                return;
            }

            const attributeValue = this.attribute.value.toString();
            let myValue = this.value;
            if (this.value && this._decimalSeparator !== ".")
                myValue = this.value.replace(this._decimalSeparator, ".");

            if (this.focused) {
                if (myValue === "" || myValue === "-")
                    myValue = this.attribute.isRequired && !this.attribute.type.startsWith("Nullable") ? "0" : "";
                else if (myValue.endsWith("."))
                    myValue = myValue.trimEnd(".");
            }

            if (!!myValue && this._canParse(myValue) && new BigNumber(myValue).equals(this.attribute.value))
                return;

            if (this._decimalSeparator !== ".")
                this.value = attributeValue.replace(".", this._decimalSeparator);
            else
                this.value = attributeValue;
        }

        protected async _valueChanged(newValue: string, oldValue: string) {
            if (!this.attribute)
                return;

            if (newValue != null && this._decimalSeparator !== ".")
                newValue = newValue.replace(this._decimalSeparator, ".");

            try {
                if (this.focused) {
                    if (newValue === "" || newValue === "-")
                        newValue = this.attribute.isRequired && !this.attribute.type.startsWith("Nullable") ? "0" : "";
                    else if (newValue.endsWith("."))
                        newValue = newValue.trimEnd(".");
                }

                if (!this._canParse(newValue)) {
                    this.value = oldValue;
                    return;
                }

                const bigNumberValue = !StringEx.isNullOrEmpty(newValue) ? new BigNumber(newValue) : null;
                if (this.attribute.value instanceof BigNumber && bigNumberValue != null && bigNumberValue.equals(this.attribute.value))
                    return;

                await this.attribute.setValue(bigNumberValue, false).catch(Vidyano.noop);
            } catch (e) {
                this.notifyPath("value", this.attribute.value);
            }
        }

        private _editInputBlur(e: Event) {
            this._setFocused(false);

            if (!this.attribute)
                return;

            if (this.attribute.isValueChanged && this.attribute.triggersRefresh) {
                let newValue = this.value;
                if (newValue != null && this._decimalSeparator !== ".")
                    newValue = newValue.replace(this._decimalSeparator, ".");

                this.attribute.value = newValue;
            }

            let attributeValue = this.attribute.value ? this.attribute.value.toString() : ((this.attribute.isRequired && !this.attribute.type.startsWith("Nullable")) || this.value ? "0" : "");
            if (attributeValue !== this.value) {
                if (this._decimalSeparator !== ".")
                    this.value = attributeValue.replace(".", this._decimalSeparator);
                else
                    this.value = attributeValue;
            }
        }

        private _editInputFocus(e: Event) {
            this._setFocused(true);

            const input = <HTMLInputElement>this.todo_checkEventTarget(e.target);
            if (!input.value || !this.attribute.getTypeHint("SelectAllOnFocus"))
                return;

            input.selectionStart = 0;
            input.selectionEnd = input.value.length;
        }

        private _canParse(value: string): boolean {
            if (!value && this.attribute.type.startsWith("Nullable"))
                return true;

            if (value && value.startsWith(this._decimalSeparator))
                value = `0${value}`;

            switch (this.attribute.type) {
                case "Byte":
                case "NullableByte":
                    return this._between(parseInt(value, 10), 0, 255);
                case "SByte":
                case "NullableSByte":
                    return this._between(parseInt(value, 10), -128, 127);
                case "Int16":
                case "NullableInt16":
                    return this._between(parseInt(value, 10), -32768, 32767);
                case "UInt16":
                case "NullableUInt16":
                    return this._between(parseInt(value, 10), 0, 65535);
                case "Int32":
                case "NullableInt32":
                    return this._between(parseInt(value, 10), -2147483648, 2147483647);
                case "UInt32":
                case "NullableUInt32":
                    return this._between(parseFloat(value), 0, 4294967295);
                case "Int64":
                case "NullableInt64":
                    return this._between(parseFloat(value), -9223372036854775808, 9223372036854775807);
                case "UInt64":
                case "NullableUInt64":
                    return this._between(parseFloat(value), 0, 18446744073709551615);
                case "Decimal":
                case "NullableDecimal":
                    return this._between(parseFloat(value), -79228162514264337593543950335, 79228162514264337593543950335);
                case "Single":
                case "NullableSingle":
                    return this._between(parseFloat(value), -3.40282347E+38, 3.40282347E+38);
                case "Double":
                case "NullableDouble":
                    return this._between(parseFloat(value), -1.7976931348623157E+308, 1.7976931348623157E+308);
                default:
                    return false;
            }
        }

        private _between(value: number, minValue: number, maxValue: number): boolean {
            return !isNaN(value) && value >= minValue && value <= maxValue;
        }

        private _setCarretIndex(input: HTMLInputElement, carretIndex: number): void {
            input.selectionEnd = carretIndex;
            input.selectionStart = carretIndex;
        }

        private _keypress(e: KeyboardEvent): void {
            const keyCode = e.keyCode || e.which;

            if (keyCode === Keyboard.KeyCodes.tab || keyCode === Keyboard.KeyCodes.shift || keyCode === Keyboard.KeyCodes.control || keyCode === Keyboard.KeyCodes.alt || keyCode === Keyboard.KeyCodes.leftarrow || keyCode === Keyboard.KeyCodes.rightarrow || keyCode === Keyboard.KeyCodes.uparrow || keyCode === Keyboard.KeyCodes.downarrow || keyCode === Keyboard.KeyCodes.backspace)
                return;

            const input = <HTMLInputElement>this.todo_checkEventTarget(e.target);
            let value = input.value;
            const carretIndex = input.selectionStart;
            if (input.selectionEnd !== carretIndex)
                value = value.slice(0, Math.min(input.selectionEnd, carretIndex)) + value.slice(Math.max(input.selectionEnd, carretIndex));

            if (keyCode < Keyboard.KeyCodes.zero || keyCode > Keyboard.KeyCodes.nine) {
                if ((keyCode === Keyboard.KeyCodes.comma || keyCode === Keyboard.KeyCodes.period) && !value.contains(this._decimalSeparator) && this._allowDecimal) {
                    this.value = input.value = value.insert(this._decimalSeparator, carretIndex);
                    this._setCarretIndex(input, carretIndex + 1);
                }
                else if (keyCode === Keyboard.KeyCodes.subtract && !value.contains("-") && carretIndex === 0 && PersistentObjectAttributeNumeric._unsignedTypes.indexOf(this.attribute.type) === -1) {
                    this.value = input.value = value.insert("-", carretIndex);
                    this._setCarretIndex(input, carretIndex + 1);
                }

                e.preventDefault();
            }
            else if (!this._canParse(value.insert(String.fromCharCode(keyCode), carretIndex)))
                e.preventDefault();
        }

        private _computeDisplayValueWithUnit(value: number, displayValue: string, unit: string, unitPosition: string): string {
            let result = value != null && unit && unitPosition && unitPosition.toLowerCase() === "before" ? unit + " " : "";

            result += displayValue;
            result += value != null && unit && unitPosition && unitPosition.toLowerCase() === "after" ? " " + unit : "";

            return result;
        }

        private _computeBeforeUnit(unit: string, position: string, value: number, hideOnNoValue?: boolean): string {
            if (!unit || !position)
                return unit;

            if (hideOnNoValue && !value)
                return "";

            return position === "before" ? unit : "";
        }

        private _computeAfterUnit(unit: string, position: string): string {
            if (!unit || !position)
                return unit;

            return position === "after" ? unit : "";
        }
    }
}