namespace Vidyano.WebComponents {
    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            lazyItem: {
                type: Object,
                observer: "_lazyItemChanged"
            },
            item: {
                type: Object,
                readOnly: true
            },
            group: {
                type: Object,
                readOnly: true
            },
            columns: Array,
            index: {
                type: Number,
                observer: "_indexChanged"
            },
            canRead: {
                type: Boolean,
                computed: "_computeCanRead(item, item.query.canRead)",
                reflectToAttribute: true
            },
            loading: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            }
        },
        observers: [
            "_fireConnected(item, index, isConnected)"
        ],
        forwardObservers: [
            "item.isSelected"
        ],
        listeners: {
            "tap": "_getPersistentObject"
        }
    })
    export class QueryGridRow extends Vidyano.WebComponents.WebComponent {
        private _connectedFired: boolean;
        private _columnsToRender: QueryGridColumn[];
        readonly loading: boolean; private _setLoading: (loading: boolean) => void;
        readonly item: QueryResultItem; private _setItem: (item: QueryResultItem) => void;
        readonly group: QueryResultItemGroup; private _setGroup: (group: QueryResultItemGroup) => void;
        lazyItem: QueryGridLazyQueryResultItem;
        columns: QueryGridColumn[];

        disconnectedCallback() {
            super.disconnectedCallback();
            this._connectedFired = false;
        }

        scrollHorizontal(offset: number) {
            const header = <HTMLDivElement>this.shadowRoot.querySelector("#header");
            if (header)
                header.style.transform = `translate3d(${offset}px, 0, 0)`;

            const group = <HTMLDivElement>this.shadowRoot.querySelector("#group");
            if (group)
                group.style.transform = `translate3d(${offset}px, 0, 0)`;
        }

        private async _lazyItemChanged(lazyItem: QueryGridLazyQueryResultItem, oldLazyItem: QueryGridLazyQueryResultItem) {
            this._setLoading(true);

            if (!lazyItem) {
                this._setItem(null);
                this._setGroup(null);

                this.classList.remove("group", "item");

                this._setLoading(false);
                return;
            }

            if (lazyItem.group) {
                this._setItem(null);
                this._setGroup(lazyItem.group);

                this.classList.remove("item");
                this.classList.add("group");
                this.classList.toggle("first", lazyItem.group.start === 0);

                this._setLoading(false);
                return;
            }
            else if (this.group) {
                this._setGroup(null);
                this.classList.remove("group");
            }

            if (this.item === lazyItem.item)
                return;

            this.classList.add("item");
            if (!lazyItem.item && lazyItem.loader) {
                this._setItem(null);
                await lazyItem.loader;

                if (lazyItem !== this.lazyItem)
                    return;
            }

            const cells = <QueryGridCell[]>Array.from(this.shadowRoot.querySelectorAll("vi-query-grid-cell"));
            if (cells.some(cell => cell.item === lazyItem.item))
                this._setLoading(this._columnsToRender.length > 0);
            else
                this._columnsToRender = this.columns.slice();

            this._setItem(lazyItem.item);
        }

        private async _getPersistentObject(e: Polymer.TapEvent) {
            if (!this.item || !this.item || !this.item.query.canRead)
                return;

            this.fire("open", this.lazyItem);
        }

        private _select(e: Polymer.TapEvent) {
            const mouse = e.detail.sourceEvent instanceof MouseEvent ? e.detail.sourceEvent : null;
            this.fire("item-select", {
                item: this.item,
                shift: mouse ? mouse.shiftKey : false,
                ctrl: this.app.configuration.getSetting("vi-query-grid.single-click", "true").toLowerCase() === "true" || (mouse ? mouse.ctrlKey : true)
            }, { bubbles: true });
        }

        private _getIsSelectedIcon(isSelected: boolean): string {
            return isSelected ? "Selected" : "Unselected";
        }

        private _computeCanRead(item: QueryResultItem, canRead: boolean): boolean {
            return canRead && !!item;
        }

        private _fireConnected(item: QueryResultItem, index: number, isConnected: boolean) {
            if (this._connectedFired)
                return;

            this.fire("row-connected", { item: item, index: index, row: this });
            this._connectedFired = true;
        }

        cellRendered(cell: QueryGridCell) {
            this._columnsToRender.remove(cell.column);

            if (!this._columnsToRender.length)
                this._setLoading(false);
        }

        private _indexChanged(index: number) {
            this.classList.toggle("odd", !!((index + 1) % 2));
        }

        getCellWidths(): {
            column: QueryGridColumn;
            width: number;
        }[] {
            const cells = <QueryGridCell[]>Array.from(this.shadowRoot.querySelectorAll("vi-query-grid-cell"));
            return cells.filter(cell => cell.firstElementChild).map(cell => ({
                column: cell.column,
                width: cell.getBoundingClientRect().width
            }));
        }

        private _getGroupName(group: QueryResultItemGroup): string {
            let label = group.name;
            if (StringEx.isNullOrWhiteSpace(label))
                label = label == null ? group.query.service.getTranslatedMessage("DistinctNullValue") : group.query.service.getTranslatedMessage("DistinctEmptyValue");

            return `${label} (${group.count})`;
        }
    }
}