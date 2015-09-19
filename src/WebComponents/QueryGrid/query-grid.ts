module Vidyano.WebComponents {
    export interface QueryGridItemTapEventArgs {
        item: Vidyano.QueryResultItem;
    }

    @WebComponent.register({
        properties: {
            initializing: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: true
            },
            isBusy: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.isBusy"
            },
            query: {
                type: Object
            },
            asLookup: {
                type: Boolean,
                reflectToAttribute: true
            },
            _columns: {
                type: Object,
                computed: "_computeColumns(query.columns)"
            },
            _items: {
                type: Object,
                computed: "_computeItems(query.items, viewportSize, _verticalScrollOffset, rowHeight, _forceUpdate)"
            },
            _forceUpdate: {
                type: Object,
                value: null
            },
            viewportSize: {
                type: Object,
                readOnly: true
            },
            rowHeight: {
                type: Number,
                readOnly: true
            },
            canSelect: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeCanSelect(query)"
            },
            canSelectAll: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.isAvailable"
            },
            selectAllSelected: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.allSelected"
            },
            inlineActions: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeInlineActions(query)"
            },
            canFilter: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeCanFilter(query)"
            },
            _verticalScrollOffset: Number,
            _horizontalScrollOffset: {
                type: Number,
                observer: "_horizontalScrollOffsetChanged"
            }
        },
        observers: [
            "_updateTables(_columns, _items, isAttached)",
            "_updateVerticalSpacer(query.totalItems, rowHeight)",
        ],
        forwardObservers: [
            "query.columns",
            "query.items",
            "query.isBusy",
            "query.totalItems",
            "query.selectAll.isAvailable",
            "query.selectAll.allSelected"
        ],
        listeners: {
            "item-select": "_itemSelect",
            "scroll": "_preventScroll"
        }
    })
    export class QueryGrid extends WebComponent {
        private static tableCache: { header: QueryGridTableHeader; data: QueryGridTableData }[] = [];
        private static perf = performance;

        private _tableData: QueryGridTableData;
        private _tableHeader: QueryGridTableHeader;
        private _tablesUpdating: Promise<any>;
        private _tablesUpdatingTimestamp: Date;
        private _virtualTableOffset: number;
        private _virtualTableOffsetCurrent: number;
        private _virtualTableStartIndex: number;
        private _verticalScrollOffset: number;
        private _horizontalScrollOffset: number;
        private _horizontalScrollOffsetCurrent: number;
        private _items: Vidyano.QueryResultItem[];
        private _columns: Vidyano.QueryColumn[];
        private _columnWidths: { [key: string]: number };
        private _columnOffsets: { [key: string]: number };
        private _itemOpening: Vidyano.QueryResultItem;
        private _lastSelectedItemIndex: number;
        private _remainderWidth: number;
        rowHeight: number;
        viewportSize: Size;
        query: Vidyano.Query;
        asLookup: boolean;

        private _setInitializing: (initializing: boolean) => void;
        private _setViewportSize: (size: Size) => void;
        private _setRowHeight: (rowHeight: number) => void;

        attached() {
            if (QueryGrid.tableCache.length > 0 && !this._tableData) {
                var tableCache = QueryGrid.tableCache.pop();

                requestAnimationFrame(() => {
                    this._tableHeader = tableCache.header;
                    this._tableData = tableCache.data;

                    this._tableHeader.grid = this._tableData.grid = this;

                    this.$["dataHeaderHost"].appendChild(this._tableHeader.host);
                    this.$["dataHost"].appendChild(this._tableData.host);
                });
            }

            super.attached();
        }

        detached() {
            super.detached();

            if (this._tableData) {
                var headerFragment = document.createDocumentFragment();
                var dataFragment = document.createDocumentFragment();

                var cachEntry = {
                    header: this._tableHeader,
                    data: this._tableData
                };

                QueryGrid.tableCache.push(cachEntry);

                requestAnimationFrame(() => {
                    headerFragment.appendChild(this._tableHeader.host);
                    dataFragment.appendChild(this._tableData.host);

                    this._tableHeader.grid = this._tableData.grid = null;
                    this._tableHeader = this._tableData = null;
                });

                this.transform("", this._tableHeader.host);
                this._tableHeader.rows[0].columns.forEach(cell => {
                    if (cell.column && cell.column.isPinned)
                        this.transform("", cell.cell.parentElement);

                    cell.setColumn(null);
                });

                Enumerable.from(this._tableData.rows).forEach((row: QueryGridTableDataRow) => {
                    row.columns.forEach(cell => {
                        if (cell.column && cell.column.isPinned)
                            this.transform("", cell.cell.parentElement);
                    });
                    this.transform("", row.selector.host);
                    this.transform("", row.actions.host);

                    row.setItem(null, null);
                });
            }
        }

        isColumnInView(column: QueryColumn): boolean {
            if (column.isPinned || !this._columnOffsets)
                return true;

            return (this._columnOffsets[column.name] || 0) < this.viewportSize.width + this._horizontalScrollOffset;
        }

        private get _style(): Style {
            return <Style><any>this.$["style"];
        }

        private get _actions(): PopupCore {
            return <PopupCore><any>this.$["actions"];
        }

        private _sizeChanged(e: CustomEvent, detail: Size) {
            this._setViewportSize(detail);
            this._setRowHeight(parseInt(getComputedStyle(this).lineHeight));

            this._requestAnimationFrame(() => {
                this._updateTableDataPendingUpdates();
                if (!this._remainderWidth || this._remainderWidth < detail.width) {
                    this._style.setStyle("Remainder", `td[is="vi-query-grid-table-column-remainder"] { width: ${detail.width}px; }`);
                    this._remainderWidth = detail.width * 2;
                }
            });
        }

        private _horizontalScrollOffsetChanged(horizontalScrollOffset: number) {
            if (!this._tableData || (!horizontalScrollOffset && !this._horizontalScrollOffsetCurrent))
                return;

            if (this._actions.open)
                this._actions.close();

            this.transform(`translate(${-(this._horizontalScrollOffsetCurrent = horizontalScrollOffset) }px, 0)`, this._tableHeader.host);
            [this._tableHeader, this._tableData].forEach(table => {
                table.rows.forEach(row => {
                    row.columns.forEach(column => {
                        if (column.host.classList.contains("pinned"))
                            this.transform(`translate(${horizontalScrollOffset}px, 0)`, column.host);
                    });

                    if (row instanceof QueryGridTableDataRow) {
                        this.transform(`translate(${horizontalScrollOffset}px, 0)`, row.selector.host);
                        this.transform(`translate(${horizontalScrollOffset}px, 0)`, row.actions.host);
                    }
                });
            });

            this._updateTableDataPendingUpdates();
        }

        private _computeColumns(columns: Vidyano.QueryColumn[] = []): Vidyano.QueryColumn[] {
            return Enumerable.from(columns).where(c => !c.isHidden && c.isPinned).orderBy(c => c.offset).concat(Enumerable.from(columns).where(c => !c.isHidden && !c.isPinned).orderBy(c => c.offset).toArray()).toArray();
        }

        private _computeItems(items: Vidyano.QueryResultItem[], viewportSize: Size, verticalScrollOffset: number, rowHeight: number): Vidyano.QueryResultItem[] {
            if (!rowHeight || !viewportSize.height)
                return [];

            if (this._actions.open)
                this._actions.close();

            var maxTableRowCount = Math.floor(viewportSize.height * 1.5 / rowHeight);
            var viewportStartRowIndex = Math.floor(verticalScrollOffset / rowHeight);
            var viewportEndRowIndex = Math.ceil((verticalScrollOffset + viewportSize.height) / rowHeight);
            var newVirtualTableStartIndex;

            if (this._virtualTableStartIndex === undefined)
                this._virtualTableStartIndex = newVirtualTableStartIndex = 0;
            else if (viewportEndRowIndex - this._virtualTableStartIndex > maxTableRowCount)
                newVirtualTableStartIndex = viewportStartRowIndex;
            else if (viewportStartRowIndex < this._virtualTableStartIndex)
                newVirtualTableStartIndex = viewportEndRowIndex - maxTableRowCount;

            if (newVirtualTableStartIndex !== undefined) {
                if (newVirtualTableStartIndex % 2 != 0)
                    newVirtualTableStartIndex--;

                if (newVirtualTableStartIndex < 0)
                    newVirtualTableStartIndex = 0;

                this._virtualTableStartIndex = newVirtualTableStartIndex;
                this._virtualTableOffset = this._virtualTableStartIndex * rowHeight;
            }

            var newItems = items.slice(this._virtualTableStartIndex, this._virtualTableStartIndex + maxTableRowCount).filter(item => !!item);
            if (newItems.length !== maxTableRowCount && this.query.totalItems && items.length !== this.query.totalItems) {
                this.query.getItems(this._virtualTableStartIndex).then(() => {
                    this.set("_forceUpdate", new Date());
                });
            }
            else if (newVirtualTableStartIndex === undefined && this._items && this._items.length === newItems.length)
                return this._items;

            return newItems;
        }

        private _updateTables(columns: Vidyano.QueryColumn[], items: Vidyano.QueryResultItem[]) {
            var _tablesUpdatingTimestamp = this._tablesUpdatingTimestamp = new Date();

            var tablesUpdating = this._tablesUpdating = (this._tablesUpdating || Promise.resolve()).then(() => new Promise(resolve => {
                if (_tablesUpdatingTimestamp !== this._tablesUpdatingTimestamp)
                    return resolve(null);
                
                this._requestAnimationFrame(() => {
                    var start = Vidyano.WebComponents.QueryGrid.perf.now();

                    if (!this._tableHeader)
                        this.$["dataHeaderHost"].appendChild((this._tableHeader = new Vidyano.WebComponents.QueryGridTableHeader(this)).host);

                    if (!this._tableData)
                        this.$["dataHost"].appendChild((this._tableData = new Vidyano.WebComponents.QueryGridTableData(this)).host);
                    
                    Promise.all([this._tableHeader.update(1, columns.length), this._tableData.update(items.length, columns.length)]).then(() => {
                        var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                        console.info(`Tables Updated: ${Math.round(timeTaken) }ms`);

                        this._updateTableHeaders(columns).then(cont => {
                            if (!cont)
                                return Promise.resolve();

                            return this._updateTableData(items);
                        }).then(() => {
                            resolve(null);

                            if (tablesUpdating === this._tablesUpdating)
                                this._tablesUpdating = null;
                        });
                    });
                });
            }));
        }

        private _updateVerticalSpacer(totalItems: number, rowHeight: number) {
            this._requestAnimationFrame(() => {
                var newHeight = totalItems * rowHeight;
                this.$["verticalSpacer"].style.height = `${newHeight}px`;

                if (newHeight > this._virtualTableOffset)
                    this.set("_forceUpdate", new Date());
            });
        }

        private _updateTableHeaders(columns: Vidyano.QueryColumn[]): Promise<boolean> {
            return new Promise(resolve => {
                this._requestAnimationFrame(() => {
                    if (columns !== this._columns) {
                        resolve(false);
                        return;
                    }

                    (<QueryGridTableHeaderRow>this._tableHeader.rows[0]).setColumns(columns);

                    resolve(true);
                });
            });
        }

        private _updateTableData(items: Vidyano.QueryResultItem[]): Promise<any> {
            var horizontalScrollOffset = this._horizontalScrollOffset;
            var virtualTableStartIndex = this._virtualTableStartIndex;

            return new Promise(resolve => {
                var start = Vidyano.WebComponents.QueryGrid.perf.now();

                var rowCount = this._tableData && this._tableData.rows && this._tableData.rows.length > 0 ? this._tableData.rows.length : 0;
                var virtualTableOffset = this._virtualTableOffset;

                this._requestAnimationFrame(() => {
                    for (var index = 0; index < rowCount; index++) {
                        if (items != this._items || virtualTableStartIndex !== this._virtualTableStartIndex) {
                            resolve(false);
                            return;
                        }

                        (<QueryGridTableDataRow>this._tableData.rows[index]).setItem(items[index], this._columns);
                    }

                    if (this._virtualTableOffsetCurrent !== this._virtualTableOffset && this._virtualTableOffset === virtualTableOffset)
                        this.translate3d("0", `${this._virtualTableOffsetCurrent = this._virtualTableOffset}px`, "0", this.$["dataHost"]);

                    var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                    console.info(`Data Updated: ${timeTaken }ms`);

                    this._updateColumnWidths().then(() => {
                        resolve(true);
                    });
                });
            });
        }

        private _updateTableDataPendingUpdatesRAF: number;
        private _updateTableDataPendingUpdates() {
            if (!this._tableData)
                return;

            if (this._updateTableDataPendingUpdatesRAF)
                cancelAnimationFrame(this._updateTableDataPendingUpdatesRAF);

            this._updateTableDataPendingUpdatesRAF = this._requestAnimationFrame(() => {
                var start = Vidyano.WebComponents.QueryGrid.perf.now();

                Enumerable.from((<QueryGridTableDataRow[]>this._tableData.rows)).forEach(row => row.updatePendingCellUpdates());

                var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                console.info(`Pending Data Updated: ${timeTaken }ms`);
            });
        }

        private _updateColumnWidths(): Promise<any> {
            return new Promise(resolve => {
                this._requestAnimationFrame(() => {
                    if (!this._tableData || !this._tableData.rows || this._tableData.rows.length == 0 || this._tableData.rows[0].host.hasAttribute("no-data")) {
                        if (this.query && !this.query.isBusy)
                            this._setInitializing(false);

                        resolve(null);
                        return;
                    }

                    var start = Vidyano.WebComponents.QueryGrid.perf.now();

                    var invalidateColumnWidths: boolean;
                    var columnWidths = this._columnWidths || {};
                    var columnOffsets = this._columnOffsets || {};

                    [this._tableHeader, this._tableData].some(table => {
                        if (table.rows && table.rows.length > 0) {
                            var offset = 0;

                            return table.rows[0].columns.filter(cell => !!cell.column && (!this._columnWidths || !this._columnWidths[cell.column.name])).some(cell => {
                                var width = cell.cell.offsetWidth;

                                if (width !== columnWidths[cell.column.name]) {
                                    columnWidths[cell.column.name] = Math.max(width, columnWidths[cell.column.name] || 0);
                                    invalidateColumnWidths = true;
                                }

                                columnOffsets[cell.column.name] = offset;
                                offset += columnWidths[cell.column.name];

                                if (!columnWidths[cell.column.name]) {
                                    invalidateColumnWidths = false;
                                    return true;
                                }
                            });
                        }
                    });

                    if (invalidateColumnWidths) {
                        if (columnWidths !== this._columnWidths)
                            this._columnWidths = columnWidths;

                        if (columnOffsets !== this._columnOffsets)
                            this._columnOffsets = columnOffsets;

                        var columnWidthsStyle: string[] = [];

                        this._columns.forEach((col, index) => {
                            var columnName = Vidyano.WebComponents.QueryGridTableColumn.columnSafeName(col.name);
                            columnWidthsStyle.push(`table td[name="${columnName}"] > * { width: ${this._columnWidths[col.name]}px; } `);
                        });

                        this._style.setStyle("ColumnWidths", ...columnWidthsStyle);
                    }

                    var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                    console.info(`Column Widths Updated: ${timeTaken}ms`);

                    this._setInitializing(false);

                    resolve(null);
                });
            });
        }

        private _requestAnimationFrame(action: () => void): number {
            return requestAnimationFrame(() => {
                if (!this.isAttached)
                    return;

                action();
            });
        }

        private _itemSelect(e: CustomEvent, detail: { item: Vidyano.QueryResultItem; rangeSelect: boolean }) {
            if (!detail.item)
                return;

            var indexOfItem = this.query.items.indexOf(detail.item);
            if (!detail.item.isSelected && this._lastSelectedItemIndex >= 0 && detail.rangeSelect) {
                if (this.query.selectRange(Math.min(this._lastSelectedItemIndex, indexOfItem), Math.max(this._lastSelectedItemIndex, indexOfItem))) {
                    this._lastSelectedItemIndex = indexOfItem;
                    return;
                }
            }

            if (detail.item.isSelected = !detail.item.isSelected)
                this._lastSelectedItemIndex = indexOfItem;
        }

        private _preventScroll(e: Event) {
            if (this.scrollLeft > 0 || this.scrollTop > 0) {
                console.error("Attempt to scroll query grid");

                this.scrollLeft = this.scrollTop = 0;

                e.preventDefault();
                e.stopPropagation();
            }
        }

        private _computeCanSelect(query: Vidyano.Query): boolean {
            return !!query && query.actions.some(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue);
        }

        private _computeCanSelectAll(query: Vidyano.Query, canSelect: boolean): boolean {
            return canSelect && query.selectAll.isAvailable;
        }

        private _computeInlineActions(query: Vidyano.Query): boolean {
            return !!query && !query.asLookup && !this.asLookup && (query.actions.some(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1)));
        }

        private _computeCanFilter(query: Vidyano.Query): boolean {
            return !!query && query.canFilter;
        }
    }

    @WebComponent.register({
        properties: {
            query: Object,
            canSelectAll: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.isAvailable"
            },
            selectAllSelected: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.allSelected"
            },
            selectAllInversed: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.inverse"
            },
            canFilter: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        forwardObservers: [
            "query.selectAll.isAvailable",
            "query.selectAll.allSelected",
            "query.selectAll.inverse"
        ]
    })
    export class QueryGridHeader extends WebComponent {
        query: Vidyano.Query;

        private _toggleSelectAll() {
            if (!this.query || !this.query.selectAll.isAvailable)
                return;

            this.query.selectAll.allSelected = !this.query.selectAll.allSelected;
        }
    }

    export abstract class QueryGridTable {
        private _host: HTMLTableElement;
        private _section: HTMLTableSectionElement;
        rows: QueryGridTableRow[] = [];

        constructor(is: string, public grid: QueryGrid) {
            this._host = (<any>document).createElement("table", is);
        }

        update(rowCount: number, columnCount: number): Promise<any> {
            if (!this.section)
                this._section = this._createSection();

            if (this.rows.length < rowCount) {
                var fragment = document.createDocumentFragment();

                while (this.rows.length < rowCount) {
                    var row = this._addRow();
                    this.rows.push(row);

                    fragment.appendChild(row.host);
                }

                this._section.appendChild(fragment);
            }

            return Promise.all(this.rows.map(row => row.updateColumnCount(columnCount)));
        }

        protected abstract _createSection(): HTMLTableSectionElement;

        protected abstract _addRow(): QueryGridTableRow;

        protected get section(): HTMLTableSectionElement {
            return this._section;
        }

        get host(): HTMLTableElement {
            return this._host;
        }
    }

    export class QueryGridTableHeader extends QueryGridTable {
        constructor(grid: QueryGrid) {
            super("vi-query-grid-table-header", grid);
        }

        update(rowCount: number, columnCount: number): Promise<any> {
            return super.update(1, columnCount);
        }

        protected _addRow(): QueryGridTableRow {
            return new Vidyano.WebComponents.QueryGridTableHeaderRow(this);
        }

        protected _createSection(): HTMLTableSectionElement {
            return this.host.appendChild(document.createElement("thead"));
        }
    }

    export class QueryGridTableData extends QueryGridTable {
        constructor(grid: QueryGrid) {
            super("vi-query-grid-table-data", grid);
        }

        protected _addRow(): QueryGridTableRow {
            return new Vidyano.WebComponents.QueryGridTableDataRow(this);
        }

        protected _createSection(): HTMLTableSectionElement {
            return <HTMLTableSectionElement><any>this.host.appendChild(new Vidyano.WebComponents.QueryGridTableDataBody());
        }
    }

    @Sortable.register({
        extends: "tbody"
    })
    export class QueryGridTableDataBody extends Sortable {
    }

    export abstract class QueryGridTableRow {
        private _host: HTMLTableRowElement;
        private _remainder: QueryGridTableColumnRemainder;
        columns: QueryGridTableColumn[] = [];

        constructor(is: string, private _table: QueryGridTable) {
            this._host = (<any>document).createElement("tr", is);

            this.host.appendChild((this._remainder = new Vidyano.WebComponents.QueryGridTableColumnRemainder()).host);
        }

        updateColumnCount(columnCount: number): Promise<any> {
            if (this.columns.length >= columnCount)
                return Promise.resolve();

            return new Promise(resolve => {
                var columnsFragment = document.createDocumentFragment();

                while (this.columns.length < columnCount) {
                    var column = this._createColumn();
                    this.columns.push(column);

                    columnsFragment.appendChild(column.host);
                }

                this.host.insertBefore(columnsFragment, this._remainder.host);

                resolve(null);
            });
        }

        protected abstract _createColumn(): QueryGridTableColumn;

        get table(): QueryGridTable {
            return this._table;
        }

        get host(): HTMLTableRowElement {
            return this._host;
        }
    }

    export class QueryGridTableHeaderRow extends QueryGridTableRow {
        constructor(table: QueryGridTableHeader) {
            super("vi-query-grid-table-header-row", table);
        }

        setColumns(columns: Vidyano.QueryColumn[]) {
            this.columns.forEach((col, index) => col.setColumn(columns[index]));
        }

        protected _createColumn(): QueryGridTableColumn {
            return new Vidyano.WebComponents.QueryGridTableHeaderColumn();
        }
    }

    export class QueryGridTableDataRow extends QueryGridTableRow {
        private _itemPropertyChangedListener: Vidyano.Common.SubjectDisposer;
        private _itemQueryPropertyChangedListener: Vidyano.Common.SubjectDisposer;
        private _selector: QueryGridTableDataColumnSelector;
        private _actions: QueryGridTableDataColumnActions;
        private _item: Vidyano.QueryResultItem;
        private _columnCount: number;
        private _firstCellWithPendingUpdates: number;
        private _isSelected: boolean;
        private _noData: boolean;
        columns: QueryGridTableDataColumn[];

        constructor(table: QueryGridTableData) {
            super("vi-query-grid-table-data-row", table);

            this._noData = true;
            this.host.setAttribute("no-data", "");

            var specialColumns = document.createDocumentFragment();

            specialColumns.appendChild((this._selector = new Vidyano.WebComponents.QueryGridTableDataColumnSelector(this)).host);
            specialColumns.appendChild((this._actions = new Vidyano.WebComponents.QueryGridTableDataColumnActions(this)).host);

            this.host.insertBefore(specialColumns, this.host.firstChild);
            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
        }

        get selector(): QueryGridTableDataColumnSelector {
            return this._selector;
        }

        get actions(): QueryGridTableDataColumnActions {
            return this._actions;
        }

        get item(): Vidyano.QueryResultItem {
            return this._item;
        }

        setItem(item: Vidyano.QueryResultItem, columns: Vidyano.QueryColumn[]) {
            if (this._item !== item) {
                if (this._itemPropertyChangedListener) {
                    this._itemPropertyChangedListener();
                    this._itemPropertyChangedListener = null;

                    this._itemQueryPropertyChangedListener();
                    this._itemQueryPropertyChangedListener = null;
                }

                this._item = this.selector.item = this.actions.item = item;

                if (this._noData != !item) {
                    if (this._noData = !item)
                        this.host.setAttribute("no-data", "");
                    else
                        this.host.removeAttribute("no-data");
                }

                if (!!this._item) {
                    this._itemPropertyChangedListener = this._item.propertyChanged.attach(this._itemPropertyChanged.bind(this));
                    this._itemQueryPropertyChangedListener = this._item.query.propertyChanged.attach(this._itemQueryPropertyChanged.bind(this));
                }

                this._updateIsSelected();
            }

            this._firstCellWithPendingUpdates = -1;
            this.columns.slice(0, columns ? this._columnCount = columns.length : this._columnCount).forEach((column, index) => {
                if (!column.setItem(item, columns ? columns[index] : null) && this._firstCellWithPendingUpdates < 0)
                    this._firstCellWithPendingUpdates = index;
            });
        }

        updatePendingCellUpdates() {
            if (this._firstCellWithPendingUpdates < 0)
                return;

            for (var i = this._firstCellWithPendingUpdates; i < this.columns.length; i++) {
                if (this.columns[i].update())
                    this._firstCellWithPendingUpdates++;
                else
                    return;
            }

            this._firstCellWithPendingUpdates = -1;
        }

        private _tap(e: TapEvent) {
            if (!this.item)
                return;

            if (!this.table.grid.query.asLookup && !this.table.grid.asLookup) {
                if (!this.table.grid.app.noHistory && e.detail.sourceEvent && ((<KeyboardEvent>e.detail.sourceEvent).ctrlKey || (<KeyboardEvent>e.detail.sourceEvent).shiftKey)) {
                    // Open in new window/tab
                    window.open(document.location.origin + document.location.pathname + "#!/" + this.table.grid.app.getUrlForPersistentObject(this.item.query.persistentObject.id, this.item.id));

                    e.stopPropagation();
                    return;
                }

                this.table.grid["_itemOpening"] = this.item;
                this.item.getPersistentObject().then(po => {
                    if (!po)
                        return;

                    if (this.table.grid["_itemOpening"] === this.item) {
                        this.table.grid["_itemOpening"] = undefined;

                        this.item.query.service.hooks.onOpen(po);
                    }
                });
            }
            else
                this.table.grid.fire("item-tap", { item: this.item }, { bubbles: false });
        }

        private _itemPropertyChanged(sender: Vidyano.QueryResultItem, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "isSelected")
                this._updateIsSelected();
        }

        private _itemQueryPropertyChanged(sender: Vidyano.QueryResultItem, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "selectedItems")
                this._updateIsSelected();
        }

        private _updateIsSelected() {
            if (this._isSelected != (!!this.item && this.item.isSelected)) {
                if (this._isSelected = !!this.item && this.item.isSelected)
                    this.host.setAttribute("is-selected", "");
                else
                    this.host.removeAttribute("is-selected");
            }
        }

        protected _createColumn(): QueryGridTableColumn {
            return new Vidyano.WebComponents.QueryGridTableDataColumn(this);
        }
    }

    export abstract class QueryGridTableColumn {
        private _host: HTMLTableColElement;
        private _column: Vidyano.QueryColumn;
        private _hasContent: boolean;

        constructor(is: string, private _cell?: HTMLElement | DocumentFragment, private _isPinned?: boolean) {
            this._host = (<any>document).createElement("td", is);

            if (_cell)
                this._cell = this.host.appendChild(_cell);

            if (this._isPinned)
                this.host.classList.add("pinned");
        }

        get host(): HTMLTableColElement {
            return this._host;
        }

        get cell(): HTMLElement {
            return <HTMLElement>this._cell;
        }

        get column(): Vidyano.QueryColumn {
            return this._column;
        }

        get isPinned(): boolean {
            return this._isPinned;
        }

        setColumn(column: Vidyano.QueryColumn) {
            if (column == this._column)
                return;

            if (!(this._column = column) || this._column.isPinned != this._isPinned) {
                if (this._isPinned = this._column ? this._column.isPinned : false)
                    this.host.classList.add("pinned");
                else
                    this.host.classList.remove("pinned");
            }

            this.host.setAttribute("name", this._column ? Vidyano.WebComponents.QueryGridTableColumn.columnSafeName(this._column.name) : "");
        }

        get hasContent(): boolean {
            return this._hasContent;
        }

        protected _setHasContent(hasContent: boolean) {
            this._hasContent = hasContent;
        }

        static columnSafeName(name: string): string {
            var safeName = name.replace(/[\. ]/g, "_");

            if (/^\d/.test(safeName))
                safeName = "_" + safeName;

            return safeName;
        }
    }

    export class QueryGridTableHeaderColumn extends QueryGridTableColumn {
        constructor() {
            super("vi-query-grid-table-header-column", new Vidyano.WebComponents.QueryGridColumnHeader());
        }

        setColumn(column: Vidyano.QueryColumn) {
            if (this.column === column)
                return;

            super.setColumn((<QueryGridColumnHeader><any>this.cell).column = column);
        }
    }

    export class QueryGridTableDataColumn extends QueryGridTableColumn {
        private _item: Vidyano.QueryResultItem;
        private _hasPendingUpdate: boolean;
        private _foreground: { currentValue?: any; originalValue?: any } = {};
        private _fontWeight: { currentValue?: any; originalValue?: any } = {};
        private _textAlign: { currentValue?: any; originalValue?: any } = {};
        private _extraClass: string;
        private _typeHints: any;
        private _textNode: Text;
        private _textNodeValue: string;
        private _customCellTemplate: TemplatePresenter;
        private _lastColumnType: string;

        constructor(private _row: QueryGridTableDataRow) {
            super("vi-query-grid-table-data-column", document.createElement("div"));
        }

        get item(): Vidyano.QueryResultItem {
            return this._item;
        }

        get hasPendingUpdate(): boolean {
            return this._hasPendingUpdate;
        }

        setItem(item: Vidyano.QueryResultItem, column: Vidyano.QueryColumn): boolean {
            this.setColumn(column);
            this._item = item;

            return !(this._hasPendingUpdate = !this._render());
        }

        update(): boolean {
            if (!this._hasPendingUpdate)
                return false;

            return !(this._hasPendingUpdate = !this._render());
        }

        private _render(): boolean {
            if (this.column) {
                if (this._lastColumnType !== this.column.type) {
                    if (this._customCellTemplate)
                        this.cell.removeChild(this._customCellTemplate);

                    if (this._customCellTemplate = QueryGridCellTemplate.Load(this.column.type)) {
                        this._lastColumnType = this.column.type;
                        this.cell.appendChild(this._customCellTemplate);

                        if (this._textNode) {
                            this.cell.removeChild(this._textNode);
                            this._textNode = null;
                        }
                    }
                    else
                        this._lastColumnType = null;
                }
            }
            else
                this._lastColumnType = null;

            if (!this._item || !this.column) {
                if (this.hasContent) {
                    if (this._textNode) {
                        if (this._textNodeValue !== "")
                            this._textNode.nodeValue = this._textNodeValue = "";
                    }
                    else if (this._customCellTemplate)
                        this._customCellTemplate.dataContext = null;

                    this._setHasContent(false);
                }

                return true;
            }

            if (!this._row.table.grid.isColumnInView(this.column))
                return false;

            var itemValue = this._item.getFullValue(this.column.name);

            // Render Text
            if (!this._customCellTemplate) {
                this._typeHints = Vidyano.extend({}, this._item.typeHints, value ? value.typeHints : undefined);
                var value = this._item.getValue(this.column.name);
                if (value != null && (this.column.type == "Boolean" || this.column.type == "NullableBoolean"))
                    value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("truekey", "True") : this._getTypeHint("falsekey", "False"));
                else if (this.column.type == "YesNo")
                    value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("truekey", "Yes") : this._getTypeHint("falsekey", "No"));
                else if (this.column.type == "Time" || this.column.type == "NullableTime") {
                    if (value != null) {
                        value = value.trimEnd('0').trimEnd('.');
                        if (value.startsWith('0:'))
                            value = value.substr(2);
                        if (value.endsWith(':00'))
                            value = value.substr(0, value.length - 3);
                    }
                }

                if (value != null) {
                    var format = this._getTypeHint("displayformat", null);
                    if (format == null || format == "{0}") {
                        switch (this.column.type) {
                            case "Date":
                            case "NullableDate":
                                format = null;
                                value = value.localeFormat(CultureInfo.currentCulture.dateFormat.shortDatePattern, true);
                                break;

                            case "DateTime":
                            case "NullableDateTime":
                            case "DateTimeOffset":
                            case "NullableDateTimeOffset":
                                format = null;
                                value = value.localeFormat(CultureInfo.currentCulture.dateFormat.shortDatePattern + " " + CultureInfo.currentCulture.dateFormat.shortTimePattern, true);
                                break;
                        }
                    }

                    if (StringEx.isNullOrEmpty(format))
                        value = value.localeFormat ? value.localeFormat() : value.toLocaleString();
                    else
                        value = StringEx.format(format, value);
                }
                else
                    value = "";

                var foreground = this._getTypeHint("foreground", null);
                if (foreground != this._foreground.currentValue) {
                    if (this._foreground.originalValue === undefined)
                        this._foreground.originalValue = this.cell.style.color;

                    this.cell.style.color = this._foreground.currentValue = foreground || this._foreground.originalValue;
                }

                var textAlign = this._getTypeHint("horizontalcontentalignment", null);
                if (textAlign != this._textAlign.currentValue)
                    this.cell.style.textAlign = this._textAlign.currentValue = textAlign || this._textAlign.originalValue;

                var extraClass = this.column.getTypeHint("extraclass", undefined, value && value.typeHints, true);
                if (extraClass != this._extraClass) {
                    if (!StringEx.isNullOrEmpty(this._extraClass))
                        this._extraClass.split(' ').forEach(cls => this.cell.classList.remove(cls));

                    if (!StringEx.isNullOrEmpty(extraClass)) {
                        this._extraClass = extraClass;
                        this._extraClass.split(' ').forEach(cls => this.cell.classList.add(cls));
                    }
                }

                if (this._textNode) {
                    if (this._textNodeValue !== value)
                        this._textNode.nodeValue = this._textNodeValue = value;
                }
                else
                    this.cell.appendChild(this._textNode = document.createTextNode(this._textNodeValue = value));
            }
            else if (this._customCellTemplate)
                this._customCellTemplate.dataContext = itemValue;

            this._setHasContent(!!value);

            return true;
        }

        protected _getTypeHint(name: string, defaultValue?: string): string {
            return this.column.getTypeHint(name, defaultValue, this._typeHints, true);
        }
    }

    export class QueryGridTableColumnRemainder extends QueryGridTableColumn {
        constructor() {
            super("vi-query-grid-table-column-remainder");
        }
    }

    export class QueryGridTableDataColumnSelector extends QueryGridTableColumn {
        private _item: QueryResultItem;

        constructor(private _row: QueryGridTableDataRow) {
            super("vi-query-grid-table-data-column-selector", Icon.Load("Selected"), true);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
            this._row.table.grid.async(() => this.host.appendChild(document.createElement("paper-ripple")));
        }

        get item(): Vidyano.QueryResultItem {
            return this._item;
        }

        set item(item: Vidyano.QueryResultItem) {
            if (this._item !== item)
                this._item = item;
        }

        private _tap(e: CustomEvent) {
            if (this._item) {
                this._row.table.grid.fire("item-select", {
                    item: this.item,
                    rangeSelect: e.detail.sourceEvent && e.detail.sourceEvent.shiftKey
                }, { bubbles: false });
            }

            e.stopPropagation();
        }
    }

    export class QueryGridTableDataColumnActions extends QueryGridTableColumn {
        private _item: QueryResultItem;

        constructor(private _row: QueryGridTableDataRow) {
            super("vi-query-grid-table-data-column-actions", Icon.Load("EllipsisVertical"), true);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
            this._row.table.grid.async(() => this.host.appendChild(document.createElement("paper-ripple")));
        }

        get item(): Vidyano.QueryResultItem {
            return this._item;
        }

        set item(item: Vidyano.QueryResultItem) {
            if (this._item !== item)
                this._item = item;
        }

        private _tap(e: TapEvent) {
            var gridActions = <PopupCore><any>this._row.table.grid.$["actions"];
            gridActions.empty();

            var actions = (this.item.query.actions || []).filter(a => a.isVisible && !a.isPinned && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1));
            actions.forEach(action => {
                var button = new Vidyano.WebComponents.ActionButton();
                button.action = action;
                button.item = this.item;
                Polymer.dom(gridActions).appendChild(button);
            });

            this.host.parentElement.setAttribute("hover", "");
            gridActions.popup(this.host).then(() => {
                this.host.parentElement.removeAttribute("hover");
            });

            e.stopPropagation();
        }
    }

    @WebComponent.register({
        listeners: {
            "upgrade-filter": "_onUpgradeFilter"
        }
    })
    export class QueryGridColumnHeader extends WebComponent {
        //private _resizeX: number;
        //private _resizeStartWidth: number;
        //private _resizeMinWidth: number;
        private _column: QueryColumn;
        private _columnObserver: Vidyano.Common.SubjectDisposer;
        private _sortingIcon: Resource;
        private _labelTextNode: Text;
        private _filter: QueryGridColumnFilterProxyBase;

        constructor() {
            super();

            Polymer.dom(this).appendChild(this._filter = new Vidyano.WebComponents.QueryGridColumnFilterProxy());
        }

        get column(): QueryColumn {
            return this._column;
        }

        set column(column: QueryColumn) {
            this._filter.column = column;

            if (this._column === column)
                return;

            if (this._columnObserver) {
                this._columnObserver();
                this._columnObserver = null;
            }

            if (this._column = column) {
                this._columnObserver = this.column.propertyChanged.attach(this._columnPropertyChanged.bind(this));

                this._updateLabel(column.label);
                this._updateSortingIcon(this.column.sortDirection);
            }
            else {
                this._updateLabel("");
                this._updateSortingIcon(null);
            }
        }

        private _onUpgradeFilter() {
            var newFilter = new Vidyano.WebComponents.QueryGridColumnFilter();
            newFilter.column = this.column;

            Polymer.dom(this).appendChild(newFilter);
            Polymer.dom(this).removeChild(this._filter);

            this._filter = newFilter;
        }

        private _sort(e: Event) {
            if (this._column.disableSort)
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

            this._column.sort(newSortingDirection, multiSort);
            this._column.query.search().catch(() => { });
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
            var sortingIcon = direction === SortDirection.Ascending ? "SortAsc" : (direction === SortDirection.Descending ? "SortDesc" : "");
            if (sortingIcon) {
                if (!this._sortingIcon) {
                    this._sortingIcon = new Vidyano.WebComponents.Icon();
                    Polymer.dom(this).appendChild(this._sortingIcon);
                }

                this._sortingIcon.source = sortingIcon;
                if (this._sortingIcon.hasAttribute("hidden"))
                    this._sortingIcon.removeAttribute("hidden");
            }
            else if (this._sortingIcon && !this._sortingIcon.hasAttribute("hidden"))
                this._sortingIcon.setAttribute("hidden", "");
        }

        //private _resizeStart(e: MouseEvent) {
        //    this._resizeX = e.clientX;
        //    this._resizeStartWidth = this.gridColumn.currentWidth;
        //    this._resizeMinWidth = this.asElement.offsetHeight;

        //    var overlay = document.createElement("div");
        //    overlay.style.position = "fixed";
        //    overlay.style.zIndex = "100000";
        //    overlay.style.top = "0";
        //    overlay.style.left = "0";
        //    overlay.style.bottom = "0";
        //    overlay.style.right = "0";
        //    overlay.style.backgroundColor = "rgba(0,0,0,0.001)";
        //    overlay.style.cursor = "col-resize";
        //    overlay.addEventListener("mousemove", this._resizeMove.bind(this));
        //    overlay.addEventListener("touchmove", this._resizeMove.bind(this));
        //    overlay.addEventListener("mouseup", this._resizeEnd.bind(this));
        //    overlay.addEventListener("touchend", this._resizeEnd.bind(this));
        //    overlay.addEventListener("touchcancel", this._resizeEnd.bind(this));
        //    document.body.appendChild(overlay);

        //    e.stopPropagation();
        //}

        //private _resizeMove(e: MouseEvent) {
        //    var newWidth = this._resizeStartWidth + e.clientX - this._resizeX;
        //    this.gridColumn.currentWidth = newWidth >= this._resizeMinWidth ? newWidth : this._resizeMinWidth;
        //    this.fire("column-width-updated", { column: this.gridColumn });

        //    e.stopPropagation();
        //}

        //private _resizeEnd(e: Event) {
        //    (<HTMLElement>e.target).parentElement.removeChild(<HTMLElement>e.target);
        //    this.gridColumn.currentWidth = this.asElement.offsetWidth;
        //    this.fire("column-width-updated", { column: this.gridColumn });

        //    e.stopPropagation();
        //}
    }

    export class QueryGridColumnFilterProxyBase extends WebComponent {
        private _label: string;
        private _labelTextNode: Text;
        column: QueryColumn;
        inversed: boolean;
        filtered: boolean;

        protected _updateFiltered(column?: QueryColumn) {
            var filtered = this.filtered;
            if (this.filtered = !!this.column && ((!!this.column.includes && this.column.includes.length > 0) || (!!this.column.excludes && this.column.excludes.length > 0))) {
                var objects = [];
                var textSearch = [];
                ((!this.inversed ? this.column.includes : this.column.excludes) || []).forEach(value => {
                    if (value && value.startsWith("1|@"))
                        textSearch.push(value);
                    else
                        objects.push(value);
                });

                var label = "";
                if (objects.length > 0)
                    label += objects.map(o => this._getDistinctDisplayValue(o)).join(", ");

                if (textSearch.length > 0) {
                    if (label.length > 0)
                        label += ", ";

                    label += textSearch.map(t => this._getDistinctDisplayValue(t)).join(", ");
                }

                this.label = (!this.inversed ? "= " : "≠ ") + label;
            }
            else
                this.label = "=";
        }

        protected _getDistinctDisplayValue(value: string) {
            if (!StringEx.isNullOrWhiteSpace(value) && value != "|") {
                var indexOfPipe = value.indexOf("|");

                if (indexOfPipe == 0)
                    return value.substr(1);

                if (indexOfPipe > 0)
                    return value.substr(indexOfPipe + parseInt(value.substr(0, indexOfPipe), 10) + 1);
            }

            return value == null ? this.app.service.getTranslatedMessage("DistinctNullValue") : this.app.service.getTranslatedMessage("DistinctEmptyValue");
        }

        protected get label(): string {
            return this._label;
        }

        protected set label(label: string) {
            if (this._label === label)
                return;

            this._label = label;
            if (!this._labelTextNode)
                this.$["label"].appendChild(this._labelTextNode = document.createTextNode(label));
            else
                this._labelTextNode.nodeValue = label;
        }
    }

    @WebComponent.register({
        properties: {
            column: Object,
            filtered: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            inversed: {
                type: Boolean,
                readOnly: true
            },
            disabled: {
                type: Boolean,
                computed: "!column.canFilter",
                reflectToAttribute: true
            }
        },
        observers: [
            "_updateFiltered(column)"
        ],
        listeners: {
            "tap": "_upgrade"
        }
    })
    export class QueryGridColumnFilterProxy extends QueryGridColumnFilterProxyBase {
        private _upgrade() {
            this.fire("upgrade-filter", {});
        }
    }

    @WebComponent.register({
        properties: {
            column: Object,
            filtered: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            inversed: {
                type: Boolean,
                readOnly: true
            },
            loading: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            searchText: String,
            disabled: {
                type: Boolean,
                computed: "!column.canFilter",
                reflectToAttribute: true
            }
        },
        observers: [
            "_updateFiltered(column, isAttached)"
        ]
    })
    export class QueryGridColumnFilter extends QueryGridColumnFilterProxyBase {
        private static _selector: DocumentFragment;
        private _openOnAttach: boolean = true;
        searchText: string;
        label: string;

        private _setLoading: (loading: boolean) => void;
        private _setInversed: (inverse: boolean) => void;
        private _setIsUpgraded: (upgraded: boolean) => void;

        attached() {
            super.attached();

            if (this._openOnAttach) {
                this._openOnAttach = false;

                this.async(() => {
                    this.$["distincts"] = <HTMLElement>this.querySelector("#distincts");
                    this.$["search"] = <HTMLElement>this.querySelector("#search");

                    var popup = <Popup><any>this.querySelector("vi-popup#filter");
                    popup.popup();
                });
            }
        }

        refresh() {
            this._updateFiltered();
        }

        private _getTargetCollection(): string[] {
            return !this.inversed ? this.column.includes : this.column.excludes;
        }

        private _distinctClick(e: Event) {
            var element = <HTMLElement>e.srcElement || (<any>e).originalTarget;
            var distinctValue: string;
            do {
                distinctValue = element.getAttribute("distinct-value");
                if (distinctValue) {
                    distinctValue = <string>JSON.parse(distinctValue).value;

                    var targetCollection = this._getTargetCollection();
                    if (targetCollection.indexOf(distinctValue) == -1)
                        targetCollection.push(distinctValue);
                    else
                        targetCollection.remove(distinctValue);

                    this._updateDistincts();
                    break;
                }
            }
            while (((element = element.parentElement) != this) && element);

            e.stopPropagation();
        }

        private _popupOpening(e: CustomEvent) {
            if (!this.column.canFilter)
                return;

            if (!this.column.distincts || this.column.distincts.isDirty) {
                this._setLoading(true);
                this.column.refreshDistincts().then(distincts => {
                    if (!this.column.includes)
                        this.column.includes = [];
                    if (!this.column.excludes)
                        this.column.excludes = [];

                    var distinctsDiv = <HTMLElement>this.$["distincts"];
                    distinctsDiv.style.minWidth = this.offsetWidth + "px";

                    this._setLoading(false);
                    this._renderDistincts(distinctsDiv);

                    var input = <InputSearch><any>this.$["search"];
                    input.focus();
                }).catch(() => {
                    this._setLoading(false);
                });
            }
            else {
                var distinctsDiv = <HTMLElement>this.$["distincts"];
                distinctsDiv.style.minWidth = this.offsetWidth + "px";
                distinctsDiv.scrollTop = 0;

                this._renderDistincts(distinctsDiv);
            }
        }

        private _addDistinctValue(target: HTMLElement, value: string, className?: string) {
            var div = document.createElement("div");
            div.setAttribute("distinct-value", JSON.stringify({ value: value }));
            if (className)
                div.className = className;

            var selectorDiv = document.createElement("div");
            selectorDiv.appendChild(WebComponents.Icon.Load("Selected"));
            selectorDiv.className = "selector";
            div.appendChild(selectorDiv);

            var span = document.createElement("span");
            span.textContent = this._getDistinctDisplayValue(value);

            div.appendChild(span);
            target.appendChild(div);
        }

        private _updateDistincts() {
            var distinctsDiv = <HTMLElement>this.$["distincts"];
            this._renderDistincts(distinctsDiv);
            this.fire("column-filter-changed", null);

            this._setLoading(true);
            this.column.query.search().then(() => {
                return this.column.refreshDistincts().then(distincts => {
                    this._setLoading(false);
                    this._renderDistincts(distinctsDiv);
                });
            }).catch(() => {
                this._setLoading(false);
            });
        }

        private _renderDistincts(target?: HTMLElement) {
            if (!target)
                target = <HTMLElement>this.$["distincts"];

            this._updateFiltered();
            target.innerHTML = "";

            if (this.column.includes.length > 0) {
                this.column.includes.forEach(v => this._addDistinctValue(target, v, "include"));
                this._setInversed(false);
            }
            else if (this.column.excludes.length > 0) {
                this.column.excludes.forEach(v => this._addDistinctValue(target, v, "exclude"));
                this._setInversed(true);
            }

            var includesExcludes = this.column.includes.concat(this.column.excludes);

            this.column.distincts.matching.filter(v => includesExcludes.indexOf(v) == -1).forEach(v => this._addDistinctValue(target, v, "matching"));
            this.column.distincts.remaining.filter(v => includesExcludes.indexOf(v) == -1).forEach(v => this._addDistinctValue(target, v, "remaining"));
        }

        private _search() {
            if (StringEx.isNullOrEmpty(this.searchText))
                return;

            this._getTargetCollection().push("1|@" + this.searchText);
            this.searchText = "";

            this._renderDistincts();
            this.column.query.search().then(() => {
                this._renderDistincts();
                this.fire("column-filter-changed", null);
            });
        }

        private _closePopup() {
            WebComponents.Popup.closeAll();
        }

        private _inverse(e: Event) {
            e.stopPropagation();

            this._setInversed(!this.inversed);

            var filters: number;
            if (this.inversed) {
                filters = this.column.includes.length;

                var temp = this.column.excludes;
                this.column.excludes = this.column.includes.slice();
                this.column.includes = temp.slice();
            }
            else {
                filters = this.column.excludes.length;

                var temp = this.column.includes;
                this.column.includes = this.column.excludes.slice();
                this.column.excludes = temp.slice();
            }

            if (filters > 0)
                this._updateDistincts();
        }

        private _clear(e: CustomEvent) {
            if (!this.filtered) {
                e.stopPropagation();
                return;
            }

            this.column.includes = [];
            this.column.excludes = [];
            this._setInversed(false);

            this._updateDistincts();

            this._closePopup();
        }

        private _catchClick(e: Event) {
            e.stopPropagation();
        }
    }
}