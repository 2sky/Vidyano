namespace Vidyano.WebComponents {
    "use strict";

    export interface IFileDropDetails {
        name: string;
        contents: string;
    }

    @WebComponent.register({
        properties: {
        },
        listeners: {
            "dragenter": "_dragEnter",
            "dragover": "_dragOver",
            "dragleave": "_dragLeave",
            "drop": "_drop"
        }
    })
    export class FileDrop extends WebComponent {
        private _dragEnter(e: DragEvent) {
            e.preventDefault();
        }

        private _dragOver(e: DragEvent) {
            e.preventDefault();
        }

        private _dragLeave(e: DragEvent) {
            // Noop
        }

        private _drop(e: DragEvent) {
            e.preventDefault();

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