namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            hasValue: {
                type: Boolean,
                computed: "_computeHasValue(value)"
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

            if (this.attribute && this.attribute.getTypeHint("AllowPaste") === "true") {
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
                    const input = <HTMLInputElement>e.target;
                    if (input.files && input.files.length === 1) {
                        const fr = new FileReader();
                        fr.readAsDataURL(input.files[0]);
                        fr.onload = () => {
                            resolve(this.value = (<string>fr.result).match(/,(.*)$/)[1]);
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

        private _computeHasValue(value: string): boolean {
            return !StringEx.isNullOrEmpty(value);
        }

        private _computeImage(value: string): string {
            return value ? value.asDataUri() : "";
        }

        private _canOpen(hasValue: boolean, sensitive: boolean): boolean {
            return hasValue && !sensitive;
        }

        private _pasteAuto(e: ClipboardEvent) {
            if (this.readOnly || !this.editing)
                return;

            if (e.clipboardData) {
                const items = e.clipboardData.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            const blob = (<any>items[i]).getAsFile();
                            const URLObj = window["URL"] || window["webkitURL"];
                            const source = URLObj.createObjectURL(blob);
                            this._pasteCreateImage(source);

                            e.preventDefault();
                        }
                    }
                }
            }
        }

        private _pasteCreateImage(source) {
            const pastedImage = new Image();
            pastedImage.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = pastedImage.width;
                canvas.height = pastedImage.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(pastedImage, 0, 0);

                this.value = canvas.toDataURL().match(/,(.*)$/)[1];
            };
            pastedImage.src = source;
        }

        private _showDialog() {
            if (!this.value || this.sensitive)
                return;

            this.app.showDialog(new Vidyano.WebComponents.Attributes.PersistentObjectAttributeImageDialog(this.attribute.label, this.value.asDataUri()));
        }
    }

    @Dialog.register({
        properties: {
            label: String,
            src: String,
            headerSize: Object,
            footerSize: Object
        },
        observers: [
            "_showImage(headerSize, footerSize)"
        ]
    })
    export class PersistentObjectAttributeImageDialog extends WebComponents.Dialog {
        private _updated: boolean;

        constructor(public label: string, public src: string) {
            super();
        }

        private _showImage(headerSize: Vidyano.WebComponents.ISize, footerSize: Vidyano.WebComponents.ISize) {
            this.customStyle["--vi-persistent-object-attribute-image-dialog--max-height"] = `${headerSize.height + footerSize.height}px`;

            this.updateStyles();

            if (!this._updated) {
                this.$.img.removeAttribute("hidden");
                this.$.spinner.setAttribute("hidden", "");

                this._updated = true;
            }
        }

        private _close() {
            this.cancel();
        }
    }
}