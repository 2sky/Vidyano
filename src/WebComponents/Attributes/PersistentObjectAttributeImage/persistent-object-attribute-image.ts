module Vidyano.WebComponents.Attributes {
    @PersistentObjectAttribute.register({
        properties: {
            canClear: {
                type: Boolean,
                computed: "_computeCanClear(value)"
            },
            image: {
                type: String,
                computed: "_computeImage(value)"
            }
        }
    })
    export class PersistentObjectAttributeImage extends WebComponents.Attributes.PersistentObjectAttribute {
        private _pasteListener: EventListener;

        _attributeChanged() {
            if (this._pasteListener) {
                document.removeEventListener("paste", this._pasteListener, false);
                this._pasteListener = null;
            }

            if (this.attribute && this.attribute.getTypeHint("AllowPaste") == "true") {
                this._pasteListener = this._pasteAuto.bind(this);
                document.addEventListener("paste", this._pasteListener, false);
            }
        }

        detached() {
            if (this._pasteListener) {
                document.removeEventListener("paste", this._pasteListener, false);
                this._pasteListener = null;
            }

            super.detached();
        }

        private _change(e: Event) {
            this.attribute.parent.queueWork(() => {
                return new Promise((resolve, reject) => {
                    var input = <HTMLInputElement>e.target;
                    if (input.files && input.files.length == 1) {
                        var fr = new FileReader();
                        fr.readAsDataURL(input.files[0]);
                        fr.onload = () => {
                            resolve(this.value = fr.result.match(/,(.*)$/)[1])
                        };
                        fr.onerror = () => {
                            reject(fr.error);
                        };
                    }
                });
            }, true);
        }

        private _clear() {
            this.value = null;
        }

        private _computeCanClear(value: string): boolean {
            return !StringEx.isNullOrEmpty(value);
        }

        private _computeImage(value: string): string {
            return value ? "background-image: url(" + value.asDataUri() + ")" : "";
        }

        private _pasteAuto(e: ClipboardEvent) {
            if (this.readOnly || !this.editing)
                return;

            if (e.clipboardData) {
                var items = e.clipboardData.items;
                if (items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            var blob = (<any>items[i]).getAsFile();
                            var URLObj = window["URL"] || window["webkitURL"];
                            var source = URLObj.createObjectURL(blob);
                            this._pasteCreateImage(source);
                        }
                    }
                    e.preventDefault();
                }
            }
        }

        private _pasteCreateImage(source) {
            var pastedImage = new Image();
            pastedImage.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = pastedImage.width;
                canvas.height = pastedImage.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(pastedImage, 0, 0);

                this.value = canvas.toDataURL().match(/,(.*)$/)[1];
            };
            pastedImage.src = source;
        }
    }
}