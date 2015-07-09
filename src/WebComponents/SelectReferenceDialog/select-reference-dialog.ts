module Vidyano.WebComponents {
    export class SelectReferenceDialog extends WebComponent {
        private _grid: WebComponents.QueryGrid;
        private _itemClickCallback: EventListener;
        private _dialog: WebComponents.DialogInstance;
        canSelect: boolean;
        query: Vidyano.Query;

        detached() {
            super.detached();

            if (this._itemClickCallback && this._grid) {
                this._grid.asElement.removeEventListener("item-click", this._itemClickCallback);
                this._itemClickCallback = null;
            }
        }

        show(): Promise<any> {
            var dialog = <WebComponents.Dialog><any>this.$["dialog"];
            this.empty();

            this._grid = new WebComponents.QueryGrid();
            this._grid.asElement.addEventListener("item-click", this._itemClickCallback = this._selectReference.bind(this));
            this._grid.classList.add("fit");
            this._grid.asLookup = true;
            this._grid.query = this.query;

            Polymer.dom(this).appendChild(this._grid);

            this._dialog = dialog.show({
                autoSize: true
            });

            return this._dialog.result;
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
			if (detail.propertyName == "selectedItems")
				this._invalidateCanSelect(detail.newValue);
		}

        private _select() {
            if (!this.canSelect)
                return;

            this._dialog.resolve(this.query.selectedItems);
		}

        private _cancel() {
            this._dialog.resolve();
        }

        private _search(e: CustomEvent, detail: string) {
            if (!this.query)
                return;

            this.query.textSearch = detail;
            this.query.search();
        }

        private _selectReference(e: CustomEvent) {
            e.preventDefault();

            var detail = <QueryGridItemClickEventArgs>e.detail;
			if (this.query.maxSelectedItems == 1)
                this._dialog.resolve([detail.item]);
			else
				detail.item.isSelected = !detail.item.isSelected;
		}
    }

	Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.SelectReferenceDialog, Vidyano.WebComponents, "vi",
        {
            properties: {
                query: Object,
                canSelect: Boolean
            },
            hostAttributes: {
                "dialog": ""
            },
            forwardObservers: [
                "_selectedItemsChanged(query.selectedItems)"
            ]
        });
}