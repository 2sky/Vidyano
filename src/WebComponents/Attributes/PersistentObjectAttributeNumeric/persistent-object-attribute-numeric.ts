module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeNumeric extends WebComponents.Attributes.PersistentObjectAttribute {
        private _allowDecimal: boolean;
        private _isNullable: boolean;
        private _decimalSeparator: string;
        private _dataType: string;

        private static _decimalTypes = ["NullableDecimal", "Decimal", "NullableSingle", "Single", "NullableDouble", "Double"];
        private static _unsignedTypes = ["Byte", "NullableByte", "UInt16", "NullableUInt16", "UInt32", "NullableUInt32", "UInt64", "NullableUInt64"];

        _attributeChanged() {
            super._attributeChanged();

            if (this.attribute) {
                this._allowDecimal = PersistentObjectAttributeNumeric._decimalTypes.indexOf(this.attribute.type) >= 0;
                this._isNullable = this.attribute.type.startsWith("Nullable") && !this.attribute.parent.isBulkEdit;
                this._decimalSeparator = CultureInfo.currentCulture.numberFormat.numberDecimalSeparator;
            }
        }

        protected _attributeValueChanged() {
            if (this.attribute.value == null) {
                this.value = "";
                return;
            }

            var value = this.attribute.value.toString();
            if (this._decimalSeparator !== ".")
                this.value = value.replace(".", this._decimalSeparator);
            else
                this.value = value;
        }

        protected _valueChanged(newValue: any) {
            if (newValue != null && this._decimalSeparator !== ".")
                newValue = newValue.replace(this._decimalSeparator, ".");

            if (this.attribute)
                this.attribute.setValue(!StringEx.isNullOrEmpty(newValue) ? new BigNumber(newValue).toNumber() : null, false);
        }

        private _editInputBlur(e: Event) {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh) {
                var newValue = this.value;
                if (newValue != null && this._decimalSeparator !== ".")
                    newValue = newValue.replace(this._decimalSeparator, ".");

                this.attribute.value = newValue;
            }

            var input = <HTMLInputElement>e.target;
            if (input.value === "" || input.value == null)
                input.value = this.attribute.value;
        }

        private _canParse(value: string): boolean {
            if (!value && this.attribute.type.startsWith("Nullable"))
                return true;

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
            var keyCode = e.keyCode || e.which;
            
            if (keyCode == Keyboard.KeyCodes.backspace || keyCode == Keyboard.KeyCodes.tab || keyCode == Keyboard.KeyCodes.shift || keyCode == Keyboard.KeyCodes.control || keyCode == Keyboard.KeyCodes.alt || 
                keyCode == Keyboard.KeyCodes.leftarrow || keyCode == Keyboard.KeyCodes.rightarrow || keyCode == Keyboard.KeyCodes.uparrow || keyCode == Keyboard.KeyCodes.downarrow)
                return;

            var input = <HTMLInputElement>e.target;
            var value = input.value;
            var carretIndex = input.selectionStart;
            if (input.selectionEnd != carretIndex)
                value = value.slice(0, Math.min(input.selectionEnd, carretIndex)) + value.slice(Math.max(input.selectionEnd, carretIndex));

            if (keyCode < Keyboard.KeyCodes.zero || keyCode > Keyboard.KeyCodes.nine) {
                if ((keyCode == Keyboard.KeyCodes.comma || keyCode == Keyboard.KeyCodes.period) && !value.contains(this._decimalSeparator) && this._allowDecimal) {
                    input.value = value.insert(this._decimalSeparator, carretIndex);
                    this._setCarretIndex(input, carretIndex + 1);
                }
                else if (keyCode == Keyboard.KeyCodes.subtract && !value.contains("-") && carretIndex == 0 && PersistentObjectAttributeNumeric._unsignedTypes.indexOf(this.attribute.type) == -1) {
                    input.value = value.insert("-", carretIndex);
                    this._setCarretIndex(input, carretIndex + 1);
                }

                e.preventDefault();
            }
            else if (!this._canParse(value.insert(String.fromCharCode(keyCode), carretIndex)))
                e.preventDefault();
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeNumeric);
}