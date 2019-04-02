namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            query: Object,
            canSelectAll: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.isAvailable"
            },
            selected: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeSelected(partial, query.selectAll.allSelected)"
            },
            partial: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computePartial(query.selectedItems, query.selectAll.allSelected, query.selectAll.inverse)"
            }
        },
        forwardObservers: [
            "query.selectedItems",
            "query.selectAll.allSelected",
            "query.selectAll.inverse",
            "query.selectAll.isAvailable"
        ],
        listeners: {
            "tap": "_toggle"
        }
    })
    export class QueryGridSelectAll extends WebComponent {
        query: Vidyano.Query;
        readonly partial: boolean;

        private _toggle() {
            if (!this.query)
                return;

            if (this.query.selectAll.isAvailable && !this.partial)
                this.query.selectAll.allSelected = !this.query.selectAll.allSelected;
            else {
                if (this.query.selectAll.isAvailable)
                    this.query.selectAll.allSelected = false;

                this.query.selectedItems = [];
            }
        }

        private _computePartial(selectedItems: Vidyano.QueryResultItem[], allSelected: boolean, inverse: boolean): boolean {
            return inverse || (!allSelected && selectedItems != null && selectedItems.length > 0);
        }

        private _computeSelected(partial: boolean, allSelected: boolean): boolean {
            return partial || allSelected;
        }
    }
}