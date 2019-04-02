namespace Vidyano.WebComponents {
    export type QueryGridLazyQueryResultItem = {
        item?: Vidyano.QueryResultItem;
        group?: Vidyano.QueryResultItemGroup;
        loader?: Promise<Vidyano.QueryResultItem>;
    };

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
            },
            columns: {
                type: Array,
                computed: "_computeColumns(query.columns)"
            },
            items: {
                type: Array,
                computed: "_computeItems(query.items, hasGrouping, isConnected)"
            },
            horizontalScrollOffset: {
                type: Number
            },
            dataHostWidth: {
                type: Number,
                observer: "_dataHostWidthChanged"
            },
            loading: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: true
            },
            hasGrouping: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasGrouping(query.groupingInfo)"
            }
        },
        forwardObservers: [
            "query.items",
            "query.groupingInfo",
            "query.columns"
        ],
        observers: [
            "_syncHorizontalScrollOffset(horizontalScrollOffset)"
        ],
        listeners: {
            "row-connected": "_rowConnected",
            "item-select": "_itemSelect"
        }
    })
    export class QueryGrid extends Vidyano.WebComponents.WebComponent {
        private _measureAF: number;
        private _physicalRows: QueryGridRow[];
        private _syncingHeader: boolean;
        private _syncingData: boolean;
        private _lastSelectedItemIndex: number;
        readonly loading: boolean; private _setLoading: (loading: boolean) => void;
        readonly hasGrouping: boolean;
        query: Vidyano.Query;
        horizontalScrollOffset: number;

        connectedCallback() {
            super.connectedCallback();

            this.app.importComponent("ActionButton");
            this.app.importLib("iron-list");

            this.$.headerHost.addEventListener("scroll", e => {
                if (!this._syncingHeader) {
                    this._syncingData = true;
                    this.horizontalScrollOffset = this.$.headerHost.scrollLeft;
                }
                this._syncingHeader = false;
            }, { capture: true, passive: true });
        }

        private _syncHorizontalScrollOffset(horizontalScrollOffset: number) {
            if (!this._syncingData) {
                this._syncingHeader = true;
                const horizontalScrollOffset = this.horizontalScrollOffset;
                this.$.headerHost.scrollLeft = horizontalScrollOffset;

                if (this._physicalRows && this._physicalRows.length)
                    this._physicalRows.forEach(row => row.scrollHorizontal(horizontalScrollOffset));
            }
            this._syncingData = false;
        }

        private _dataHostWidthChanged(dataHostWidth: number) {
            this.updateStyles({
                "--vi-query-grid--row-container-width": `${dataHostWidth}px`
            });
        }

        private _computeColumns(columns: Vidyano.QueryColumn[]): QueryGridColumn[] {
            if (!columns)
                return [];

            const columnsSlot = <HTMLSlotElement>this.$.columns;

            const gridColumns = <QueryGridColumn[]>Array.from(this.querySelectorAll("vi-query-grid-column"));
            if (gridColumns.length) {
                return gridColumns.map(g => {
                    g.column = columns.find(c => c.name === g.name);
                    return g.column ? g : null;
                }).filter(c => !!c);
            }

            return columns.map(c => {
                const gc = new Vidyano.WebComponents.QueryGridColumn();
                gc.name = c.name;
                gc.column = c;
                return gc;
            });
        }

        private _computeHasGrouping(groupingInfo: Vidyano.IQueryGroupingInfo): boolean {
            return groupingInfo != null && groupingInfo.groups != null;
        }

        private _computeItems(items: Vidyano.QueryResultItem[], hasGrouping: boolean): QueryGridLazyQueryResultItem[] {
            // Make sure the list scrollTarget is set to the vi-scroller
            const list = <any>this.$.dataList;
            list.scrollTarget = (<Scroller>this.$.dataHost).scroller;

            this._setLoading(true);

            const handler = {
                lazyItems: [],
                get: (target, prop) => {
                    if (prop === "length") {
                        if (!this.query.hasSearched)
                            return 0;

                        if (!this.query.hasMore)
                            return this.query.totalItems + (hasGrouping ? this.query.groupingInfo.groups.length : 0);
                        else
                            return this.query.totalItems + 1;
                    }
                    else if (!isNaN(prop)) {
                        const lazyIndex = parseInt(prop);
                        if (handler.lazyItems[lazyIndex])
                            return handler.lazyItems[lazyIndex];

                        let itemIndex = lazyIndex;
                        if (hasGrouping) {
                            let diff = 0;
                            const groupIndex = this.query.groupingInfo.groups.findIndex(g => {
                                diff += g.isCollapsed ? g.count + 1 : 1;
                                if (g.end < itemIndex - diff)
                                    return false;

                                return true;
                            });

                            const group = this.query.groupingInfo.groups[groupIndex];
                            if (group.start + groupIndex === itemIndex) {
                                return (handler.lazyItems[lazyIndex] = {
                                    group: group
                                });
                            }
                            else
                                itemIndex -= diff;
                        }

                        const item = target[itemIndex];
                        const lazyItem: QueryGridLazyQueryResultItem = {
                            item: item
                        };

                        if (!lazyItem.item) {
                            let resolve: (item: Vidyano.QueryResultItem) => void;
                            lazyItem.loader = new Promise<Vidyano.QueryResultItem>(r => resolve = r);

                            this.query.queueWork(async () => {
                                if (!this.query.items[itemIndex]) {
                                    const hasMoreItemCount = this.query.hasMore ? target.length : -1;
                                    await this.query.getItems(itemIndex, this.query.pageSize, true);

                                    if (hasMoreItemCount > 0) {
                                        (<Polymer.Element>this.$.dataList).notifySplices("items", [{
                                            index: hasMoreItemCount,
                                            removed: [],
                                            addedCount: this.query.items.length - hasMoreItemCount,
                                            items: this.query.items,
                                            type: "splice"
                                        }]);
                                    }
                                }

                                lazyItem.item = this.query.items[itemIndex];
                                lazyItem.loader = null;

                                resolve(lazyItem.item);
                            });
                        }

                        return (handler.lazyItems[lazyIndex] = lazyItem);
                    }
                    else
                        return target[prop];
                }
            };

            return new Proxy(items, handler);
        }

        private _queryChanged() {
            this.updateStyles();
            this._setLoading(true);
        }

        private _rowConnected(e: CustomEvent) {
            e.stopPropagation();

            const detail: { item: Vidyano.QueryResultItem; index: number; row: QueryGridRow; } = e.detail;
            (this._physicalRows || (this._physicalRows = [])).push(detail.row);

            if (!this.loading)
                return;

            const measure = () => {
                if (!this.loading)
                    return;

                const rows = this._physicalRows.filter(row => !!row.item);
                if (rows.length === rows.filter(r => !r.loading).length) {
                    this._measureAF = 0;

                    const parentBoundingRect = this.$.dataHost.getBoundingClientRect();
                    const rowRect = detail.row.getBoundingClientRect();

                    if (rowRect.bottom > parentBoundingRect.height || detail.index === this.query.items.length - 1) {
                        const headersTemplate = <any>this.$.headers;
                        headersTemplate.render();

                        const headers: { [key: string]: number; } = {};
                        this.shadowRoot.querySelectorAll("vi-query-grid-header").forEach((header: QueryGridHeader) => headers[header.column.name] = header.offsetWidth);

                        const style = {};
                        let totalWidth = 0;

                        // TODO Use Array.flat after Edge moved to Chromium
                        const flat = <T>(array: T[][]): T[] => [].concat.apply([], array);
                        const cellWidths = flat(this._physicalRows.map(row => row.getCellWidths()));
                        cellWidths.groupBy(cw => cw.column.name).forEach(cwg => {
                            const width = Math.max(cwg.value.max(cw => cw.width), headers[cwg.key]);
                            totalWidth += width;
                            style[`--vi-query-grid-attribute-${cwg.key.replace(".", "-")}-width`] = `${width}px`;
                        });

                        style["--vi-query-grid--row-width"] = `${totalWidth}px`;
                        this.updateStyles(style);

                        this._setLoading(false);
                    }
                }

                if (this.loading)
                    this._measureAF = requestAnimationFrame(measure);
            };

            cancelAnimationFrame(this._measureAF);
            this._measureAF = requestAnimationFrame(measure);
        }

        private _itemSelect(e: CustomEvent) {
            const detail: { item: Vidyano.QueryResultItem; shift: boolean; ctrl: boolean; } = e.detail;

            const indexOfItem = this.query.items.indexOf(detail.item);
            if (!detail.item.isSelected && this._lastSelectedItemIndex >= 0 && detail.shift) {
                if (this.query.selectRange(Math.min(this._lastSelectedItemIndex, indexOfItem), Math.max(this._lastSelectedItemIndex, indexOfItem))) {
                    this._lastSelectedItemIndex = indexOfItem;
                    return;
                }
            }

            if (!detail.ctrl) {
                if (this.query.selectAll.isAvailable && this.query.selectAll)
                    this.query.selectAll.allSelected = this.query.selectAll.inverse = false;

                this.query.selectedItems = this.query.selectedItems.length > 1 || !detail.item.isSelected ? [detail.item] : [];
            }
            else
                detail.item.isSelected = !detail.item.isSelected;

            if (detail.item.isSelected)
                this._lastSelectedItemIndex = indexOfItem;
        }
    }
}