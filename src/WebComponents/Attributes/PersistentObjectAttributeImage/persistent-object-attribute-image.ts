module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeImage extends WebComponents.Attributes.PersistentObjectAttribute {
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
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeImage, {
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
    });
}