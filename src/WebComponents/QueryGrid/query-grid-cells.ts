module Vidyano.WebComponents {
    @Resource.register
    export class QueryGridCellTemplate extends Resource {
        asDataUri(value: string): string {
            if (!value)
                return "";

            return value.asDataUri();
        }

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

    //export class QueryGridCellBoolean extends QueryGridCell {
    //    private _resource: Vidyano.WebComponents.Resource;

    //    protected _render(dom: HTMLElement) {
    //        var value = this.item ? this.item.getValue(this.gridColumn.column.name) : null;
    //        if (value === undefined || value === null) {
    //            dom.innerText = "—";
    //            this._resource = null;
    //        }
    //        else {
    //            if (!this._resource) {
    //                this._resource = new Vidyano.WebComponents.Resource();
    //                this._resource.source = "Selected";
    //                dom.appendChild(this._resource);
    //            }

    //            if (value === true)
    //                this._resource.className = "checked";
    //            else if (value === false)
    //                this._resource.className = "unchecked";
    //        }
    //    }
    //}

    //export var QueryGridCellNullableBoolean = QueryGridCellBoolean;
    //export var QueryGridCellYesNo = QueryGridCellBoolean;

    @WebComponent.register({
        properties: {
            value: {
                type: Object,
                observer: "_valueChanged"
            }
        }
    })
    export class QueryGridCellImage extends WebComponent {
        private _image: HTMLDivElement;

        private _valueChanged(value: QueryResultItemValue) {
            if (!value || !value.value) {
                if (this._image && !this._image.hasAttribute("hidden")) {
                    this._image.style.backgroundImage = "";
                    this._image.setAttribute("hidden", "");
                }

                return;
            }

            if (!this._image) {
                Polymer.dom(this).appendChild(this._image = document.createElement("div"));
                this._image.classList.add("image");
            }

            this._image.removeAttribute("hidden");
            this._image.style.backgroundImage = "url(" + value.value.asDataUri() + ")";
        }
    }
}