module Vidyano.WebComponents {
    @Resource.register
    export class QueryGridCellTemplate extends Resource {
        static Load(source: string): TemplatePresenter {
            var cellTemplate = <QueryGridCellTemplate>Resource.LoadResource(source, "VI-QUERY-GRID-CELL-TEMPLATE");
            if (!cellTemplate)
                return null;

            return new Vidyano.WebComponents.TemplatePresenter(cellTemplate.querySelector("template"), "value");
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
        private _icon: HTMLElement;
        private _textNode: Text;

        private _valueChanged(value: QueryResultItemValue) {
            if (!value) {
                if (this._icon)
                    this._icon.setAttribute("hidden");

                if (this._textNode && this._textNode.nodeValue)
                    this._textNode.nodeValue = "";
            } else if (value === undefined || value === null) {
                if (this._icon)
                    this._icon.setAttribute("hidden");

                if (!this._textNode)
                    this._textNode = this.appendChild(document.createTextNode("—"));
                else
                    this._textNode.nodeValue = "—";
            } else {
                if (this._textNode && this._textNode.nodeValue)
                    this._textNode.nodeValue = "";

                if (!this._icon)
                    this._icon = <HTMLElement>Polymer.dom(this).appendChild(new Vidyano.WebComponents.Icon("Selected"));

                if (!value.getValue())
                    this.classList.add("unchecked");
                else
                    this.classList.remove("unchecked");
            }
        }
    }
}