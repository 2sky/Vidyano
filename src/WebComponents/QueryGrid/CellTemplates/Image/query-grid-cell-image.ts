namespace Vidyano.WebComponents {
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
                this.appendChild(this._image = document.createElement("div"));
                this._image.classList.add("image");
            }

            if (this._isHidden) {
                this._image.removeAttribute("hidden");
                this._isHidden = false;
            }

            this._image.style.backgroundImage = "url(" + value.value.asDataUri() + ")";
        }
    }
}