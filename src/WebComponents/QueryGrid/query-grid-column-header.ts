module Vidyano.WebComponents {
    var minimumColumnWidth = 30;

    @WebComponent.register({
        properties: {
            sorting: {
                type: String,
                readOnly: true,
                value: null
            }
        },
        listeners: {
            "upgrade-filter-proxy": "_onUpgradeFilterProxy"
        }
    })
    export class QueryGridColumnHeader extends WebComponent {
        private _resizingRAF: number;
        private _column: QueryGridColumn;
        private _columnObserver: Vidyano.Common.SubjectDisposer;
        private _labelTextNode: Text;
        private _filter: QueryGridColumnFilterProxyBase;
        private _sorting: string;

        private _setSorting: (sorting: string) => void;

        attached() {
            super.attached();

            if (!this._filter)
                Polymer.dom(this).appendChild(this._filter = new Vidyano.WebComponents.QueryGridColumnFilterProxy());
        }

        private _onUpgradeFilterProxy(e: Event) {
            var proxy = this._filter;

            Polymer.dom(this).replaceChild(this._filter = new Vidyano.WebComponents.QueryGridColumnFilter(), proxy);
            Polymer.dom(this).flush();

            this._filter.column = this._column;

            e.stopPropagation();
        }

        get column(): QueryGridColumn {
            return this._column;
        }

        set column(column: QueryGridColumn) {
            this._filter.column = column;

            if (this._column === column)
                return;

            if (this._columnObserver) {
                this._columnObserver();
                this._columnObserver = null;
            }

            if (this._column = column) {
                this._columnObserver = this.column.column.propertyChanged.attach(this._columnPropertyChanged.bind(this));

                this._updateLabel(column.label);
                this._updateSortingIcon(this.column.sortDirection);
            }
            else {
                this._updateLabel("");
                this._updateSortingIcon(null);
            }
        }

        private _sort(e: Event) {
            if (!this._column.canSort || this._column.query.canReorder)
                return;

            var multiSort = (<any>e).detail.sourceEvent.ctrlKey;
            var newSortingDirection: SortDirection;
            switch (this._column.sortDirection) {
                case SortDirection.Ascending: {
                    newSortingDirection = SortDirection.Descending;
                    break;
                }
                case SortDirection.Descending: {
                    newSortingDirection = multiSort && this._column.query.sortOptions.length > 1 ? SortDirection.None : SortDirection.Ascending;
                    break;
                }
                case SortDirection.None: {
                    newSortingDirection = SortDirection.Ascending;
                    break;
                }
            }

            this._column.column.sort(newSortingDirection, multiSort);
        }

        private _columnPropertyChanged(sender: Vidyano.QueryColumn, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "sortDirection")
                this._updateSortingIcon(sender.sortDirection);
        }

        private _updateLabel(label: string) {
            if (!this._labelTextNode)
                this._labelTextNode = this.$["label"].appendChild(document.createTextNode(label));
            else
                this._labelTextNode.nodeValue = label;
        }

        private _updateSortingIcon(direction: Vidyano.SortDirection) {
            this._setSorting(direction === SortDirection.Ascending ? "SortAsc" : (direction === SortDirection.Descending ? "SortDesc" : null));
        }

        private _resizeTrack(e: TrackEvent, detail: PolymerTrackDetail) {
            if (detail.state == "start")
                this.classList.add("resizing");
            else if (detail.state == "track") {
                if (this._resizingRAF)
                    cancelAnimationFrame(this._resizingRAF);

                this._resizingRAF = requestAnimationFrame(() => {
                    var width = Math.max(this.column.calculatedWidth + detail.dx, minimumColumnWidth);

                    this.style.width = `${width}px`;
                    this.fire("column-widths-updated", { column: this.column, columnWidth: width });
                });
            }
            else if (detail.state == "end") {
                this.classList.remove("resizing");

                this.style.width = "";

                this.column.calculatedWidth = Math.max(this.column.calculatedWidth + detail.dx, minimumColumnWidth);
                this.column.width = `${this.column.calculatedWidth}px`;

                this.fire("column-widths-updated", { column: this.column, save: true });
            }
        }
    }
}