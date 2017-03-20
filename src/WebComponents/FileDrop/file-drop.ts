namespace Vidyano.WebComponents {
    "use strict";

    export interface IFileDropDetails {
        name: string;
        contents: string;
    }

    @WebComponent.register({
        properties: {
            "dragOver": {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: false
            }
        },
        listeners: {
            "dragenter": "_dragEnter",
            "dragover": "_dragOver",
            "dragleave": "_dragLeave",
            "drop": "_drop"
        }
    })
    export class FileDrop extends WebComponent {
        readonly dragOver: boolean; private _setDragOver: (val: boolean) => void;

        private _dragEnter(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation();

            this._setDragOver(true);
        }

        private _dragOver(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation();
            this._setDragOver(true);
        }

        private _dragLeave(e: DragEvent) {
            if (e.srcElement !== this.$.overlay && !!this.findParent(node => node === this, e.srcElement || <Node>e.target))
                return;

            this._setDragOver(false);
        }

        private _drop(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation();
            this._setDragOver(false);

            const file = e.dataTransfer.files[0];
            if (!file)
                return;

            const reader = new FileReader();
            reader.onload = loadEvent => {
                this.fire("file-dropped", <IFileDropDetails>{
                    name: file.name,
                    contents: (<any>loadEvent.target).result.match(/,(.*)$/)[1]
                });
            };

            reader.readAsDataURL(e.dataTransfer.files[0]);
        }
    }
}