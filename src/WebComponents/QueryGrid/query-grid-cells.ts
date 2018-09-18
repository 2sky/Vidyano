namespace Vidyano.WebComponents {
    "use strict";

    @Resource.register
    export class QueryGridCellTemplate extends Resource {
        static Load(source: string): PolymerTemplate {
            const cellTemplate = <QueryGridCellTemplate>Resource.LoadResource(source, "VI-QUERY-GRID-CELL-TEMPLATE") || <QueryGridCellTemplate>Resource.LoadResource("Default", "VI-QUERY-GRID-CELL-TEMPLATE");
            return <PolymerTemplate><Node>cellTemplate.querySelector("template");
        }

        static Exists(name: string): boolean {
            return Resource.Exists(name, "VI-QUERY-GRID-CELL-TEMPLATE");
        }
    }

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
                value = itemValue.item.query.service.getTranslatedMessage(value ? itemValue.column.getTypeHint("truekey", "True") : itemValue.column.getTypeHint("falsekey", "False"));
            else if (itemValue.column.type === "YesNo")
                value = itemValue.item.query.service.getTranslatedMessage(value ? itemValue.column.getTypeHint("truekey", "Yes") : itemValue.column.getTypeHint("falsekey", "No"));
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
                let format = itemValue.column.getTypeHint("displayformat", null);
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

            const foreground = itemValue.column.getTypeHint("foreground", null);
            if (foreground !== this._foreground.currentValue) {
                if (this._foreground.originalValue === undefined)
                    this._foreground.originalValue = this.style.color;

                this.style.color = this._foreground.currentValue = foreground || this._foreground.originalValue;
            }

            const textAlign = itemValue.column.getTypeHint("horizontalcontentalignment", null);
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
                Polymer.dom(this).appendChild(this._textNode = document.createTextNode(this._textNodeValue = <string>value));
        }
    }

    @WebComponent.register({
        properties: {
            value: {
                type: Object,
                observer: "_valueChanged"
            }
        }
    })
    export class QueryGridCellImage extends WebComponent {
        private _isHidden: boolean;
        private _image: HTMLDivElement;

        private _valueChanged(value: QueryResultItemValue) {
            if (!value || !value.value) {
                if (this._image && !this._image.hasAttribute("hidden")) {
                    this._image.style.backgroundImage = "";
                    this._image.setAttribute("hidden", "");
                    this._isHidden = true;
                }

                return;
            }

            if (!this._image) {
                Polymer.dom(this).appendChild(this._image = document.createElement("div"));
                this._image.classList.add("image");
            }

            if (this._isHidden) {
                this._image.removeAttribute("hidden");
                this._isHidden = false;
            }

            this._image.style.backgroundImage = "url(" + value.value.asDataUri() + ")";
        }
    }

    @WebComponent.register({
        properties: {
            value: {
                type: Object,
                observer: "_valueChanged"
            },
            oldValue: {
                type: Object,
                readOnly: true
            }
        },
        observers: [
            "_update(value, oldValue, isAttached)"
        ]
    })
    export class QueryGridCellBoolean extends WebComponent {
        private _isHidden: boolean;
        private _icon: HTMLElement;
        private _textNode: Text;
        readonly oldValue: QueryResultItemValue; private _setOldValue: (oldValue: QueryResultItemValue) => void;

        private _valueChanged(value: QueryResultItemValue, oldValue: QueryResultItemValue) {
            this._setOldValue(oldValue == null ? null : oldValue);
        }

        private _update(value: QueryResultItemValue, oldValue: QueryResultItemValue) {
            if (!!value && !!oldValue && value.getValue() === oldValue.getValue()) {
                const oldHints = oldValue.column.typeHints;
                const hints = value.column.typeHints;
                if ((!oldHints && !hints) || (hints && oldHints && JSON.stringify(value.column.typeHints) === JSON.stringify(oldValue.column.typeHints)))
                    return;
            }

            if (!value) {
                if (this._icon) {
                    this._icon.setAttribute("hidden", "");
                    this._isHidden = true;
                }

                if (this._textNode && this._textNode.nodeValue)
                    this._textNode.nodeValue = "";
            } else {
                const displayValue: boolean = value.getValue();
                if (displayValue == null) {
                    if (this._icon) {
                        this._icon.setAttribute("hidden", "");
                        this._isHidden = true;
                    }

                    if (!this._textNode)
                        this._textNode = <Text>Polymer.dom(this.root).appendChild(document.createTextNode(value.column.typeHints["nullkey"] || "—"));
                    else
                        this._textNode.nodeValue = value.column.typeHints["nullkey"] || "—";
                } else if (!value.column.typeHints || ((!value.column.typeHints["falsekey"] && !displayValue) || (!value.column.typeHints["truekey"] && displayValue))) {
                    if (this._isHidden) {
                        this._icon.removeAttribute("hidden");
                        this._isHidden = false;
                    }

                    if (this._textNode && this._textNode.nodeValue)
                        this._textNode.nodeValue = "";

                    if (!this._icon)
                        this._icon = <HTMLElement>Polymer.dom(this.root).appendChild(new Vidyano.WebComponents.Icon("Selected"));

                    if (!value.getValue())
                        this._icon.removeAttribute("is-selected");
                    else
                        this._icon.setAttribute("is-selected", "");
                }
                else {
                    const displayTextKey = value.column.typeHints[displayValue ? "truekey" : "falsekey"];
                    const displayTextValue = this.translations[displayTextKey] || displayTextKey;
                    if (!this._textNode)
                        this._textNode = <Text>Polymer.dom(this.root).appendChild(document.createTextNode(displayTextValue));
                    else
                        this._textNode.nodeValue = displayTextValue;
                }
            }
        }
    }
}