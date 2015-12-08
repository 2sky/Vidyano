module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            query: Object,
            selected: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.allSelected"
            },
            inversed: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.inverse"
            }
        },
        forwardObservers: [
            "query.selectAll.allSelected",
            "query.selectAll.inverse"
        ],
        listeners: {
            "tap": "_toggle"
        }
    })
    export class QueryGridSelectAll extends WebComponent {
        query: Vidyano.Query;

        private _toggle() {
            if (!this.query || !this.query.selectAll.isAvailable)
                return;

            this.query.selectAll.allSelected = !this.query.selectAll.allSelected;
        }
    }
}