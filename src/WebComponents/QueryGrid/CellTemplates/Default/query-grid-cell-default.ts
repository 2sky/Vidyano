namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            value: {
                type: Object,
                observer: "_valueChanged"
            }
        }
    })
    export class QueryGridCellDefault extends WebComponent {
        private _extraClass: string;
        private _typeHints: any;
        private _textNode: Text;
        private _textNodeValue: string;
        private _foreground: { currentValue?: any; originalValue?: any } = {};
        private _fontWeight: { currentValue?: any; originalValue?: any } = {};
        private _textAlign: { currentValue?: any; originalValue?: any } = {};

        private _valueChanged(itemValue: QueryResultItemValue, oldItemValue: QueryResultItemValue) {
            if (!itemValue) {
                if (this._textNode)
                    this._textNode.nodeValue = this._textNodeValue = "";

                return;
            }

            let value = null;

            this._typeHints = Vidyano.extend({}, itemValue.item.typeHints, itemValue ? itemValue.typeHints : undefined);
            value = itemValue.item.getValue(itemValue.column.name);
            if (value != null && (itemValue.column.type === "Boolean" || itemValue.column.type === "NullableBoolean"))
                value = itemValue.item.query.service.getTranslatedMessage(value ? this._getTypeHint(itemValue.column, "truekey", "True") : this._getTypeHint(itemValue.column, "falsekey", "False"));
            else if (itemValue.column.type === "YesNo")
                value = itemValue.item.query.service.getTranslatedMessage(value ? this._getTypeHint(itemValue.column, "truekey", "Yes") : this._getTypeHint(itemValue.column, "falsekey", "No"));
            else if (itemValue.column.type === "Time" || itemValue.column.type === "NullableTime") {
                if (typeof value === "string") {
                    value = value.trimEnd("0").trimEnd(".");
                    if (value.startsWith("0:"))
                        value = value.substr(2);
                    if (value.endsWith(":00"))
                        value = value.substr(0, value.length - 3);
                }
            }

            if (value != null) {
                let format = this._getTypeHint(itemValue.column, "displayformat", null);
                if (format == null || format === "{0}") {
                    switch (itemValue.column.type) {
                        case "Date":
                        case "NullableDate":
                            format = null;
                            value = value.localeFormat(CultureInfo.currentCulture.dateFormat.shortDatePattern, true);
                            break;

                        case "DateTime":
                        case "NullableDateTime":
                        case "DateTimeOffset":
                        case "NullableDateTimeOffset":
                            format = null;
                            value = value.localeFormat(CultureInfo.currentCulture.dateFormat.shortDatePattern + " " + CultureInfo.currentCulture.dateFormat.shortTimePattern, true);
                            break;
                    }
                }

                if (StringEx.isNullOrEmpty(format))
                    value = value.localeFormat ? value.localeFormat() : value.toLocaleString();
                else
                    value = StringEx.format(format, value);
            }
            else
                value = "";

            const foreground = this._getTypeHint(itemValue.column, "foreground", null);
            if (foreground !== this._foreground.currentValue) {
                if (this._foreground.originalValue === undefined)
                    this._foreground.originalValue = this.style.color;

                this.style.color = this._foreground.currentValue = foreground || this._foreground.originalValue;
            }

            const textAlign = this._getTypeHint(itemValue.column, "horizontalcontentalignment", Service.isNumericType(itemValue.column.type) ? "right" : "left");
            if (textAlign !== this._textAlign.currentValue)
                this.style.textAlign = this._textAlign.currentValue = textAlign || this._textAlign.originalValue;

            const extraClass = itemValue.column.getTypeHint("extraclass", undefined, value && itemValue.typeHints, true);
            if (extraClass !== this._extraClass) {
                if (!StringEx.isNullOrEmpty(this._extraClass))
                    this.classList.remove(...this._extraClass.split(" "));

                this._extraClass = extraClass;
                if (!StringEx.isNullOrEmpty(extraClass))
                    this.classList.add(...this._extraClass.split(" "));
            }

            if (this._textNode) {
                if (this._textNodeValue !== value)
                    this._textNode.nodeValue = this._textNodeValue = <string>value;
            }
            else
                this.shadowRoot.appendChild(this._textNode = document.createTextNode(this._textNodeValue = <string>value));
        }

        private _getTypeHint(column: Vidyano.QueryColumn, name: string, defaultValue?: string): string {
            return column.getTypeHint(name, defaultValue, this._typeHints, true);
        }
    }
}