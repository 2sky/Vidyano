namespace Vidyano.WebComponents {
    "use strict";

    @Dialog.register({
        properties: {
            query: Object,
            canSelect: Boolean
        },
        forwardObservers: [
            "_selectedItemsChanged(query.selectedItems)"
        ]
    })
    export class SelectReferenceDialog extends Dialog {
        canSelect: boolean;

        constructor(public query: Vidyano.Query) {
            super();
        }

        private _selectedItemsChanged() {
            if (!this.isAttached)
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

            this.instance.resolve(this.query.selectedItems);
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
                this.instance.resolve([detail.item]);
            else
                detail.item.isSelected = !detail.item.isSelected;
        }
    }
}