module Vidyano.WebComponents {
    export class QueryGridCellBoolean extends QueryGridCell {
        private _resource: Vidyano.WebComponents.Resource;

        protected _render(dom: HTMLElement) {
            if (!this._resource) {
                this._resource = new Vidyano.WebComponents.Resource();
                this._resource.source = "Icon_Selected";
                dom.appendChild(this._resource);
            }

            var value = this.item ? this.item.getValue(this.gridColumn.column.name) : null;
            if (value == true)
                this._resource.className = "checked";
            else if (value == false)
                this._resource.className = "unchecked";
            else
                this._resource.className = "";
        }
    }

    export var QueryGridCellNullableBoolean = QueryGridCellBoolean;
    export var QueryGridCellYesNo = QueryGridCellBoolean;

    export class QueryGridCellImage extends QueryGridCell {
        private _img: HTMLElement;

        protected _render(dom: HTMLElement) {
            if (!this._img) {
                this._img = document.createElement("div");
                this._img.className = "image";
                dom.appendChild(this._img);
            }

            var value = <string>(this.item ? this.item.getValue(this.gridColumn.column.name) : null);
            if (StringEx.isNullOrEmpty(value)) {
                if (!StringEx.isNullOrEmpty(dom.style.backgroundImage))
                    this._img.style.backgroundImage = "";

                return;
            }

            this._img.style.backgroundImage = "url(" + value.asDataUri() + ")";
        }
    }
}