module Vidyano.WebComponents {
    @Dialog.register
    export class QueryGridConfigureDialog extends Dialog {
        constructor(private _grid: QueryGrid) {
            super();
        }
    }
}