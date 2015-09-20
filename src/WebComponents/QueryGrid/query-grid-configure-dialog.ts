module Vidyano.WebComponents {
    @Dialog.register({
        properties: {
            grid: Object,
            query: {
                type: Object,
                computed: "grid.query"
            }
        }
    })
    export class QueryGridConfigureDialog extends Dialog {
        constructor(public grid: QueryGrid) {
            super();
        }
    }
}