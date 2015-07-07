var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var Attributes;
        (function (Attributes) {
            var PersistentObjectAttributeNumeric = (function (_super) {
                __extends(PersistentObjectAttributeNumeric, _super);
                function PersistentObjectAttributeNumeric() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeNumeric.prototype._attributeChanged = function () {
                    _super.prototype._attributeChanged.call(this);
                    if (this.attribute) {
                        this._allowDecimal = PersistentObjectAttributeNumeric._decimalTypes.indexOf(this.attribute.type) >= 0;
                        this._isNullable = this.attribute.type.startsWith("Nullable");
                        this._decimalSeparator = Vidyano.CultureInfo.currentCulture.numberFormat.numberDecimalSeparator;
                    }
                };
                PersistentObjectAttributeNumeric.prototype._editInputBlur = function (e) {
                    if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                        this.attribute.value = this.value;
                    var input = e.target;
                    if (input.value === "" || input.value == null)
                        input.value = this.attribute.value;
                };
                PersistentObjectAttributeNumeric.prototype._canParse = function (value) {
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
                };
                PersistentObjectAttributeNumeric.prototype._between = function (value, minValue, maxValue) {
                    return !isNaN(value) && value >= minValue && value <= maxValue;
                };
                PersistentObjectAttributeNumeric.prototype._setCarretIndex = function (input, carretIndex) {
                    input.selectionEnd = carretIndex;
                    input.selectionStart = carretIndex;
                };
                PersistentObjectAttributeNumeric.prototype._keypress = function (e) {
                    var keyCode = e.keyCode || e.which;
                    if (keyCode == WebComponents.Keyboard.KeyCodes.backspace || keyCode == WebComponents.Keyboard.KeyCodes.tab || keyCode == WebComponents.Keyboard.KeyCodes.shift || keyCode == WebComponents.Keyboard.KeyCodes.control || keyCode == WebComponents.Keyboard.KeyCodes.alt ||
                        keyCode == WebComponents.Keyboard.KeyCodes.leftarrow || keyCode == WebComponents.Keyboard.KeyCodes.rightarrow || keyCode == WebComponents.Keyboard.KeyCodes.uparrow || keyCode == WebComponents.Keyboard.KeyCodes.downarrow)
                        return;
                    var input = e.target;
                    var value = input.value;
                    var carretIndex = input.selectionStart;
                    if (input.selectionEnd != carretIndex)
                        value = value.slice(0, Math.min(input.selectionEnd, carretIndex)) + value.slice(Math.max(input.selectionEnd, carretIndex));
                    if (keyCode < WebComponents.Keyboard.KeyCodes.zero || keyCode > WebComponents.Keyboard.KeyCodes.nine) {
                        if ((keyCode == WebComponents.Keyboard.KeyCodes.comma || keyCode == WebComponents.Keyboard.KeyCodes.period) && !value.contains(this._decimalSeparator) && this._allowDecimal) {
                            input.value = value.insert(this._decimalSeparator, carretIndex);
                            this._setCarretIndex(input, carretIndex + 1);
                        }
                        else if (keyCode == WebComponents.Keyboard.KeyCodes.subtract && !value.contains("-") && carretIndex == 0 && PersistentObjectAttributeNumeric._unsignedTypes.indexOf(this.attribute.type) == -1) {
                            input.value = value.insert("-", carretIndex);
                            this._setCarretIndex(input, carretIndex + 1);
                        }
                        e.preventDefault();
                    }
                    else if (!this._canParse(value.insert(String.fromCharCode(keyCode), carretIndex)))
                        e.preventDefault();
                };
                PersistentObjectAttributeNumeric._decimalTypes = ["NullableDecimal", "Decimal", "NullableSingle", "Single", "NullableDouble", "Double"];
                PersistentObjectAttributeNumeric._unsignedTypes = ["Byte", "NullableByte", "UInt16", "NullableUInt16", "UInt32", "NullableUInt32", "UInt64", "NullableUInt64"];
                return PersistentObjectAttributeNumeric;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeNumeric = PersistentObjectAttributeNumeric;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeNumeric);
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
