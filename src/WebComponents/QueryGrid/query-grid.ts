module Vidyano.WebComponents {
    export interface QueryGridItemClickEventArgs {
        item: QueryResultItem;
        column?: QueryColumn;
    }

    interface QueryGridColumnHosts {
        header: HTMLElement;
        pinned: HTMLElement;
        unpinned: HTMLElement;
    }

    interface Viewport {
        width: number;
        height: number;
    }

    export class QueryGrid extends WebComponent {
        public static _isChrome: boolean = /chrome/i.test(navigator.userAgent);
        public static _isSafari: boolean = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
        private _queuedUnattachedWork: { fnc: Function; args: any; }[] = [];
        private _uniqueId: string = Unique.get();
        private _rows: { [key: string]: QueryGridRow } = {};
        private _horizontalScrollPanels: HTMLElement[];
        private _horizontalSpacerWidth: number = 0;
        private _pinnedColumns: QueryGridColumn[] = [];
        private _unpinnedColumns: QueryGridColumn[] = [];
        private _styleElement: HTMLStyleElement;
        private _styles: { [key: string]: Text } = {};
        private _queryPropertyObservers: Vidyano.Common.SubjectDisposer[] = [];
        private _itemOpening: Vidyano.QueryResultItem;
        private _lastSelectedItemIndex: number;
        private remainderWidth: number;
        viewport: Viewport;
        query: Vidyano.Query;
        initializing: boolean;
        disableSelect: boolean;
        disableInlineActions: boolean;
        asLookup: boolean;

        _setInitializing: (val: boolean) => void;
        _setViewport: (viewport: Viewport) => void;
        _setScrollTopShadow: (val: boolean) => void;
        _setScrollBottomShadow: (val: boolean) => void;
        private _setDisableSelect: (val: boolean) => void;

        attached() {
            this.asElement.setAttribute("style-scope-id", this._uniqueId);

            if (QueryGrid._isSafari)
                this.asElement.classList.add("safari");

            this._rows["headers"] = new QueryGridColumnHeaders(this, {
                header: <HTMLElement>this.$["headers"].querySelector(".header"),
                pinned: <HTMLElement>this.$["headers"].querySelector(".pinned"),
                unpinned: <HTMLElement>this.$["headers"].querySelector(".unpinned")
            });

            this._rows["filters"] = new QueryGridColumnFilters(this, {
                header: <HTMLElement>this.$["filters"].querySelector(".header"),
                pinned: <HTMLElement>this.$["filters"].querySelector(".pinned"),
                unpinned: <HTMLElement>this.$["filters"].querySelector(".unpinned")
            });

            this._rows["items"] = new QueryGridItems(this, {
                header: <HTMLElement > this.$["data"].querySelector(".header"),
                pinned: <HTMLElement>this.$["data"].querySelector(".pinned"),
                unpinned: <HTMLElement>this.$["data"].querySelector(".unpinned")
            });

            this._horizontalScrollPanels = [
                this.headers.hosts.unpinned,
                this.filters.hosts.unpinned,
                this.items.hosts.unpinned,
                <HTMLDivElement>this.$["horizontalScroll"]
            ];

            super.attached();
        }

        detached() {
            if (this._styleElement) {
                document.head.removeChild(this._styleElement);
                this._styleElement = undefined;
            }

            this.items.detached();

            super.detached();
        }

        get pinnedColumns(): QueryGridColumn[] {
            return this._pinnedColumns;
        }

        get unpinnedColumns(): QueryGridColumn[] {
            return this._unpinnedColumns;
        }

        get headers(): QueryGridColumnHeaders {
            return <QueryGridColumnHeaders>this._rows["headers"];
        }

        get filters(): QueryGridColumnFilters {
            return <QueryGridColumnFilters>this._rows["filters"];
        }

        get items(): QueryGridItems {
            return <QueryGridItems>this._rows["items"];
        }

        private _columnsChanged(columns: QueryColumn[]) {
            columns = columns ? columns.filter(c => !c.isHidden && (!c.width || c.width != "0")) : [];

            var currentPinnedColumns = Enumerable.from(this.pinnedColumns || []);
            var currentUnpinnedColumns = Enumerable.from(this.unpinnedColumns || []);

            var pinnedColumns: QueryGridColumn[] = [];
            var unpinnedColumns: QueryGridColumn[] = [];
            Enumerable.from(columns).forEach(c => {
                if (c.isPinned)
                    pinnedColumns.push(currentPinnedColumns.firstOrDefault(pc => pc.name == c.name) || new WebComponents.QueryGridColumn(c));
                else
                    unpinnedColumns.push(currentUnpinnedColumns.firstOrDefault(upc => upc.name == c.name) || new WebComponents.QueryGridColumn(c));
            });

            this._pinnedColumns = pinnedColumns;
            this._unpinnedColumns = unpinnedColumns;

            for (var row in this._rows)
                this._rows[row].updateColumns(this._pinnedColumns, this._unpinnedColumns);
        }

        private _itemsChanged() {
            this.items.data.scrollTop = 0;
            this.items.updateRows();
            this.items.updateTablePosition(true, true);
        }

        private _updateScrollBarsVisibility() {
            var horizontalSpacer = <HTMLDivElement>this.$["horizontalSpacer"];

            this.items.data.classList.remove("scroll");
            horizontalSpacer.parentElement.style.marginRight = "0";

            var widthRequired = this.items.hosts.pinned.offsetWidth + this.items.hosts.unpinned.offsetWidth - this.remainderWidth + this.items.hosts.header.offsetWidth;
            var widthAvailable = this.items.verticalSpacer.offsetWidth;
            var heightAvailable = this.items.data.offsetHeight;

            var isVerticalScroll = this.items.virtualHeight > heightAvailable;
            var isHorizontalScroll = widthRequired > widthAvailable;

            if (isVerticalScroll)
                widthAvailable -= scrollbarWidth();

            isVerticalScroll = this.items.virtualHeight > heightAvailable;
            isHorizontalScroll = widthRequired > widthAvailable;

            if (isVerticalScroll)
                this.items.data.classList.add("scroll");
            else
                this.items.data.classList.remove("scroll");

            this._setScrollBottomShadow(isVerticalScroll);

            if (isHorizontalScroll) {
                horizontalSpacer.parentElement.removeAttribute("hidden");
                horizontalSpacer.parentElement.style.marginRight = isVerticalScroll ? scrollbarWidth() + "px" : "0";
            }
            else {
                horizontalSpacer.parentElement.setAttribute("hidden", "");
                horizontalSpacer.parentElement.style.marginRight = "0";
            }

            horizontalSpacer.style.width = (this._horizontalSpacerWidth = this.items.hosts.pinned.offsetWidth + this.items.hosts.unpinned.offsetWidth - this.remainderWidth + this.items.hosts.header.offsetWidth) + "px";
        }

        private _updateScrollBarsListener(e: CustomEvent) {
            e.stopPropagation();
            this._updateScrollBarsVisibility();
        }

        private _measureColumnsListener(e: CustomEvent) {
            e.stopPropagation();

            var columns = Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns);

            this._setStyle("ColumnWidths", []);
            columns.forEach(c => {
                for (var row in this._rows)
                    c.currentWidth = Math.max(this._rows[row].getColumnWidth(c), c.currentWidth || 0);
            });

            this._setStyle("ColumnWidths", Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns).select(c => "[data-vi-column-name='" + c.safeName + "'] { width: " + c.currentWidth + "px; }").toArray());
            this._updateScrollBarsVisibility();

            this._setInitializing(false);
        }

        private _columnWidthUpdatedListener(e: CustomEvent, detail: { column: QueryGridColumn }) {
            var columns = Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns);
            this._setStyle("ColumnWidths", Enumerable.from(this.pinnedColumns).concat(this.unpinnedColumns).select(c => "[data-vi-column-name='" + c.safeName + "'] { width: " + c.currentWidth + "px; }").toArray());
        }

        private _itemSelectListener(e: CustomEvent, detail: { item: Vidyano.QueryResultItem; rangeSelect: boolean }) {
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

        private _filterChangedListener(e: Event) {
            e.stopPropagation();

            this.filters.refreshColumns();
        }

        private _columnFilterChangedListener(e: Event) {
            e.stopPropagation();

            this.filters.refreshHeader();
        }

        private _sizeChanged(e: Event, detail: { width: number; height: number }) {
            if (!detail.width || !detail.height)
                return;

            this._setViewport(detail);

            this.items.updateRows();
            this._updateScrollBarsVisibility();

            e.stopPropagation();
        }

        private _onScrollVertical() {
            WebComponents.Popup.closeAll();

            this.items.onScroll();
        }

        private _onScrollHorizontal(e: UIEvent) {
            WebComponents.Popup.closeAll();

            var src = <HTMLElement>(e && e.target ? e.target : e.srcElement);
            var srcLeft = Math.max(Math.min(src.scrollLeft, this._horizontalSpacerWidth - this.remainderWidth + scrollbarWidth()), 0);
            if ((<any>src).scrollLeftSync === undefined || (<any>src).scrollLeftSync != srcLeft)
                (<any>src).scrollLeftSync = srcLeft;

            if (src.scrollLeft != srcLeft)
                src.scrollLeft = srcLeft;

            this._horizontalScrollPanels.filter(panel => panel != src).forEach(targetElement => {
                var target = <any>targetElement;
                if (target.scrollLeftSync != srcLeft)
                    target.scrollLeftSync = targetElement.parentElement.scrollLeft = srcLeft;
            });
        }

        private _updateHoverRow(e: MouseEvent) {
            var y = e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop;

            var sender = e.srcElement || e.target;
            if (sender && sender !== <Element><any>this)
                y -= this.items.data.getClientRects()[0].top;

            this.items.updateHoverRow(y);
        }

        private _setStyle(name: string, css: string[]) {
            var cssBody = "";
            css.forEach(c => {
                cssBody += 'vi-query-grid[style-scope-id="' + this._uniqueId + '"] ' + c + (css.length > 0 ? "\n" : "");
            });

            if (!this._styleElement)
                this._styleElement = <HTMLStyleElement>document.head.appendChild(document.createElement("style"));

            var node = this._styles[name] || (this._styles[name] = <Text>this._styleElement.appendChild(document.createTextNode("")));
            node.textContent = cssBody;
        }

        private _itemsTap(e: Event, detail: any) {
            if (!this.query)
                return;

            var path = <HTMLElement[]>(<any>e).path;
            if (!path) {
                path = [];
                var node = <HTMLElement>e.target;
                while (node != e.currentTarget) {
                    path.push(<HTMLElement>node);
                    node = node.parentElement;
                }
            }

            var pathEnum = Enumerable.from(path);
            var col = pathEnum.firstOrDefault(p => p.tagName == "TD");
            var row = pathEnum.firstOrDefault(p => p.tagName == "TR");
            if (col.parentElement == row) {
                var item = this.items.getItem(row);
                if (!item)
                    return;

                var colIndex = Enumerable.from(row.children).indexOf(col);
                var columns = row.parentElement.classList.contains("unpinned") ? this.unpinnedColumns : this.pinnedColumns;
                var column = columns.length > colIndex ? columns[colIndex].column : null;

                var newE = this.fire("item-click", { item: item, column: column });
                if (newE.defaultPrevented)
                    return;

                if (!this.query.asLookup && !this.asLookup) {
                    if (this.query.canRead) {
                        this._itemOpening = item;
                        item.getPersistentObject().then(po => {
                            if (this._itemOpening == item)
                                item.query.service.hooks.onOpen(po);
                        });
                    }
                }
            }
        }

        private _sortingStart(e: Event) {
            if (e.srcElement == this.headers.hosts.pinned || e.srcElement == this.headers.hosts.unpinned)
                this.asElement.classList.add("header-sorting");
        }

        private _sortingEnd(e: Event) {
            if (e.srcElement == this.headers.hosts.pinned || e.srcElement == this.headers.hosts.unpinned)
                this.asElement.classList.remove("header-sorting");
        }

        private _updateColumnPinning(e: Event, detail: any, sender: Vidyano.WebComponents.Sortable) {
            var header = <QueryGridColumnHeader>(<any>e).item;
            (<any>header)._gridColumn.column.isPinned = sender == <WebComponents.Sortable><any>this.headers.hosts.pinned;

            this._columnsChanged(this.query.columns);
            this.items.updateTablePosition(true);
        }

        private _updateColumnOffset() {
            var existingPinnedColumns = [].map.apply(this.headers.hosts.pinned.querySelectorAll("vi-query-grid-column-header"), [c => c.gridColumn.column]);
            var existingUnpinnedColumns = [].map.apply(this.headers.hosts.unpinned.querySelectorAll("vi-query-grid-column-header"), [c => c.gridColumn.column]);

            this._columnsChanged(existingPinnedColumns.concat(existingUnpinnedColumns));
            this.items.updateTablePosition(true);
        }

        private _computeNoFilters(filters: Vidyano.PersistentObject): boolean {
            return !filters;
        }

        private _computeDisableInlineActions(actions: Vidyano.Action[]): boolean {
            return !actions || !actions.some(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1)) || actions[0].query.asLookup || this.asLookup;
        }

        private _computeDisableSelect(actions: Vidyano.Action[]): boolean {
            return !actions || !actions.some(a => a.definition.selectionRule != ExpressionParser.alwaysTrue);
        }

        private _computeRemainderWidth(): number {
            this._setStyle("RemainderColumn", ["._RemainderColumn { width: " + this.viewport.width + "px; }"]);
            return this.viewport.width;
        }
    }

    export class QueryGridColumn {
        private _safeName: string;
        currentWidth: number;
        isAttached: boolean;

        constructor(private _column: QueryColumn) {
        }

        get column(): QueryColumn {
            return this._column;
        }

        get safeName(): string {
            if (this._safeName == null) {
                this._safeName = this._column.name.replace(/[\. ]/g, "_");

                if (/^\d/.test(this._safeName))
                    this._safeName = "_" + this._safeName;
            }

            return this._safeName;
        }

        get name(): string {
            return this._column.name;
        }
    }

    class QueryGridRow {
        private _remainder: HTMLElement;
        private _columnsOrder: string;

        constructor(private _grid: QueryGrid, private _hosts: QueryGridColumnHosts) {
            if (this._remainder = this._createRemainder())
                this.hosts.unpinned.appendChild(this._remainder);
        }

        get hosts(): QueryGridColumnHosts {
            return this._hosts;
        }

        get grid(): QueryGrid {
            return this._grid;
        }

        updateColumns(pinned: QueryGridColumn[], unpinned: QueryGridColumn[]) {
            this._updateColumns(pinned, this.hosts.pinned);
            this._updateColumns(unpinned, this.hosts.unpinned);
        }

        getColumnWidth(gridColumn: QueryGridColumn): number {
            var host = gridColumn.column.isPinned ? this.hosts.pinned : this.hosts.unpinned;
            var children = Enumerable.from(host.children).where((c: HTMLElement) => !c.classList || !c.classList.contains("_RemainderColumn"));
            if (gridColumn.column.isPinned)
                children = children.where(c => c != this._remainder);

            var element = <HTMLElement>children.firstOrDefault(c => this._getColumnNameForElement(c) == gridColumn.name);
            return element ? element.offsetWidth + element.offsetHeight / 2 : 0;
        }

        protected _createRemainder(): HTMLElement {
            throw new Error("Not implemented");
        }

        protected _createColumnElement(column: QueryGridColumn): Element {
            throw new Error("Not implemented");
        }

        protected _removedColumnElement(element: Element) {
        }

        protected _getColumnNameForElement(element: Element): string {
            throw new Error("Not implemented");
        }

        protected _updateColumns(gridColumns: QueryGridColumn[], host: HTMLElement) {
            var pinned = gridColumns.length > 0 && gridColumns[0].column.isPinned;

            var columnsOrder = gridColumns.map(c => c.name).join(";");
            if (this._columnsOrder != columnsOrder) {
                var currentChildren = Enumerable.from(host.children);
                if (!pinned)
                    currentChildren = currentChildren.where(c => c != this._remainder);

                // Lookup/create new columns
                var children = gridColumns.map(col => {
                    var columnElement = currentChildren.count() > 0 ? currentChildren.firstOrDefault(c => this._getColumnNameForElement(c) == col.name) : undefined;
                    if (!columnElement)
                        columnElement = this._createColumnElement(col);

                    return columnElement;
                });

                // Cleanup columns
                currentChildren.except(children).forEach(c => {
                    host.removeChild(c);
                    this._removedColumnElement(c);
                });

                // Sort/add columns
                if (!pinned && this._remainder)
                    children.forEach(c => host.insertBefore(c, this._remainder));
                else
                    children.forEach(c => host.appendChild(c));

                this._columnsOrder = columnsOrder;
            }
        }
    }

    class QueryGridColumnHeaders extends QueryGridRow {
        protected _createRemainder(): HTMLElement {
            var remainder = document.createElement("div");
            remainder.className = "_RemainderColumn";

            return remainder;
        }

        protected _createColumnElement(column: QueryGridColumn): Element {
            return new WebComponents.QueryGridColumnHeader(column).asElement;
        }

        protected _getColumnNameForElement(element: Element): string {
            return (<QueryGridColumnHeader><any>element).gridColumn.name;
        }
    }

    class QueryGridColumnFilters extends QueryGridRow {
        private _filterMenu: HTMLElement;

        updateColumns(pinned: QueryGridColumn[], unpinned: QueryGridColumn[]) {
            super.updateColumns(pinned, unpinned);

            if (!this._filterMenu) {
                this._filterMenu = document.createElement("div");

                this.hosts.header.appendChild(this._filterMenu);
            }
        }

        refreshColumns() {
            var columns = <WebComponents.QueryGridColumnFilter[]><any[]>Enumerable.from(this.hosts.pinned.children).concat(Enumerable.from(this.hosts.unpinned.children).toArray()).where(c => c instanceof WebComponents.QueryGridColumnFilter).toArray();
            columns.forEach(col => col.refresh());
        }

        refreshHeader() {
            var header = <QueryGridFilters><any>this.hosts.header.querySelector("vi-query-grid-filters");
            if (header)
                header.fire("column-filter-changed", null);
        }

        protected _createRemainder(): HTMLElement {
            var remainder = document.createElement("div");
            remainder.className = "_RemainderColumn";

            return remainder;
        }

        protected _createColumnElement(column: QueryGridColumn): Element {
            return new WebComponents.QueryGridColumnFilter(column).asElement;
        }

        protected _getColumnNameForElement(element: Element): string {
            return (<QueryGridColumnFilter><any>element).gridColumn.name;
        }
    }

    class QueryGridItems extends QueryGridRow {
        private _items: QueryGridItem[] = [];
        private _measuredRowWidths: boolean;
        private _rowHeight: number;
        private _fireColumnMeasurement: boolean;
        private _viewportEndRowIndex: number;
        private _viewportStartRowIndex: number = 0;
        private _pendingNewRowsStartIndex: number;
        private _rowsStartIndex: number;
        private _virtualHeight: number;
        private _dataTop: number = 0;
        private _currentHoverRowIndex: number = -1;
        private _lastKnownMouseYPosition: number = -1;
        private _debouncedGetItems: Function;
        private _data: HTMLElement;
        private _verticalSpacer: HTMLDivElement;

        constructor(grid: QueryGrid, hosts: QueryGridColumnHosts) {
            super(grid, hosts);

            this._data = this.grid.$["data"];
            this._verticalSpacer = <HTMLDivElement>this.grid.$["verticalSpacer"];
        }

        detached() {
            this._items.forEach(item => {
                item.detached();
            });

            this._items = [];
        }

        get data(): HTMLElement {
            return this._data;
        }

        get verticalSpacer(): HTMLElement {
            return this._verticalSpacer;
        }

        get virtualHeight(): number {
            return this._virtualHeight;
        }

        protected _createRemainder(): HTMLElement {
            return null;
        }

        getColumnWidth(column: QueryGridColumn): number {
            return this._items[0] ? this._items[0].getColumnWidth(column) : 0;
        }

        getItem(row: HTMLElement): QueryResultItem {
            var rowIndex = Enumerable.from(this.hosts.pinned.children).indexOf(c => c == row);
            if (rowIndex < 0)
                rowIndex = Enumerable.from(this.hosts.unpinned.children).indexOf(c => c == row);

            return rowIndex >= 0 && rowIndex < this._items.length ? this._items[rowIndex].item : null;
        }

        updateRows() {
            var rowCount = this._rowHeight !== undefined ? Math.min((Math.ceil(this.grid.viewport.height / this._rowHeight * 1.25) + 1), this.grid.query.totalItems) : 1;
            if (rowCount == this._items.length)
                return;

            while (this._items.length < rowCount)
                this._items.push(new QueryGridItem(this));

            var oldViewportEndRowIndex = this._viewportEndRowIndex || 0;
            this._viewportEndRowIndex = this._rowHeight !== undefined ? Math.floor(this._data.scrollTop + this.grid.viewport.height / this._rowHeight) : 1;
            if (this._viewportEndRowIndex > oldViewportEndRowIndex)
                this.updateTablePosition(true);
        }

        updateColumns(pinned: QueryGridColumn[], unpinned: QueryGridColumn[]) {
            this._items.forEach(item => item.updateColumns(pinned, unpinned));
        }

        updateTablePosition(forceRender?: boolean, skipSearch?: boolean) {
            if (!this.grid.query)
                return;
            else {
                if (!this.grid.query.hasSearched && !this.grid.query.autoQuery) {
                    this.grid.fire("measure-columns", {}, {
                        bubbles: false
                    });
                }
            }

            var newStartIndex = forceRender ? this._viewportStartRowIndex : undefined;

            if (this._rowsStartIndex === undefined)
                this._rowsStartIndex = newStartIndex = 0;
            else if (this._viewportEndRowIndex - this._rowsStartIndex > this._items.length)
                newStartIndex = this._viewportStartRowIndex;
            else if (this._viewportStartRowIndex < this._rowsStartIndex)
                newStartIndex = this._viewportEndRowIndex - this._items.length;

            if (newStartIndex != undefined) {
                // Only start on even rows for consistent odd and even rows
                if (newStartIndex % 2 != 0)
                    newStartIndex--;

                if (newStartIndex < 0)
                    newStartIndex = 0;

                this._pendingNewRowsStartIndex = newStartIndex;

                var items = this.grid.query.getItemsInMemory(newStartIndex, this._items.length);
                if (items) {
                    if (this._pendingNewRowsStartIndex != newStartIndex)
                        return;

                    this._rowsStartIndex = newStartIndex;

                    if (this._rowHeight === undefined && items.length > 0) {
                        this._fireColumnMeasurement = true;

                        this._items[0].item = items[0];

                        this._rowHeight = this._items[0].height;
                        this._verticalSpacer.style.height = (this._virtualHeight = (this._rowHeight * this.grid.query.totalItems)) + "px";
                        this.updateRows();

                        return;
                    }

                    if (this._virtualHeight != this._rowHeight * this.grid.query.totalItems) {
                        this._verticalSpacer.style.height = (this._virtualHeight = (this._rowHeight * this.grid.query.totalItems)) + "px";
                        this.grid.fire("update-scrollbars", null);
                    }

                    var numberOfItemRows = Math.min(this._rowsStartIndex + this._items.length, this.grid.query.totalItems);
                    this._items.slice(0, numberOfItemRows).forEach((row, i) => row.item = items[i]);
                    this._items.slice(numberOfItemRows, this._items.length).forEach(row => row.item = null);

                    this.grid.$["topSpacer"].style.height = (this._dataTop = newStartIndex * this._rowHeight) + "px";

                    this.updateHoverRow();
                }
                else if (!skipSearch) {
                    if (!this._debouncedGetItems) {
                        this._debouncedGetItems = Vidyano._debounce((start, length, newStartIndex) => {
                            if (this.grid.query.notification && !this.grid.query.hasSearched)
                                return;

                            this.grid.query.getItems(start, length).then(() => this.updateTablePosition());
                        }, 100);
                    }

                    this._debouncedGetItems(newStartIndex, this._items.length, newStartIndex);
                }
                else if (!this.grid.query.isBusy)
                    this._items.forEach(row => row.item = null);
            }

            if (this._fireColumnMeasurement || this._rowHeight === undefined) {
                this._fireColumnMeasurement = false;
                this.grid.fire("measure-columns", {}, {
                    bubbles: false
                });
            }
        }

        updateHoverRow(yPosition: number = this._lastKnownMouseYPosition) {
            this._lastKnownMouseYPosition = yPosition;

            var newCurrentHoverRowIndex = Math.floor(yPosition / this._rowHeight + (this._data.scrollTop - this._dataTop) / this._rowHeight);
            if (newCurrentHoverRowIndex != this._currentHoverRowIndex) {
                if (this._currentHoverRowIndex >= 0)
                    this._items[this._currentHoverRowIndex].hover = false;

                this._currentHoverRowIndex = newCurrentHoverRowIndex >= 0 && newCurrentHoverRowIndex < this._items.length ? newCurrentHoverRowIndex : -1;
                if (this._currentHoverRowIndex >= 0)
                    this._items[this._currentHoverRowIndex].hover = true;
            }
        }

        onScroll() {
            this.updateHoverRow();

            var top = this._data.scrollTop;
            this.grid._setScrollTopShadow(top > 0);
            this.grid._setScrollBottomShadow(top < (this._data.scrollHeight - this._data.offsetHeight - this._rowHeight * 0.25));

            this._viewportStartRowIndex = Math.floor(top / this._rowHeight);
            this._viewportEndRowIndex = Math.ceil((top + this.grid.viewport.height) / this._rowHeight);
            this.updateTablePosition();
        }
    }

    class QueryGridItem extends QueryGridRow {
        private static _selectorProxy: HTMLElement;
        private static _actionsProxy: HTMLElement;
        private _selectorProxy: HTMLElement;
        private _selectorProxyClick: EventListener;
        private _actionsProxy: HTMLElement;
        private _actionsProxyClick: EventListener;
        private _item: QueryResultItem;
        private _isItemSelectedDisposer: Common.SubjectDisposer;
        private _cells: QueryGridCell[] = [];
        private _hover: boolean;
        private _selector: QueryGridItemSelector;
        private _actions: QueryGridItemActions;

        constructor(parent: QueryGridItems) {
            super(parent.grid, {
                header: parent.hosts.header.appendChild(document.createElement("tr")),
                pinned: parent.hosts.pinned.appendChild(document.createElement("tr")),
                unpinned: parent.hosts.unpinned.appendChild(document.createElement("tr"))
            });

            var actions = (this.grid.query.actions || []).filter(a => a.isVisible);
            actions = actions.filter(a => a.definition.selectionRule != ExpressionParser.alwaysTrue);

            if (!this.grid.disableSelect) {
                // Adds the selector or selector proxy for performance
                var selectorCol = document.createElement("td")
                if (!QueryGridItem._selectorProxy) {
                    selectorCol.appendChild(this._selector = new Vidyano.WebComponents.QueryGridItemSelector());

                    Polymer.dom(this.hosts.header).flush();
                    QueryGridItem._selectorProxy = document.createElement("div");
                    Enumerable.from(Polymer.dom(this._selector.root).children).forEach(child => {
                        QueryGridItem._selectorProxy.appendChild(child.cloneNode(true));
                    });
                    QueryGridItem._selectorProxy.className = "vi-query-grid-item-selector-proxy";
                }
                else {
                    this._selectorProxy = <HTMLElement>selectorCol.appendChild(QueryGridItem._selectorProxy.cloneNode(true));
                    this._selectorProxy.addEventListener("click", this._selectorProxyClick = <EventListener><any>((e: UIEvent, detail: any) => {
                        selectorCol.removeChild(this._selectorProxy);
                        this._selectorProxyClick = this._selectorProxy = null;

                        selectorCol.appendChild(this._selector = new Vidyano.WebComponents.QueryGridItemSelector());
                        this._selector.item = this._item;
                        
                        e.stopPropagation();
                        this._selector.fire("tap", { sourceEvent: e });
                    }));
                }
                this.hosts.header.appendChild(selectorCol);
            }

            if (!this.grid.disableInlineActions) {
                actions = actions.filter(a => a.definition.selectionRule(1));
                if (!this.grid.query.asLookup && actions.length > 0) {
                    // Adds the actions proxy for performance
                    var actionsCol = document.createElement("td")
                    if (!QueryGridItem._actionsProxy) {
                        QueryGridItem._actionsProxy = document.createElement("div");
                        var resource = <Resource><any>document.createElement("vi-resource");
                        resource.source = "Icon_EllipsisVertical";

                        QueryGridItem._actionsProxy.className = "vi-query-grid-item-actions-proxy";
                        QueryGridItem._actionsProxy.appendChild(resource);
                    }
                    this._actionsProxy = <HTMLElement>actionsCol.appendChild(QueryGridItem._actionsProxy.cloneNode(true));
                    this._actionsProxy.addEventListener("click", this._actionsProxyClick = <EventListener><any>((e: UIEvent, detail: any) => {
                        actionsCol.removeChild(this._actionsProxy);
                        this._actionsProxyClick = this._actionsProxy = null;

                        actionsCol.appendChild(this._actions = new Vidyano.WebComponents.QueryGridItemActions());
                        this._actions.item = this._item;

                        Polymer.dom(this._actions).flush();

                        e.stopPropagation();
                        this._actions.async(() => {
                            this._actions.popup();
                        });
                    }));
                    this.hosts.header.appendChild(actionsCol);
                }
            }

            this.updateColumns(parent.grid.pinnedColumns, parent.grid.unpinnedColumns);
        }

        detached() {
            if (this._selectorProxyClick) {
                this._selectorProxy.removeEventListener("click", this._selectorProxyClick);
                this._selectorProxyClick = null;
            }

            if (this._actionsProxyClick) {
                this._actionsProxy.removeEventListener("click", this._actionsProxyClick);
                this._selectorProxyClick = null;
            }

            if (this._isItemSelectedDisposer) {
                this._isItemSelectedDisposer();
                this._isItemSelectedDisposer = null;
            }
        }

        get item(): QueryResultItem {
            return this._item;
        }

        set item(item: QueryResultItem) {
            this._item = item;

            for (var host in this.hosts) {
                this._cells.forEach(cell => cell.item = this._item);

                if (item)
                    this.hosts[host].classList.remove("noData");
                else
                    this.hosts[host].classList.add("noData");
            }

            if (this._isItemSelectedDisposer) {
                this._isItemSelectedDisposer();
                this._isItemSelectedDisposer = null;
            }

            if (this._selectorProxy) {
                if (this._item) {
                    this._isItemSelectedDisposer = this._item.propertyChanged.attach((item: QueryResultItem, detail: Common.PropertyChangedArgs) => {
                        if (detail.propertyName == "isSelected") {
                            if (!this._selectorProxy) {
                                if (this._isItemSelectedDisposer) {
                                    this._isItemSelectedDisposer();
                                    this._isItemSelectedDisposer = null;
                                }

                                return;
                            }
                            if (detail.newValue)
                                this._selectorProxy.setAttribute("is-selected", "");
                            else
                                this._selectorProxy.removeAttribute("is-selected");
                        }
                    });

                    if (this._item.isSelected)
                        this._selectorProxy.setAttribute("is-selected", "");
                    else
                        this._selectorProxy.removeAttribute("is-selected");
                }
            }
            else if (this._selector)
                this._selector.item = this.item;

            if (this._actions)
                this._actions.item = this.item;
        }

        get hover(): boolean {
            return this._hover;
        }

        set hover(val: boolean) {
            if (this._hover == val)
                return;

            for (var host in this.hosts) {
                if (val)
                    this.hosts[host].setAttribute("hover", "");
                else
                    this.hosts[host].removeAttribute("hover");
            }

            this._hover = val;
        }

        get height(): number {
            var height = 0;
            for (var host in this.hosts) {
                height = Math.max(this.hosts[host].offsetHeight, height);
            }

            return height;
        }

        protected _createRemainder(): HTMLElement {
            var remainder = document.createElement("td");
            remainder.appendChild(document.createElement("div")).className = "_RemainderColumn";

            return remainder;
        }

        protected _getColumnNameForElement(element: Element): string {
            var cell = this._cells.filter(cell => cell.host == element)[0];
            if (cell)
                return cell.gridColumn.name;

            return null;
        }

        protected _createColumnElement(gridColumn: QueryGridColumn): Element {
            var cell: QueryGridCell;

            if (Vidyano.WebComponents["QueryGridCell" + gridColumn.column.type])
                cell = new Vidyano.WebComponents["QueryGridCell" + gridColumn.column.type]();
            else
                cell = new QueryGridCell();

            this._cells.push(cell.initialize(gridColumn));
            return cell.host;
        }

        protected _removedColumnElement(element: Element) {
            this._cells = this._cells.filter(cell => cell.host != element);
        }
    }

    export class QueryGridItemActions extends WebComponent {
        private _updateActionItems: boolean;
        item: QueryResultItem;

        private _popupOpening() {
            if (this._updateActionItems) {
                this.empty();
                var actions = (this.item.query.actions || []).filter(a => a.isVisible && a.definition.selectionRule != ExpressionParser.alwaysTrue && a.definition.selectionRule(1));
                actions.forEach(action => {
                    var button = new Vidyano.WebComponents.ActionButton();
                    button.action = action;
                    button.item = this.item;
                    Polymer.dom(this).appendChild(button);
                });
            }

            this._updateActionItems = false;
        }

        private _itemChanged() {
            this._updateActionItems = true;
        }

        popup(): Promise<any> {
            return (<Vidyano.WebComponents.Popup><any>this.$["popup"]).popup();
        }
    }

    export class QueryGridItemSelector extends WebComponent {
        private _selectedItemsObserver: Vidyano.Common.SubjectDisposer;
        private _query: Vidyano.Query;
        item: QueryResultItem;
        isSelected: boolean;

        private _setIsSelected: (val: boolean) => void;

        private _updateIsSelected(isAttached: boolean, item: Vidyano.QueryResultItem) {
            if (!isAttached && this._selectedItemsObserver) {
                this._selectedItemsObserver();
                this._selectedItemsObserver = undefined;
                this._query = undefined;
                return;
            }

            if (this.item) {
                if (this.item.query != this._query || !this._selectedItemsObserver) {
                    this._query = this.item.query;

                    if (this._selectedItemsObserver)
                        this._selectedItemsObserver();

                    this._selectedItemsObserver = this.item.query.propertyChanged.attach(this._selectedItemsChanged.bind(this));
                }
            }

            if (!this.item || !this.item.isSelected)
                this._setIsSelected(false);
            else
                this._setIsSelected(true);
        }

        private _selectedItemsChanged(source: Query, detail: Vidyano.Common.PropertyChangedArgs) {
            if (detail.propertyName != "selectedItems")
                return;

            if (!detail.newValue || detail.newValue.length == 0) {
                if (this.isSelected)
                    this._setIsSelected(false);

                return;
            }

            var shouldSelect = Enumerable.from(<QueryResultItem[]>detail.newValue).firstOrDefault(i => i == this.item);
            if (shouldSelect && !this.isSelected)
                this._setIsSelected(true);
            else if (!shouldSelect && this.isSelected)
                this._setIsSelected(false);
        }

        private _select(e: CustomEvent) {
            if (this.item) {
                // Effective item selection changing is delegated to the grid as to be able to handle multi selects via key modifiers
                this.fire("item-select", {
                    item: this.item,
                    rangeSelect: e.detail.sourceEvent && e.detail.sourceEvent.shiftKey
                });
            }
        }
    }

    export class QueryGridColumnHeader extends WebComponent {
        private _grid: Vidyano.WebComponents.QueryGrid;
        private _resizeX: number;
        private _resizeStartWidth: number;
        private _resizeMinWidth: number;
        gridColumn: QueryGridColumn;
        column: QueryColumn;

        private _setGridColumn: (col: QueryGridColumn) => void;

        constructor(column: QueryGridColumn) {
            super();

            this._setGridColumn(column);
            this.asElement.setAttribute("data-vi-column-name", column.safeName);
        }

        attached() {
            super.attached();

            if (!this._grid)
                this._grid = this.findParent<Vidyano.WebComponents.QueryGrid>(Vidyano.WebComponents.QueryGrid);

            this.gridColumn.isAttached = true;
        }

        private _sort(e: Event) {
            var multiSort = (<any>e).detail.sourceEvent.ctrlKey;
            var newSortingDirection: SortDirection;
            switch (this.gridColumn.column.sortDirection) {
                case SortDirection.Ascending: {
                    newSortingDirection = SortDirection.Descending;
                    break;
                }
                case SortDirection.Descending: {
                    newSortingDirection = multiSort && this.gridColumn.column.query.sortOptions.length > 1 ? SortDirection.None : SortDirection.Ascending;
                    break;
                }
                case SortDirection.None: {
                    newSortingDirection = SortDirection.Ascending;
                    break;
                }
            }

            this.gridColumn.column.sort(newSortingDirection, multiSort);
            this.gridColumn.column.query.search().catch(() => { });
        }

        private _resizeStart(e: MouseEvent) {
            this._resizeX = e.clientX;
            this._resizeStartWidth = this.gridColumn.currentWidth;
            this._resizeMinWidth = this.asElement.offsetHeight;

            var overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.zIndex = "100000";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.bottom = "0";
            overlay.style.right = "0";
            overlay.style.backgroundColor = "rgba(0,0,0,0.001)";
            overlay.style.cursor = "col-resize";
            overlay.addEventListener("mousemove", this._resizeMove.bind(this));
            overlay.addEventListener("touchmove", this._resizeMove.bind(this));
            overlay.addEventListener("mouseup", this._resizeEnd.bind(this));
            overlay.addEventListener("touchend", this._resizeEnd.bind(this));
            overlay.addEventListener("touchcancel", this._resizeEnd.bind(this));
            document.body.appendChild(overlay);

            e.stopPropagation();
        }

        private _resizeMove(e: MouseEvent) {
            var newWidth = this._resizeStartWidth + e.clientX - this._resizeX;
            this.gridColumn.currentWidth = newWidth >= this._resizeMinWidth ? newWidth : this._resizeMinWidth;

            this.fire("column-width-updated", { column: this.gridColumn });
            if (Vidyano.WebComponents.QueryGrid._isChrome)
                (<any>this._grid)._updateScrollBarsVisibility();

            e.stopPropagation();
        }

        private _resizeEnd(e: Event) {
            (<HTMLElement>e.target).parentElement.removeChild(<HTMLElement>e.target);
            this.gridColumn.currentWidth = this.asElement.offsetWidth;
            (<any>this._grid)._updateScrollBarsVisibility();

            e.stopPropagation();
        }

        private _getIsSorting(direction: SortDirection): boolean {
            return direction !== SortDirection.None;
        }

        private _getSortingIcon(direction: SortDirection): string {
            return direction === SortDirection.Ascending ? "Icon_SortAsc" : (direction === SortDirection.Descending ? "Icon_SortDesc" : "");
        }
    }

    export class QueryGridColumnFilter extends WebComponent {
        private static _selector: DocumentFragment;
        private _popupOpening = this.__popupOpening.bind(this);
        private _grid: Vidyano.WebComponents.QueryGrid;
        gridColumn: QueryGridColumn;
        searchText: string;
        filtered: boolean;
        label: string;
        inversed: boolean;

        private _setGridColumn: (col: QueryGridColumn) => void;
        private _setLoading: (loading: boolean) => void;
        private _setInversed: (inverse: boolean) => void;

        constructor(column: QueryGridColumn) {
            super();

            this._setGridColumn(column);
            this.asElement.setAttribute("data-vi-column-name", column.safeName);
        }

        attached() {
            super.attached();

            if (!this._grid) {
                this._grid = this.findParent<Vidyano.WebComponents.QueryGrid>(Vidyano.WebComponents.QueryGrid);
                if (this._grid) {
                    var colName = this.getAttribute("data-vi-column-name");
                    this._setGridColumn(Enumerable.from(this._grid.unpinnedColumns).firstOrDefault(c => c.safeName == colName) || Enumerable.from(this._grid.pinnedColumns).firstOrDefault(c => c.safeName == colName));
                }
            }

            this._updateFiltered();
        }

        refresh() {
            this._updateFiltered();
        }

        private _getTargetCollection(): string[] {
            return !this.inversed ? this.gridColumn.column.includes : this.gridColumn.column.excludes;
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
            while (((element = element.parentElement) != this.asElement) && element);

            e.stopPropagation();
        }

        private __popupOpening(e: CustomEvent) {
            if (!this.gridColumn.column.canFilter)
                return;

            if (!this.gridColumn.column.distincts || this.gridColumn.column.distincts.isDirty) {
                this._setLoading(true);
                this.gridColumn.column.refreshDistincts().then(distincts => {
                    if (!this.gridColumn.column.includes)
                        this.gridColumn.column.includes = [];
                    if (!this.gridColumn.column.excludes)
                        this.gridColumn.column.excludes = [];

                    var distinctsDiv = <HTMLElement>this.$["distincts"];
                    distinctsDiv.style.minWidth = this.asElement.offsetWidth + "px";

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
                distinctsDiv.style.minWidth = this.asElement.offsetWidth + "px";
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
            selectorDiv.appendChild(WebComponents.Resource.Load("Icon_Selected"));
            selectorDiv.className = "selector";
            div.appendChild(selectorDiv);

            var span = document.createElement("span");
            span.textContent = this._getDistinctDisplayValue(value);

            div.appendChild(span);
            target.appendChild(div);
        }

        private _getDistinctDisplayValue(value: string) {
            if (!StringEx.isNullOrWhiteSpace(value) && value != "|") {
                var indexOfPipe = value.indexOf("|");

                if (indexOfPipe == 0)
                    return value.substr(1);

                if (indexOfPipe > 0)
                    return value.substr(indexOfPipe + parseInt(value.substr(0, indexOfPipe), 10) + 1);
            }

            return value == null ? this.app.service.getTranslatedMessage("DistinctNullValue") : this.app.service.getTranslatedMessage("DistinctEmptyValue");
        }

        private _updateDistincts() {
            var distinctsDiv = <HTMLElement>this.$["distincts"];
            this._renderDistincts(distinctsDiv);

            this.fire("column-filter-changed", null);

            this._setLoading(true);
            this.gridColumn.column.query.search().then(() => {
                return this.gridColumn.column.refreshDistincts().then(distincts => {
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

            if (this.gridColumn.column.includes.length > 0) {
                this.gridColumn.column.includes.forEach(v => this._addDistinctValue(target, v, "include"));
                this._setInversed(false);
            }
            else if (this.gridColumn.column.excludes.length > 0) {
                this.gridColumn.column.excludes.forEach(v => this._addDistinctValue(target, v, "exclude"));
                this._setInversed(true);
            }

            var includesExcludes = this.gridColumn.column.includes.concat(this.gridColumn.column.excludes);

            this.gridColumn.column.distincts.matching.filter(v => includesExcludes.indexOf(v) == -1).forEach(v => this._addDistinctValue(target, v, "matching"));
            this.gridColumn.column.distincts.remaining.filter(v => includesExcludes.indexOf(v) == -1).forEach(v => this._addDistinctValue(target, v, "remaining"));
        }

        private _search() {
            if (StringEx.isNullOrEmpty(this.searchText))
                return;

            this._getTargetCollection().push("1|@" + this.searchText);
            this.searchText = "";

            this._renderDistincts();
            this.gridColumn.column.query.search().then(() => {
                this._renderDistincts();
            });
        }

        private _closePopup() {
            WebComponents.Popup.closeAll();
        }

        private _updateFiltered() {
            if (this.filtered = (this.gridColumn.column.includes && this.gridColumn.column.includes.length > 0) ||
                (this.gridColumn.column.excludes && this.gridColumn.column.excludes.length > 0)) {

                var objects = [];
                var textSearch = [];
                ((!this.inversed ? this.gridColumn.column.includes : this.gridColumn.column.excludes) || []).forEach(value => {
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

        private _inverse(e: Event) {
            e.stopPropagation();

            this._setInversed(!this.inversed);
            
            var filters: number;
            if (this.inversed) {
                filters = this.gridColumn.column.includes.length;

                var temp = this.gridColumn.column.excludes;
                this.gridColumn.column.excludes = this.gridColumn.column.includes.slice();
                this.gridColumn.column.includes = temp.slice();
            }
            else {
                filters = this.gridColumn.column.excludes.length;

                var temp = this.gridColumn.column.includes;
                this.gridColumn.column.includes = this.gridColumn.column.excludes.slice();
                this.gridColumn.column.excludes = temp.slice();
            }

            if(filters > 0)
                this._updateDistincts();
        }

        private _clear(e: CustomEvent) {
            if (!this.filtered) {
                e.stopPropagation();
                return;
            }

            this.gridColumn.column.includes = [];
            this.gridColumn.column.excludes = [];
            this._setInversed(false);

            this._updateDistincts();

            this._closePopup();
        }

        private _catchClick(e: Event) {
            e.stopPropagation();
        }
    }

    export class QueryGridCell {
        private _dom: HTMLDivElement;
        private _host: HTMLTableDataCellElement;
        private _item: QueryResultItem;
        private _gridColumn: QueryGridColumn;
        private _foreground: { currentValue?: any; originalValue?: any } = {};
        private _fontWeight: { currentValue?: any; originalValue?: any } = {};
        private _textAlign: { currentValue?: any; originalValue?: any } = {};
        private _extraClass: string;
        private _typeHints: any;

        initialize(column: QueryGridColumn): QueryGridCell {
            this._host = document.createElement("td");

            if (!this._dom) {
                this._host.appendChild(this._dom = document.createElement("div"));
                this._dom.className = "cell";
            }

            this._gridColumn = column;
            this._dom.setAttribute("data-vi-column-name", this._gridColumn.safeName);
            this._dom.setAttribute("data-vi-column-type", this._gridColumn.column.type);

            if (Vidyano.Service.isNumericType(this._gridColumn.column.type))
                this._dom.style.textAlign = this._textAlign.currentValue = this._textAlign.originalValue = "right";

            return this;
        }

        get host() {
            return this._host;
        }

        get gridColumn(): QueryGridColumn {
            return this._gridColumn;
        }

        get width(): number {
            return this._dom.offsetWidth;
        }

        private get _type(): string {
            return this.gridColumn.column.type;
        }

        get item(): QueryResultItem {
            return this._item;
        }

        set item(item: QueryResultItem) {
            this._item = item;
            this._render(this._dom);
        }

        protected _render(dom: HTMLElement) {
            if (!this._item) {
                this._dom.textContent = "";
                return;
            }

            var itemValue = this._item.getFullValue(this._gridColumn.name);
            this._typeHints = Vidyano.extend({}, this._item.typeHints, itemValue ? itemValue.typeHints : undefined);

            var value = this._item.getValue(this.gridColumn.name);
            if (value != null && (this._type == "Boolean" || this._type == "NullableBoolean"))
                value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("TrueKey", "True") : this._getTypeHint("FalseKey", "False"));
            else if (this._type == "YesNo")
                value = this._item.query.service.getTranslatedMessage(value ? this._getTypeHint("TrueKey", "Yes") : this._getTypeHint("FalseKey", "No"));
            else if (this._type == "Time" || this._type == "NullableTime") {
                if (value != null) {
                    value = value.trimEnd('0').trimEnd('.');
                    if (value.startsWith('0:'))
                        value = value.substr(2);
                    if (value.endsWith(':00'))
                        value = value.substr(0, value.length - 3);
                }
            }

            if (value != null) {
                var format = this._getTypeHint("DisplayFormat", null);
                if (format == null || format == "{0}") {
                    switch (this._type) {
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

            var foreground = this._getTypeHint("Foreground", null);
            if (foreground != this._foreground.currentValue) {
                if (this._foreground.originalValue === undefined)
                    this._foreground.originalValue = dom.style.color;

                dom.style.color = this._foreground.currentValue = foreground || this._foreground.originalValue;
            }

            var fontWeight = this._getTypeHint("FontWeight", null);
            if (fontWeight != this._fontWeight.currentValue) {
                if (this._fontWeight.originalValue === undefined)
                    this._fontWeight.originalValue = dom.style.fontWeight;

                dom.style.fontWeight = this._fontWeight.currentValue = fontWeight || this._fontWeight.originalValue;
            }

            var textAlign = this._getTypeHint("HorizontalContentAlignment", null);
            if (textAlign != this._textAlign.currentValue)
                dom.style.textAlign = this._textAlign.currentValue = textAlign || this._textAlign.originalValue;

            var extraClass = this._getTypeHint("ExtraClass", null);
            if (extraClass != this._extraClass) {
                if (!StringEx.isNullOrEmpty(this._extraClass))
                    dom.classList.remove(this._extraClass);

                if (!StringEx.isNullOrEmpty(extraClass)) {
                    this._extraClass = extraClass;
                    dom.classList.add(this._extraClass);
                }
            }

            if (dom.firstChild != null) {
                if((<Text>dom.firstChild).nodeValue !== value)
                    (<Text>dom.firstChild).nodeValue = value;
            }
            else
                dom.appendChild(document.createTextNode(value));
        }

        protected _getTypeHint(name: string, defaultValue?: string): string {
            return this.gridColumn.column.getTypeHint(name, defaultValue, this._typeHints);
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGrid, Vidyano.WebComponents, "vi", {
        properties: {
            query: Object,
            noFilters: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeNoFilters(query.filters)"
            },
            asLookup: {
                type: Boolean,
                reflectToAttribute: true
            },
            loading: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.isBusy"
            },
            initializing: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: true
            },
            viewport: {
                type: Object,
                readOnly: true
            },
            remainderWidth: {
                type: Number,
                computed: "_computeRemainderWidth(viewport)"
            },
            scrollTopShadow: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
            },
            scrollBottomShadow: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            disableInlineActions: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeDisableInlineActions(query.actions)"
            },
            disableSelect: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeDisableSelect(query.actions)"
            }
        },
        observers: [
            "_columnsChanged(query.columns, isAttached)",
            "_itemsChanged(query.items, isAttached, viewport)",
        ],
        forwardObservers: [
            "query.columns",
            "query.items",
            "query.isBusy"
        ],
        listeners: {
            "measure-columns": "_measureColumnsListener",
            "column-width-updated": "_columnWidthUpdatedListener",
            "update-scrollbars": "_updateScrollBarsListener",
            "item-select": "_itemSelectListener",
            "filter-changed": "_filterChangedListener",
            "column-filter-changed": "_columnFilterChangedListener"
        }
    });

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridColumnHeader, Vidyano.WebComponents, "vi", {
        properties: {
            gridColumn: {
                type: Object,
                readOnly: true,
                notify: true
            },
            column: {
                type: Object,
                computed: "gridColumn.column"
            },
            sortDirection: {
                type: Number,
                computed: "column.sortDirection"
            }
        },
        forwardObservers: [
            "column.sortDirection"
        ]
    });

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridColumnFilter, Vidyano.WebComponents, "vi", {
        properties: {
            gridColumn: {
                type: Object,
                readOnly: true,
                notify: true
            },
            loading: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            searchText: String,
            filtered: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            label: String,
            inversed: {
                type: Boolean,
                readOnly: true
            }
        }
    });

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridItemSelector, Vidyano.WebComponents, "vi", {
        properties: {
            item: Object,
            isSelected: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            }
        },
        observers: [
            "_updateIsSelected(isAttached, item)"
        ],
        listeners: {
            "tap": "_select"
        }
    });

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridItemActions, Vidyano.WebComponents, "vi", {
        properties: {
            item: {
                type: Object,
                observer: "_itemChanged"
            }
        }
    });
}