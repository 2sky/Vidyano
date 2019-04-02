namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            query: Object,
            canSelect: Boolean,
            canAddNewReference: Boolean,
            initializing: {
                type: Boolean,
                observer: "_initializingChanged"
            }
        },
        forwardObservers: [
            "_selectedItemsChanged(query.selectedItems)"
        ]
    })
    export class SelectReferenceDialog extends Dialog {
        canSelect: boolean;

        constructor(public query: Vidyano.Query, forceSearch?: boolean, public canAddNewReference: boolean = false, keepFilter?: boolean) {
            super();

            query["_query-grid-vertical-scroll-offset"] = undefined;

            if (keepFilter)
                return;

            if (!query.filters)
                query.resetFilters();

            if (forceSearch || !!query.textSearch || !query.hasSearched)
                query.search();
        }

        private _initializingChanged(value: boolean) {
            if (!value)
                this._focusElement(this.$.search);
        }

        private _selectedItemsChanged() {
            if (!this.isConnected)
                return;

            this.canSelect = this.query && this.query.selectedItems && this.query.selectedItems.length > 0;
        }

        private _invalidateCanSelect(selectedItems: QueryResultItem[] = (this.query ? this.query.selectedItems : undefined)) {
            this.canSelect = selectedItems && selectedItems.length > 0;
        }

        private _queryPropertyChanged(sender: Query, detail: Vidyano.Common.PropertyChangedArgs) {
            if (detail.propertyName === "selectedItems")
                this._invalidateCanSelect(detail.newValue);
        }

        private _select() {
            if (!this.canSelect)
                return;

            this.close(this.query.selectedItems);
        }

        private _addNew() {
            this.close("AddNewReference");
        }

        private _search(e: CustomEvent, detail: string) {
            if (!this.query)
                return;

            this.query.textSearch = detail;
            this.query.search();
        }

        private _selectReference(e: CustomEvent) {
            e.preventDefault();

            const detail = <IQueryGridItemTapEventArgs>e.detail;
            if (this.query.maxSelectedItems === 1)
                this.close([detail.item]);
            else
                detail.item.isSelected = !detail.item.isSelected;
        }
    }
}