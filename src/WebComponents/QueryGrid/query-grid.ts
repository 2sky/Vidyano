module Vidyano.WebComponents {
    var minimumColumnWidth = 30;

    export interface QueryGridItemTapEventArgs {
        item: Vidyano.QueryResultItem;
    }

    @WebComponent.register({
        properties: {
            initializing: {
                type: Boolean,
                readOnly: true,
                value: true,
                observer: "_initializingChanged"
            },
            isBusy: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.isBusy"
            },
            query: Object,
            _settings: {
                type: Object,
                computed: "_computeSettings(query.columns)"
            },
            _columns: {
                type: Object,
                computed: "_computeColumns(query.columns, _settings.columns)"
            },
            _items: {
                type: Object,
                computed: "_computeItems(query.items, viewportSize, _verticalScrollOffset, rowHeight, query.lastUpdated)"
            },
            canReorder: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.canReorder"
            },
            asLookup: {
                type: Boolean,
                reflectToAttribute: true
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
                computed: "_computeCanSelectAll(canSelect, query.selectAll.isAvailable)"
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
            hasTotalItem: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.totalItem"
            },
            _verticalScrollOffset: Number,
            _horizontalScrollOffset: {
                type: Number,
                observer: "_horizontalScrollOffsetChanged"
            }
        },
        observers: [
            "_updateTables(_items, _columns, canReorder, isAttached)",
            "_updateVerticalSpacer(query.totalItems, rowHeight)",
        ],
        forwardObservers: [
            "query.columns",
            "query.items",
            "query.isBusy",
            "query.lastUpdated",
            "query.totalItems",
            "query.totalItem",
            "query.selectAll.isAvailable",
            "query.selectAll.allSelected",
            "_settings.columns"
        ],
        listeners: {
            "item-select": "_itemSelect",
            "item-actions": "_itemActions",
            "column-widths-updated": "_columnWidthsUpdated",
            "dataHeaderHost.contextmenu": "_contextmenuColumn",
            "dataHost.contextmenu": "_contextmenuData",
            "scroll": "_preventScroll"
        }
    })
    export class QueryGrid extends WebComponent {
        private static tableCache: { header: QueryGridTableHeader; footer: QueryGridTableFooter, data: QueryGridTableData }[] = [];
        private static perf = performance;

        private _tableData: QueryGridTableData;
        private _tableHeader: QueryGridTableHeader;
        private _tableFooter: QueryGridTableFooter;
        private _tablesUpdating: Promise<any>;
        private _tablesUpdatingTimestamp: Date;
        private _virtualTableOffset: number;
        private _virtualTableOffsetCurrent: number;
        private _virtualTableStartIndex: number;
        private _verticalScrollOffset: number;
        private _horizontalScrollOffset: number;
        private _horizontalScrollOffsetCurrent: number;
        private _items: Vidyano.QueryResultItem[];
        private _columns: QueryGridColumn[];
        private _hasPendingUpdates: boolean;
        private _itemOpening: Vidyano.QueryResultItem;
        private _lastSelectedItemIndex: number;
        private _remainderWidth: number;
        private _settings: QueryGridUserSettings;
        private _columnMenuColumn: QueryGridColumn;
        private _lastUpdated: Date;
        canReorder: boolean;
        rowHeight: number;
        viewportSize: Size;
        query: Vidyano.Query;
        asLookup: boolean;
        initializing: boolean;

        private _setInitializing: (initializing: boolean) => void;
        private _setViewportSize: (size: Size) => void;
        private _setRowHeight: (rowHeight: number) => void;

        attached() {
            if (QueryGrid.tableCache.length > 0 && !this._tableData) {
                var tableCache = QueryGrid.tableCache.pop();

                requestAnimationFrame(() => {
                    this._tableHeader = tableCache.header;
                    this._tableData = tableCache.data;
                    this._tableFooter = tableCache.footer;

                    this._tableHeader.grid = this._tableData.grid = this._tableFooter.grid = this;

                    Polymer.dom(this.$["dataHeaderHost"]).appendChild(this._tableHeader.host);
                    Polymer.dom(this.$["dataHost"]).appendChild(this._tableData.host);
                    Polymer.dom(this.$["dataFooterHost"]).appendChild(this._tableFooter.host);

                    this.updateStyles();
                });
            }

            super.attached();
        }

        detached() {
            super.detached();

            this._columnMenuColumn = null;

            if (this._tableData) {
                var headerFragment = document.createDocumentFragment();
                var dataFragment = document.createDocumentFragment();

                var cachEntry = {
                    header: this._tableHeader,
                    data: this._tableData,
                    footer: this._tableFooter
                };

                QueryGrid.tableCache.push(cachEntry);

                requestAnimationFrame(() => {
                    Polymer.dom(headerFragment).appendChild(this._tableHeader.host);
                    Polymer.dom(dataFragment).appendChild(this._tableData.host);
                    Polymer.dom(dataFragment).appendChild(this._tableFooter.host);

                    this._tableHeader.grid = this._tableData.grid = this._tableFooter.grid = null;
                    this._tableHeader = this._tableData = this._tableFooter = null;
                });

                [this._tableHeader, this._tableFooter].forEach(table => {
                    this.transform("", table.host);
                    table.rows[0].columns.forEach(cell => {
                        if (cell.column && cell.column.isPinned)
                            this.transform("", cell.cell.parentElement);

                        cell.setColumn(null);
                    });
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

                this._hasPendingUpdates = false;
            }
        }

        isColumnInView(column: QueryGridColumn): boolean {
            if (column.isPinned || !column.calculatedOffset)
                return true;

            return (column.calculatedOffset || 0) < this.viewportSize.width + this._horizontalScrollOffset;
        }

        private get _style(): Style {
            return <Style><any>this.$["style"];
        }

        private get _actionMenu(): PopupCore {
            return <PopupCore><any>this.$["actions"];
        }

        private get _columnMenu(): PopupMenu {
            return <PopupMenu><any>this.$["columnMenu"];
        }

        private _initializingChanged() {
            this.toggleClass("initializing", this.initializing);
        }

        private _sizeChanged(e: CustomEvent, detail: Size) {
            this._setViewportSize(detail);
            this._setRowHeight(parseInt(getComputedStyle(this).lineHeight));

            if (!this._hasPendingUpdates) {
                this._updateTableDataPendingUpdates();
                if (!this._remainderWidth || this._remainderWidth < detail.width) {
                    this._style.setStyle("Remainder", `td[is="vi-query-grid-table-column-remainder"] { width: ${detail.width}px; }`);
                    this._remainderWidth = detail.width * 2;
                }
            }
        }

        private _horizontalScrollOffsetChanged(horizontalScrollOffset: number) {
            if (!this._tableData || (!horizontalScrollOffset && !this._horizontalScrollOffsetCurrent))
                return;

            if (this._actionMenu.open)
                this._actionMenu.close();

            this.transform(`translate(${-(this._horizontalScrollOffsetCurrent = horizontalScrollOffset) }px, 0)`, this._tableHeader.host);
            this.transform(`translate(${-(this._horizontalScrollOffsetCurrent = horizontalScrollOffset) }px, 0)`, this._tableFooter.host);
            [this._tableHeader, this._tableData, this._tableFooter].forEach(table => {
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

        private _computeSettings(columns: Vidyano.QueryColumn[]): QueryGridUserSettings {
            return columns && columns.length > 0 ? QueryGridUserSettings.Load(columns[0].query) : null;
        }

        private _computeColumns(columns: QueryColumn[]): QueryGridColumn[] {
            if (!columns || columns.length === 0)
                return [];

            var visibleColumns = Enumerable.from(this._settings.columns).where(c => !c.isHidden).memoize();
            var pinnedColumns = visibleColumns.where(c => c.isPinned).orderBy(c => c.offset).toArray();
            var unpinnedColumns = visibleColumns.where(c => !c.isPinned).orderBy(c => c.offset).toArray();

            return pinnedColumns.concat(unpinnedColumns);
        }

        private _computeItems(items: Vidyano.QueryResultItem[], viewportSize: Size, verticalScrollOffset: number, rowHeight: number, lastUpdated: Date): Vidyano.QueryResultItem[] {
            if (!rowHeight || !viewportSize.height)
                return [];

            if (verticalScrollOffset > 0 && (!items || items.length == 0)) {
                this._verticalScrollOffset = 0;
                return undefined;
            }

            if (this._actionMenu.open)
                this._actionMenu.close();

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
            if (newItems.length !== maxTableRowCount && this.query.totalItems && items.length !== this.query.totalItems)
                this.query.getItems(this._virtualTableStartIndex);
            else if (newVirtualTableStartIndex === undefined && this._items && this._items.length === newItems.length && lastUpdated === this._lastUpdated)
                return this._items;

            this._lastUpdated = lastUpdated;
            return newItems;
        }

        private _computeCanSelect(query: Vidyano.Query): boolean {
            return !!query && query.actions.some(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue);
        }

        private _computeCanSelectAll(canSelect: boolean, isAvailable: boolean): boolean {
            return canSelect && isAvailable;
        }

        private _computeInlineActions(query: Vidyano.Query): boolean {
            return !!query && !query.asLookup && !this.asLookup && (query.actions.some(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1)));
        }

        private _computeCanFilter(query: Vidyano.Query): boolean {
            return !!query && query.canFilter;
        }

        private _updateTables(items: Vidyano.QueryResultItem[], columns: QueryGridColumn[], canReorder: boolean, isAttached: boolean) {
            if (!isAttached)
                return;

            var _tablesUpdatingTimestamp = this._tablesUpdatingTimestamp = new Date();

            var tablesUpdating = this._tablesUpdating = (this._tablesUpdating || Promise.resolve()).then(() => new Promise(resolve => {
                if (_tablesUpdatingTimestamp !== this._tablesUpdatingTimestamp)
                    return resolve(null);

                this._requestAnimationFrame(() => {
                    var start = Vidyano.WebComponents.QueryGrid.perf.now();

                    if (!this._tableHeader)
                        Polymer.dom(this.$["dataHeaderHost"]).appendChild((this._tableHeader = new Vidyano.WebComponents.QueryGridTableHeader(this)).host);

                    if (!this._tableData)
                        Polymer.dom(this.$["dataHost"]).appendChild((this._tableData = new Vidyano.WebComponents.QueryGridTableData(this)).host);

                    if (!this._tableFooter)
                        Polymer.dom(this.$["dataFooterHost"]).appendChild((this._tableFooter = new Vidyano.WebComponents.QueryGridTableFooter(this)).host);

                    Promise.all([this._tableHeader.update(columns.length), this._tableFooter.update(columns.length), this._tableData.update(items.length, columns.length)]).then(() => {
                        (<QueryGridTableDataBody><any>this._tableData.section).enabled = canReorder;

                        var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                        console.info(`Tables Updated: ${Math.round(timeTaken) }ms`);

                        this._updateTableHeadersAndFooters(columns).then(cont => {
                            if (!cont)
                                return Promise.resolve();

                            return this._updateTableData(items, columns);
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
            });
        }

        private _updateTableHeadersAndFooters(columns: QueryGridColumn[]): Promise<boolean> {
            return new Promise(resolve => {
                this._requestAnimationFrame(() => {
                    if (columns !== this._columns) {
                        resolve(false);
                        return;
                    }

                    this._tableHeader.rows.forEach((row: QueryGridTableHeaderRow) => row.setColumns(columns))
                    this._tableFooter.rows.forEach((row: QueryGridTableFooterRow) => row.setColumns(columns))

                    resolve(true);
                });
            });
        }

        private _updateTableData(items: Vidyano.QueryResultItem[], columns: QueryGridColumn[]): Promise<any> {
            var horizontalScrollOffset = this._horizontalScrollOffset;
            var virtualTableStartIndex = this._virtualTableStartIndex;

            return new Promise(resolve => {
                var start = Vidyano.WebComponents.QueryGrid.perf.now();

                var rowCount = this._tableData && this._tableData.rows && this._tableData.rows.length > 0 ? this._tableData.rows.length : 0;
                var virtualTableOffset = this._virtualTableOffset;

                this._requestAnimationFrame(() => {
                    var lastPinnedColumnIndex = Enumerable.from(columns).lastIndexOf(c => c.isPinned);
                    var hasPendingUpdates = false;

                    for (var index = 0; index < rowCount; index++) {
                        if (items != this._items || virtualTableStartIndex !== this._virtualTableStartIndex) {
                            resolve(false);
                            return;
                        }

                        hasPendingUpdates = (<QueryGridTableDataRow>this._tableData.rows[index]).setItem(items[index], columns, lastPinnedColumnIndex) || hasPendingUpdates;
                    }

                    this._hasPendingUpdates = hasPendingUpdates;

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
        private _updateTableDataPendingUpdates(): Promise<boolean> {
            if (!this._tableData || !this._hasPendingUpdates)
                return Promise.resolve(this._hasPendingUpdates);

            return new Promise(resolve => {
                if (this._updateTableDataPendingUpdatesRAF)
                    cancelAnimationFrame(this._updateTableDataPendingUpdatesRAF);

                this._updateTableDataPendingUpdatesRAF = this._requestAnimationFrame(() => {
                    var start = Vidyano.WebComponents.QueryGrid.perf.now();

                    var hasPendingUpdates = false;
                    Enumerable.from((<QueryGridTableDataRow[]>this._tableData.rows)).forEach(row => {
                        hasPendingUpdates = row.updatePendingCellUpdates() || hasPendingUpdates;
                    });

                    var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                    console.info(`Pending Data Updated: ${timeTaken }ms`);

                    resolve(this._hasPendingUpdates = hasPendingUpdates);
                });
            });
        }

        private _updateColumnWidths(): Promise<any> {
            if (!this._columns.some(c => !c.calculatedWidth) || !this._tableData || !this._tableData.rows || this._tableData.rows.length == 0 || (<QueryGridTableDataRow>this._tableData.rows[0]).noData) {
                if (this.query && !this.query.isBusy && this.query.items.length == 0)
                    this._setInitializing(false);

                return Promise.resolve();
            }

            return new Promise(resolve => {
                var start = Vidyano.WebComponents.QueryGrid.perf.now();

                var tryCompute = () => {
                    this._requestAnimationFrame(() => {
                        var layoutUpdating: boolean;
                        var invalidateColumnWidths: boolean;
                        var columnWidths: { [key: string]: number; } = {};
                        var columnOffsets: { [key: string]: number; } = {};
                        var hasWidthsStyle = !!this._style.getStyle("ColumnWidths");

                        [this._tableHeader, this._tableData, this._tableFooter].some(table => {
                            if (table.rows && table.rows.length > 0) {
                                var offset = 0;

                                return table.rows[0].columns.filter(cell => !!cell.column && !cell.column.calculatedWidth).some(cell => {
                                    if (hasWidthsStyle) {
                                        this._style.setStyle("ColumnWidths", "");
                                        hasWidthsStyle = false;
                                    }

                                    var width = parseInt(cell.column.width);
                                    if (isNaN(width)) {
                                        width = cell.cell.offsetWidth;
                                        if (width === 0 && getComputedStyle(cell.cell).display === "none")
                                            return layoutUpdating = true; // Layout is still updating
                                    }

                                    width = Math.max(width + 10, minimumColumnWidth)
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

                        if (!layoutUpdating && invalidateColumnWidths) {
                            this._columns.forEach(c => {
                                var width = columnWidths[c.name];
                                if (width >= 0) {
                                    c.calculatedWidth = width;
                                    c.calculatedOffset = columnOffsets[c.name];
                                }
                            });

                            this._columnWidthsUpdated();
                        }

                        if (!layoutUpdating) {
                            var timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                            console.info(`Column Widths Updated: ${timeTaken}ms`);

                            this._setInitializing(false);

                            resolve(null);
                        }
                        else
                            tryCompute();
                    });
                };

                tryCompute();
            });
        }

        private _columnWidthsUpdated(e?: CustomEvent, detail?: { column: QueryGridColumn; columnWidth: number; save: boolean; }) {
            if (!detail || detail.save) {
                var columnWidthsStyle: string[] = [];

                this._columns.forEach((col, index) => {
                    var columnName = Vidyano.WebComponents.QueryGridTableColumn.columnSafeName(col.name);
                    columnWidthsStyle.push(`table td[name="${columnName}"] > * { width: ${col.calculatedWidth}px; } `);
                });

                this._style.setStyle("ColumnWidths", ...columnWidthsStyle);
            }

            if (detail && detail.column) {
                var width = detail.save ? "" : `${detail.columnWidth}px`;
                [this._tableData, this._tableFooter].forEach(table => {
                    table.rows.forEach(r => {
                        var col = Enumerable.from(r.columns).firstOrDefault(c => c.column === detail.column);
                        if (col) {
                            col.cell.style.width = width;

                            if (!detail.save)
                                col.host.classList.add("resizing");
                            else
                                col.host.classList.remove("resizing");
                        }
                    });
                });

                if (detail.save)
                    this._settings.save(false);
            }

            if (e)
                e.stopPropagation();
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

        private _itemActions(e: CustomEvent, detail: { row: QueryGridTableDataRow; host: HTMLElement; position: Position; }) {
            if (detail.row.item.getTypeHint("extraclass", "").split(" ").map(c => c.toUpperCase()).some(c => c === "DISABLED" || c === "READONLY"))
                return;

            var actions = (detail.row.item.query.actions || []).filter(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1));
            if (actions.length == 0)
                return;

            var host = detail.host;
            if (!host && detail.position) {
                host = this.$$("#actionsAnchor");
                if (!host) {
                    host = document.createElement("div");
                    host.id = "actionsAnchor";
                    host.style.position = "fixed";

                    Polymer.dom(this.root).appendChild(host);
                }
                else
                    host.removeAttribute("hidden");

                host.style.left = `${detail.position.x}px`;
                host.style.top = `${detail.position.y}px`;
            }

            actions.forEach(action => {
                var button = new Vidyano.WebComponents.ActionButton(detail.row.item, action);
                button.forceLabel = true;
                button.openOnHover = true;

                Polymer.dom(this._actionMenu).appendChild(button);
            });

            Polymer.dom(this._actionMenu).flush();

            detail.row.host.setAttribute("hover", "");
            this._actionMenu.popup(host).then(() => {
                if (host !== detail.host)
                    host.setAttribute("hidden", "");

                this._actionMenu.empty();
                detail.row.host.removeAttribute("hover");
            });
        }

        private _contextmenuData(e: MouseEvent): boolean {
            if (e.which !== 3 || e.shiftKey || e.ctrlKey ||
                !this.query || this.query.asLookup || this.asLookup)
                return true;

            var src = <HTMLElement>e.target;
            while (src && src.tagName !== "TR")
                src = src.parentElement;

            if (!src)
                return true;

            var row = Enumerable.from(this._tableData.rows).firstOrDefault(r => r.host === src);
            if (!row)
                return true;

            this.fire("item-actions", {
                row: row,
                position: {
                    x: e.clientX,
                    y: e.clientY
                }
            }, { bubbles: false });

            e.preventDefault();
            e.stopPropagation();

            return false;
        }

        private _closeActions() {
            this._actionMenu.close();
        }

        private _contextmenuColumn(e: MouseEvent): boolean {
            if (!this.query || this.query.asLookup || this.asLookup)
                return true;

            var src: HTMLElement | QueryGridColumnHeader = <HTMLElement>e.target;
            while (src && src.tagName !== "VI-QUERY-GRID-COLUMN-HEADER")
                src = src.parentElement;

            var column = this._columnMenuColumn = src instanceof QueryGridColumnHeader ? src.column : null;
            var togglePin = <PopupMenuItem>this.$["columnMenuTogglePin"];

            if (column) {
                togglePin.removeAttribute("hidden");
                togglePin.label = column.isPinned ? this.translations.Unpin : this.translations.Pin;
                togglePin.checked = column.isPinned;
            }
            else
                togglePin.setAttribute("hidden", "");

            e.preventDefault();
            e.stopPropagation();

            return false;
        }

        private _togglePin() {
            if (!this._columnMenuColumn) {
                console.error("No column was previously set");
                return;
            }

            this._columnMenuColumn.isPinned = !this._columnMenuColumn.isPinned;
            this._horizontalScrollOffset = 0;

            this._settings.save();
        }

        private _configureColumns() {
            this.app.showDialog(new Vidyano.WebComponents.QueryGridConfigureDialog(this, this._settings)).then(result => {
                if (!result)
                    return;

                return this._updateColumnWidths().then(() => this._settings.save(true));
            });
        }

        private _preventScroll(e: Event) {
            if (this.scrollLeft > 0 || this.scrollTop > 0) {
                console.error("Attempt to scroll query grid");

                this.scrollLeft = this.scrollTop = 0;

                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    export class QueryGridColumn implements QueryGridUserSettingsColumnData {
        calculatedWidth: number;
        calculatedOffset: number;

        constructor(private _column: Vidyano.QueryColumn, private _userSettingsColumnData: QueryGridUserSettingsColumnData) {
        }

        get column(): Vidyano.QueryColumn {
            return this._column;
        }

        get query(): Vidyano.Query {
            return this._column.query;
        }

        get name(): string {
            return this._column.name;
        }

        get label(): string {
            return this._column.label;
        }

        get type(): string {
            return this._column.type;
        }

        get canSort(): boolean {
            return this._column.canSort;
        }

        get canFilter(): boolean {
            return this._column.canFilter;
        }

        get canListDistincts(): boolean {
            return this._column.canListDistincts;
        }

        get sortDirection(): SortDirection {
            return this._column.sortDirection;
        }

        get distincts(): QueryColumnDistincts {
            return this._column.distincts;
        }

        get offset(): number {
            return this._userSettingsColumnData.offset != null ? this._userSettingsColumnData.offset : this._column.offset;
        }

        set offset(offset: number) {
            this._userSettingsColumnData.offset = offset;
        }

        get isPinned(): boolean {
            return this._userSettingsColumnData.isPinned != null ? this._userSettingsColumnData.isPinned : this._column.isPinned;
        }

        set isPinned(isPinned: boolean) {
            this._userSettingsColumnData.isPinned = isPinned;
        }

        get isHidden(): boolean {
            return this._userSettingsColumnData.isHidden != null ? this._userSettingsColumnData.isHidden : this._column.isHidden;
        }

        set isHidden(isHidden: boolean) {
            this._userSettingsColumnData.isHidden = isHidden;
        }

        get width(): string {
            return this._userSettingsColumnData.width != null ? this._userSettingsColumnData.width : this._column.width;
        }

        set width(width: string) {
            this._userSettingsColumnData.width = width;
        }
    }

    export interface QueryGridUserSettingsColumnData {
        offset?: number;
        isPinned?: boolean;
        isHidden?: boolean;
        width?: string;
    }

    export class QueryGridUserSettings extends Vidyano.Common.Observable<QueryGridUserSettings> {
        private _columnsByName: { [key: string]: QueryGridColumn; } = {};
        private _columns: QueryGridColumn[] = [];

        constructor(private _query: Vidyano.Query, data: { [key: string]: QueryGridUserSettingsColumnData; } = {}) {
            super();

            this._columns = this._query.columns.filter(c => c.width != "0").map(c => this._columnsByName[c.name] = new QueryGridColumn(c, data[c.name] || {
                offset: c.offset,
                isPinned: c.isPinned,
                isHidden: c.isHidden,
                width: c.width
            }));
        }

        getColumn(name: string): QueryGridColumn {
            return this._columnsByName[name];
        }

        get columns(): QueryGridColumn[] {
            return this._columns;
        }

        save(refreshOnComplete: boolean = true): Promise<any> {
            var queryData: { [key: string]: QueryGridUserSettingsColumnData; };
            var columnData = (name: string) => (queryData || (queryData = {}))[name] || (queryData[name] = {});

            this._columns.forEach(c => {
                if (c.offset !== c.column.offset)
                    columnData(c.name).offset = c.offset;

                if (c.isPinned !== c.column.isPinned)
                    columnData(c.name).isPinned = c.isPinned;

                if (c.isHidden !== c.column.isHidden)
                    columnData(c.name).isHidden = c.isHidden;

                if (c.width !== c.column.width)
                    columnData(c.name).width = c.width;
            });

            if (queryData)
                this._query.service.application.userSettings["QueryGridSettings"][this._query.id] = queryData;
            else if (this._query.service.application.userSettings["QueryGridSettings"][this._query.id])
                delete this._query.service.application.userSettings["QueryGridSettings"][this._query.id];

            return this._query.service.application.saveUserSettings().then(() => {
                if (refreshOnComplete)
                    this.notifyPropertyChanged("columns", this._columns = this.columns.slice());
            });
        }

        static Load(query: Vidyano.Query): QueryGridUserSettings {
            var queryGridSettings = query.service.application.service.application.userSettings["QueryGridSettings"] || (query.service.application.userSettings["QueryGridSettings"] = {});
            return new QueryGridUserSettings(query, queryGridSettings[query.id]);
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
                    var row = this._addRow(this.rows.length + 1);
                    this.rows.push(row);

                    Polymer.dom(fragment).appendChild(row.host);
                }

                Polymer.dom(this._section).appendChild(fragment);
            }

            return Promise.all(this.rows.map(row => row.updateColumnCount(columnCount)));
        }

        protected abstract _createSection(): HTMLTableSectionElement;

        protected abstract _addRow(index: number): QueryGridTableRow;

        get host(): HTMLTableElement {
            return this._host;
        }

        get section(): HTMLTableSectionElement {
            return this._section;
        }
    }

    export class QueryGridTableHeader extends QueryGridTable {
        constructor(grid: QueryGrid) {
            super("vi-query-grid-table-header", grid);
        }

        update(columnCount: number): Promise<any> {
            return super.update(1, columnCount);
        }

        protected _addRow(index: number): QueryGridTableRow {
            return new Vidyano.WebComponents.QueryGridTableHeaderRow(this, index);
        }

        protected _createSection(): HTMLTableSectionElement {
            return <HTMLTableSectionElement>Polymer.dom(this.host).appendChild(document.createElement("thead"));
        }
    }

    export class QueryGridTableFooter extends QueryGridTable {
        constructor(grid: QueryGrid) {
            super("vi-query-grid-table-footer", grid);
        }

        update(columnCount: number): Promise<any> {
            return super.update(1, columnCount);
        }

        protected _addRow(index: number): QueryGridTableRow {
            return new Vidyano.WebComponents.QueryGridTableFooterRow(this, index);
        }

        protected _createSection(): HTMLTableSectionElement {
            return <HTMLTableSectionElement>Polymer.dom(this.host).appendChild(document.createElement("tbody"));
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
            return <HTMLTableSectionElement><any>Polymer.dom(this.host).appendChild(new Vidyano.WebComponents.QueryGridTableDataBody(this));
        }
    }

    @Sortable.register({
        extends: "tbody"
    })
    export class QueryGridTableDataBody extends Sortable {
        constructor(private _table: QueryGridTableData) {
            super();
        }

        protected _dragEnd(element: HTMLElement, newIndex: number, oldIndex: number) {
            this._table.rows.splice(newIndex, 0, this._table.rows.splice(oldIndex, 1)[0]);

            var item = (<QueryGridTableDataRow>this._table.rows[newIndex]).item;
            var before = newIndex > 0 ? (<QueryGridTableDataRow>this._table.rows[newIndex - 1]).item : null;
            var after = this._table.rows.length > newIndex + 1 ? (<QueryGridTableDataRow>this._table.rows[newIndex + 1]).item : null;

            this._table.grid.query.reorder(before, item, after);
        }
    }

    export abstract class QueryGridTableRow {
        private _host: HTMLTableRowElement;
        private _remainder: QueryGridTableColumnRemainder;
        columns: QueryGridTableColumn[] = [];

        constructor(is: string, private _table: QueryGridTable) {
            this._host = (<any>document).createElement("tr", is);

            Polymer.dom(this.host).appendChild((this._remainder = new Vidyano.WebComponents.QueryGridTableColumnRemainder()).host);
        }

        updateColumnCount(columnCount: number): Promise<any> {
            if (this.columns.length >= columnCount)
                return Promise.resolve();

            return new Promise(resolve => {
                var columnsFragment = document.createDocumentFragment();

                while (this.columns.length < columnCount) {
                    var column = this._createColumn();
                    this.columns.push(column);

                    Polymer.dom(columnsFragment).appendChild(column.host);
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
        constructor(table: QueryGridTableHeader, private _index: number) {
            super("vi-query-grid-table-header-row", table);
        }

        setColumns(columns: QueryGridColumn[]) {
            var lastPinnedColumn = Enumerable.from(columns).lastOrDefault(c => c.isPinned);
            this.columns.forEach((col, index) => col.setColumn(columns[index], columns[index] === lastPinnedColumn));
        }

        protected _createColumn(): QueryGridTableColumn {
            return new Vidyano.WebComponents.QueryGridTableHeaderColumn();
        }
    }

    export class QueryGridTableFooterRow extends QueryGridTableRow {
        constructor(table: QueryGridTableFooter, private _index: number) {
            super("vi-query-grid-table-footer-row", table);
        }

        setColumns(columns: QueryGridColumn[]) {
            var lastPinnedColumn = Enumerable.from(columns).lastOrDefault(c => c.isPinned);
            this.columns.forEach((col, index) => col.setColumn(columns[index], columns[index] === lastPinnedColumn));
        }

        protected _createColumn(): QueryGridTableColumn {
            return new Vidyano.WebComponents.QueryGridTableFooterColumn();
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
        private _columnsInUse: number;
        private _extraClass: string;
        columns: QueryGridTableDataColumn[];

        constructor(table: QueryGridTableData) {
            super("vi-query-grid-table-data-row", table);

            this._noData = true;
            this.host.setAttribute("no-data", "");

            var specialColumns = document.createDocumentFragment();

            Polymer.dom(specialColumns).appendChild((this._selector = new Vidyano.WebComponents.QueryGridTableDataColumnSelector(this)).host);
            Polymer.dom(specialColumns).appendChild((this._actions = new Vidyano.WebComponents.QueryGridTableDataColumnActions(this)).host);

            this.host.insertBefore(specialColumns, this.host.firstChild);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
        }

        get selector(): QueryGridTableDataColumnSelector {
            return this._selector;
        }

        get actions(): QueryGridTableDataColumnActions {
            return this._actions;
        }

        get noData(): boolean {
            return this._noData;
        }

        get item(): Vidyano.QueryResultItem {
            return this._item;
        }

        setItem(item: Vidyano.QueryResultItem, columns: QueryGridColumn[], lastPinnedIndex?: number): boolean {
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

                let extraClass = this.item ? this.item.getTypeHint("extraclass") : null;
                if (this._extraClass && extraClass !== this._extraClass) {
                    this.host.classList.remove(...this._extraClass.split(" "));
                    this._extraClass = null;
                }

                if (!!this._item) {
                    this._itemPropertyChangedListener = this._item.propertyChanged.attach(this._itemPropertyChanged.bind(this));
                    this._itemQueryPropertyChangedListener = this._item.query.propertyChanged.attach(this._itemQueryPropertyChanged.bind(this));

                    if (extraClass) {
                        this.host.classList.add(...extraClass.split(" "));
                        this._extraClass = extraClass;
                    }
                }

                this._updateIsSelected();
            }

            // Cleanup extra columns first
            if (columns && columns.length < this._columnCount)
                this.columns.slice(columns.length, this.columns.length).forEach(gridColumn => gridColumn.setItem(null, null, false));

            this._firstCellWithPendingUpdates = -1;
            this.columns.slice(0, columns ? this._columnCount = columns.length : this._columnCount).forEach((gridColumn, index) => {
                if (!gridColumn.setItem(item, columns ? columns[index] : null, lastPinnedIndex === index) && this._firstCellWithPendingUpdates < 0)
                    this._firstCellWithPendingUpdates = index;
            });

            return this._firstCellWithPendingUpdates >= 0;
        }

        updatePendingCellUpdates(): boolean {
            if (this._firstCellWithPendingUpdates < 0)
                return false;

            for (var i = this._firstCellWithPendingUpdates; i < this.columns.length; i++) {
                if (this.columns[i].update())
                    this._firstCellWithPendingUpdates++;
                else
                    break;
            }

            if (this._firstCellWithPendingUpdates == this.columns.length) {
                this._firstCellWithPendingUpdates = -1;
                return false;
            }

            return true;
        }

        private _tap(e: TapEvent) {
            if (!this.item)
                return;

            if (this.item.getTypeHint("extraclass", "").split(" ").some(c => c.toUpperCase() === "DISABLED"))
                return;

            if (this.table.grid.query.canRead && !this.table.grid.query.asLookup && !this.table.grid.asLookup) {
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
                if (this._isSelected = !!this.item && this.item.isSelected) {
                    this.host.setAttribute("is-selected", "");
                    this._selector.cell.setAttribute("is-selected", "");
                }
                else {
                    this.host.removeAttribute("is-selected");
                    this._selector.cell.removeAttribute("is-selected");
                }
            }
        }

        protected _createColumn(): QueryGridTableColumn {
            return new Vidyano.WebComponents.QueryGridTableDataColumn(this);
        }
    }

    export abstract class QueryGridTableColumn {
        private _host: HTMLTableColElement;
        private _column: QueryGridColumn;
        private _hasContent: boolean;
        private _isLastPinned: boolean;

        constructor(is: string, public cell?: HTMLElement, private _isPinned?: boolean) {
            this._host = (<any>document).createElement("td", is);
            this._host.classList.add("style-scope", "vi-query-grid");

            if (cell) {
                Polymer.dom(this.host).appendChild(cell);
                cell.classList.add("style-scope", "vi-query-grid");
            }

            if (_isPinned)
                this.host.classList.add("pinned");
        }

        get host(): HTMLTableColElement {
            return this._host;
        }

        get column(): QueryGridColumn {
            return this._column;
        }

        get isPinned(): boolean {
            return this._isPinned;
        }

        setColumn(column: QueryGridColumn, lastPinned?: boolean) {
            if (this._column !== column) {
                this.host.setAttribute("name", (this._column = column) ? Vidyano.WebComponents.QueryGridTableColumn.columnSafeName(this._column.name) : "");
                this.host.setAttribute("type", (this._column = column) ? this._column.type : "");
                if (this._column && Vidyano.Service.isNumericType(this._column.type))
                    this.host.setAttribute("numeric", "");
                else
                    this.host.removeAttribute("numeric");
            }

            if (!this.column || !this.column.isPinned) {
                this._isPinned = this._isLastPinned = false;

                this.host.classList.remove("pinned");
                this.host.classList.remove("last-pinned");
            } else {
                if (!this._isPinned) {
                    this._isPinned = this.column.isPinned;
                    this.host.classList.add("pinned");
                }

                if (this._isLastPinned !== lastPinned) {
                    if (this._isLastPinned = lastPinned)
                        this.host.classList.add("last-pinned");
                    else
                        this.host.classList.remove("last-pinned");
                }
            }
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

        setColumn(column: QueryGridColumn, isLastPinned: boolean) {
            super.setColumn((<QueryGridColumnHeader><any>this.cell).column = column, isLastPinned);
        }
    }

    export class QueryGridTableFooterColumn extends QueryGridTableColumn {
        constructor() {
            super("vi-query-grid-table-footer-column", new Vidyano.WebComponents.QueryGridColumnFooter());
        }

        setColumn(column: QueryGridColumn, isLastPinned: boolean) {
            super.setColumn((<QueryGridColumnFooter><any>this.cell).column = column, isLastPinned);
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

        setItem(item: Vidyano.QueryResultItem, column: QueryGridColumn, isLastPinned: boolean): boolean {
            this.setColumn(column, isLastPinned);
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
                        Polymer.dom(this.cell).appendChild(this._customCellTemplate);

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
                this._typeHints = Vidyano.extend({}, this._item.typeHints, itemValue ? itemValue.typeHints : undefined);
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

                var extraClass = this.column.column.getTypeHint("extraclass", undefined, value && value.typeHints, true);
                if (extraClass != this._extraClass) {
                    if (!StringEx.isNullOrEmpty(this._extraClass))
                        this.cell.classList.remove(...this._extraClass.split(' '));

                    this._extraClass = extraClass;
                    if (!StringEx.isNullOrEmpty(extraClass))
                        this.cell.classList.add(...this._extraClass.split(' '));
                }

                if (this._textNode) {
                    if (this._textNodeValue !== value)
                        this._textNode.nodeValue = this._textNodeValue = value;
                }
                else
                    Polymer.dom(this.cell).appendChild(this._textNode = document.createTextNode(this._textNodeValue = value));
            }
            else if (this._customCellTemplate)
                this._customCellTemplate.dataContext = itemValue;

            this._setHasContent(!!value);

            return true;
        }

        protected _getTypeHint(name: string, defaultValue?: string): string {
            return this.column.column.getTypeHint(name, defaultValue, this._typeHints, true);
        }
    }

    export class QueryGridTableColumnRemainder extends QueryGridTableColumn {
        constructor() {
            super("vi-query-grid-table-column-remainder", document.createElement("div"));
        }
    }

    export class QueryGridTableDataColumnSelector extends QueryGridTableColumn {
        private _item: QueryResultItem;

        constructor(private _row: QueryGridTableDataRow) {
            super("vi-query-grid-table-data-column-selector", new Vidyano.WebComponents.Icon("Selected"), true);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
            this._row.table.grid.async(() => Polymer.dom(this.host).appendChild(document.createElement("paper-ripple")));
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
            super("vi-query-grid-table-data-column-actions", new Vidyano.WebComponents.Icon("EllipsisVertical"), true);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
            this._row.table.grid.async(() => Polymer.dom(this.host).appendChild(document.createElement("paper-ripple")));
        }

        get item(): Vidyano.QueryResultItem {
            return this._item;
        }

        set item(item: Vidyano.QueryResultItem) {
            if (this._item !== item)
                this._item = item;
        }

        private _tap(e: TapEvent) {
            if (!this.item)
                return;

            this._row.table.grid.fire("item-actions", { row: this._row, host: this.host }, { bubbles: false });

            e.stopPropagation();
        }
    }
}