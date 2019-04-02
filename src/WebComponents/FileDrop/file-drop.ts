namespace Vidyano.WebComponents {
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
            if (e.srcElement !== this.$.overlay && !!this.findParent(node => node === this, e.srcElement || <Node>this.todo_checkEventTarget(e.target)))
                return;

            this._setDragOver(false);
        }

        private async _drop(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation();
            this._setDragOver(false);

            if (!e.dataTransfer.files[0])
                return;

            const readers = Array.from(e.dataTransfer.files).map(file => {
                return new Promise((resolve: (details: IFileDropDetails) => void) => {
                    const reader = new FileReader();
                    reader.onload = loadEvent => {
                        resolve({
                            name: file.name,
                            contents: (<any>loadEvent.target).result.match(/,(.*)$/)[1]
                        });
                    };

                    reader.readAsDataURL(file);
                });
            });

            this.fire("file-dropped", await Promise.all(readers));
        }
    }
}