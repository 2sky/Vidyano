namespace Vidyano.WebComponents {
    "use strict";

    @Resource.register
    export class QueryGridCellTemplate extends Resource {
        static Load(source: string): PolymerTemplate {
            const cellTemplate = <QueryGridCellTemplate>Resource.LoadResource(source, "VI-QUERY-GRID-CELL-TEMPLATE");
            if (!cellTemplate)
                return null;

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
            }
        }
    })
    export class QueryGridCellBoolean extends WebComponent {
        private _isHidden: boolean;
        private _icon: HTMLElement;
        private _textNode: Text;

        private _valueChanged(value: QueryResultItemValue, oldValue: QueryResultItemValue) {
            if (!!value && !!oldValue && value.getValue() === oldValue.getValue())
                return;

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
                } else if (!value.column.typeHints || ((!value.column.typeHints["falsekey"] && !displayValue) || (!value.column.typeHints["truekey"] && !displayValue))) {
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
                    const displayTextValue = value.column.typeHints[displayValue ? "truekey" : "falsekey"];
                    if (!this._textNode)
                        this._textNode = <Text>Polymer.dom(this.root).appendChild(document.createTextNode(displayTextValue));
                    else
                        this._textNode.nodeValue = displayTextValue;
                }
            }
        }
    }
}