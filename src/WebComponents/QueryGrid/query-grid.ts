namespace Vidyano.WebComponents {
    "use strict";

    export interface IQueryGridItemTapEventArgs {
        item: Vidyano.QueryResultItem;
    }

    export class QueryGridColumn implements IQueryGridUserSettingsColumnData {
        calculatedWidth: number;
        calculatedOffset: number;

        constructor(private _column: Vidyano.QueryColumn, private _userSettingsColumnData: IQueryGridUserSettingsColumnData) {
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

        get canGroupBy(): boolean {
            return this._column.canGroupBy;
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

        get distincts(): IQueryColumnDistincts {
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

        reset() {
            this.calculatedWidth = this.calculatedOffset = undefined;
        }
    }

    export interface IQueryGridUserSettingsColumnData {
        offset?: number;
        isPinned?: boolean;
        isHidden?: boolean;
        width?: string;
    }

    export class QueryGridUserSettings extends Vidyano.Common.Observable<QueryGridUserSettings> {
        private _columnsByName: { [key: string]: QueryGridColumn; } = {};
        private _columns: QueryGridColumn[] = [];

        constructor(private _query: Vidyano.Query, data: { [key: string]: IQueryGridUserSettingsColumnData; } = {}) {
            super();

            this._columns = this._query.columns.filter(c => c.width !== "0").map(c => this._columnsByName[c.name] = new QueryGridColumn(c, data[c.name] || {
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

        async save(refreshOnComplete: boolean = true): Promise<any> {
            let queryData: { [key: string]: IQueryGridUserSettingsColumnData; };
            const columnData = (name: string) => (queryData || (queryData = {}))[name] || (queryData[name] = {});

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

            await this._query.service.application.saveUserSettings();
            if (refreshOnComplete)
                this.notifyPropertyChanged("columns", this._columns = this.columns.slice());
        }

        static Load(query: Vidyano.Query): QueryGridUserSettings {
            const queryGridSettings = query.service.application.service.application.userSettings["QueryGridSettings"] || (query.service.application.userSettings["QueryGridSettings"] = {});
            return new QueryGridUserSettings(query, queryGridSettings[query.id]);
        }
    }

    export abstract class QueryGridTable {
        private _host: HTMLTableElement;
        private _section: HTMLTableSectionElement;
        private _rowCount: number;
        rows: QueryGridTableRow[] = [];

        constructor(is: string, public grid: QueryGrid) {
            this._host = (<any>document).createElement("table", is);
        }

        update(rowCount: number, columnCount: number): Promise<any> {
            if (!this.section)
                this._section = this._createSection();

            if (this.rows.length < rowCount) {
                const fragment = document.createDocumentFragment();

                while (this.rows.length < rowCount) {
                    const row = this._addRow(this.rows.length + 1);
                    this.rows.push(row);

                    Polymer.dom(fragment).appendChild(row.host);
                }

                Polymer.dom(this._section).appendChild(fragment);

                this._rowCount = this.rows.length;
            }
            else if (this._rowCount > rowCount) {
                do {
                    this._clearRow(--this._rowCount);
                }
                while (--this._rowCount > rowCount);
            }

            return Promise.all(this.rows.map(row => row.updateColumnCount(columnCount)));
        }

        protected abstract _createSection(): HTMLTableSectionElement;

        protected abstract _addRow(index: number): QueryGridTableRow;

        protected _clearRow(rowIndex: number) {
            // Noop
        }

        get host(): HTMLTableElement {
            return this._host;
        }

        get section(): HTMLTableSectionElement {
            return this._section;
        }

        get firstRow(): QueryGridTableRow {
            return this.rows[0];
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

        protected _clearRow(rowIndex: number) {
            (<QueryGridTableDataRow>this.rows[rowIndex]).setItem(undefined);
        }

        protected _createSection(): HTMLTableSectionElement {
            const body = <HTMLTableSectionElement>Polymer.dom(this.host).appendChild(new Vidyano.WebComponents.QueryGridTableDataBody(this));

            return body;
        }

        get firstRow(): QueryGridTableRow {
            return (<QueryGridTableDataRow[]>this.rows).filter(r => r.type === "data")[0];
        }
    }

    @Sortable.register({
        extends: "tbody"
    })
    export class QueryGridTableDataBody extends Sortable {
        constructor(private _table: QueryGridTableData) {
            super();
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
                const columnsFragment = document.createDocumentFragment();

                while (this.columns.length < columnCount) {
                    const column = this._createColumn();
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
            const lastPinnedColumn = Enumerable.from(columns).lastOrDefault(c => c.isPinned);
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
            const lastPinnedColumn = Enumerable.from(columns).lastOrDefault(c => c.isPinned);
            this.columns.forEach((col, index) => col.setColumn(columns[index], columns[index] === lastPinnedColumn));
        }

        protected _createColumn(): QueryGridTableColumn {
            return new Vidyano.WebComponents.QueryGridTableFooterColumn();
        }
    }

    export class QueryGridTableDataRow extends QueryGridTableRow {
        private _itemPropertyChangedListener: Vidyano.Common.ISubjectDisposer;
        private _itemQueryPropertyChangedListener: Vidyano.Common.ISubjectDisposer;
        private _groupHeader: QueryGridTableDataColumnGroupHeader;
        private _groupIndent: QueryGridTableDataColumnGroupIndent;
        private _selector: QueryGridTableDataColumnSelector;
        private _actions: QueryGridTableDataColumnActions;
        private _item: QueryResultItem;
        private _group: QueryResultItemGroup;
        private _type: ("group" | "data");
        private _columnCount: number;
        private _firstCellWithPendingUpdates: number;
        private _isSelected: boolean;
        private _columnsInUse: number;
        private _extraClass: string;
        private _placeholder: boolean;
        columns: QueryGridTableDataColumn[];

        constructor(table: QueryGridTableData) {
            super("vi-query-grid-table-data-row", table);

            const specialColumns = document.createDocumentFragment();

            Polymer.dom(specialColumns).appendChild((this._groupHeader = new Vidyano.WebComponents.QueryGridTableDataColumnGroupHeader(this)).host);
            Polymer.dom(specialColumns).appendChild((this._groupIndent = new Vidyano.WebComponents.QueryGridTableDataColumnGroupIndent(this)).host);
            Polymer.dom(specialColumns).appendChild((this._selector = new Vidyano.WebComponents.QueryGridTableDataColumnSelector(this)).host);
            Polymer.dom(specialColumns).appendChild((this._actions = new Vidyano.WebComponents.QueryGridTableDataColumnActions(this)).host);

            this.host.insertBefore(specialColumns, this.host.firstChild);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
        }

        get groupHeader(): QueryGridTableDataColumnGroupHeader {
            return this._groupHeader;
        }

        get selector(): QueryGridTableDataColumnSelector {
            return this._selector;
        }

        get actions(): QueryGridTableDataColumnActions {
            return this._actions;
        }

        get type(): ("group" | "data") {
            return this._type;
        }

        private _setType(type: ("group" | "data")) {
            if (type === this._type)
                return;

            const oldType = this._type;
            this._type = type;

            if (type)
                this.host.setAttribute("type", type);
            else if (!!oldType)
                this.host.removeAttribute("type");

            if (this.type !== "data")
                this._item = this.selector.item = this.actions.item = null;

            if (this.type !== "group")
                this._group = null;
        }

        private _setPlaceholder(placeholder: boolean) {
            if (this._placeholder === placeholder)
                return;

            if (this._placeholder = placeholder)
                this.host.setAttribute("placeholder", "");
            else
                this.host.removeAttribute("placeholder");
        }

        get item(): QueryResultItem {
            return this._item;
        }

        private _setItem(item: QueryResultItem) {
            if (this._item === item)
                return;

            if (this._itemPropertyChangedListener) {
                this._itemPropertyChangedListener();
                this._itemPropertyChangedListener = null;

                this._itemQueryPropertyChangedListener();
                this._itemQueryPropertyChangedListener = null;
            }

            if (this._item = item)
                this._setType("data");
        }

        get group(): QueryResultItemGroup {
            return this._group;
        }

        private _setGroup(group: QueryResultItemGroup) {
            if (this._group = group)
                this._setType("group");
        }

        setItem(group: QueryResultItemGroup): boolean;
        setItem(item: QueryResultItem, columns: QueryGridColumn[], lastPinnedIndex?: number): boolean;
        setItem(itemOrGroup: (QueryResultItem | QueryResultItemGroup), columns?: QueryGridColumn[], lastPinnedIndex?: number): boolean {
            if (!itemOrGroup) {
                this._setGroup(null);
                this._setItem(null);

                if (itemOrGroup !== null)
                    this._setType(null);
                else {
                    this._setPlaceholder(true);
                    this._setType("data");
                }

                return false;
            } else {
                this._setPlaceholder(false);

                if (itemOrGroup instanceof QueryResultItem) {
                    this._setPlaceholder(false);

                    if (this.group)
                        this._setGroup(null);

                    const item = itemOrGroup;
                    if (item !== this.item) {
                        this._setItem(this.selector.item = this.actions.item = item);

                        let extraClass = this.item ? this.item.getTypeHint("extraclass") : null;
                        if (this._extraClass && extraClass !== this._extraClass) {
                            this.host.classList.remove(...this._extraClass.split(" "));
                            this._extraClass = null;
                        }

                        if (!!this.item) {
                            this._itemPropertyChangedListener = this.item.propertyChanged.attach(this._itemPropertyChanged.bind(this));
                            this._itemQueryPropertyChangedListener = this.item.query.propertyChanged.attach(this._itemQueryPropertyChanged.bind(this));

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
                        if (!gridColumn.setItem(item instanceof QueryResultItem ? item : null, columns ? columns[index] : null, lastPinnedIndex === index) && this._firstCellWithPendingUpdates < 0)
                            this._firstCellWithPendingUpdates = index;
                    });

                    return this._firstCellWithPendingUpdates >= 0;
                } else if (itemOrGroup instanceof QueryResultItemGroup) {
                    if (this.item)
                        this._setItem(null);

                    this._setGroup(this._groupHeader.group = itemOrGroup);
                    this._groupHeader.host.setAttribute("colspan", this.host.children.length.toString());
                }
            }

            return false;
        }

        /*
         * Returns true if the row has any cells with pending updates.
         */
        updatePendingCellUpdates(): boolean {
            if (this._firstCellWithPendingUpdates < 0)
                return false;

            for (let i = this._firstCellWithPendingUpdates; i < this.columns.length; i++) {
                if (this.columns[i].update())
                    this._firstCellWithPendingUpdates++;
                else
                    break;
            }

            if (this._firstCellWithPendingUpdates === this.columns.length) {
                this._firstCellWithPendingUpdates = -1;
                return false;
            }

            return true;
        }

        transform(x: number) {
            const transform = x ? `translate(${x}px, 0)` : "";

            this.table.grid.transform(transform, this._groupHeader.host);
            this.table.grid.transform(transform, this._groupIndent.host);
            this.table.grid.transform(transform, this._selector.host);
            this.table.grid.transform(transform, this._actions.host);
        }

        private async _tap(e: TapEvent) {
            if (!this.item)
                return;

            if (this.item.getTypeHint("extraclass", "").split(" ").some(c => c.toUpperCase() === "DISABLED"))
                return;

            if (this.table.grid.fire("item-tap", { item: this.item }, { bubbles: false, cancelable: true }).defaultPrevented)
                return;

            let openaction = this.item.getTypeHint("openaction", null);
            if (openaction) {
                const action = Enumerable.from(this.item.query.actions).firstOrDefault(a => a.name === openaction) || Vidyano.Action.get(this.item.service, openaction, this.item.query);
                if (action)
                    await action.execute({ selectedItems: [this.item] });
                else
                    console.warn(`Unknown openaction '${openaction}'.`);

                return;
            }

            if (this.table.grid.query.canRead && !this.table.grid.query.asLookup && !this.table.grid.asLookup) {
                if (!this.table.grid.app.noHistory && e.detail.sourceEvent && ((<KeyboardEvent>e.detail.sourceEvent).ctrlKey || (<KeyboardEvent>e.detail.sourceEvent).shiftKey)) {
                    // Open in new window/tab
                    window.open(Path.routes.root + this.table.grid.app.getUrlForPersistentObject(this.item.query.persistentObject.id, this.item.id));

                    e.stopPropagation();
                    return;
                }

                this.table.grid["_itemOpening"] = this.item;
                const po = await this.item.getPersistentObject();
                if (!po)
                    return;

                if (this.table.grid["_itemOpening"] === this.item) {
                    this.table.grid["_itemOpening"] = undefined;

                    this.item.query.service.hooks.onOpen(po);
                }
            }
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
            if (this._isSelected !== (!!this.item && !this.item.ignoreSelect && this.item.isSelected)) {
                if (this._isSelected = !!this.item && !this.item.ignoreSelect && this.item.isSelected) {
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
                if (this._column && Vidyano.DataType.isNumericType(this._column.type))
                    this.host.setAttribute("numeric", "");
                else
                    this.host.removeAttribute("numeric");

                if (this._column && this._column.column.isSensitive)
                    this.host.setAttribute("sensitive", "");
                else
                    this.host.removeAttribute("sensitive");
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
            let safeName = name.replace(/[\. ]/g, "_");

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
        private _customCellTemplate: PolymerTemplate;
        private _customCellTemplateInstance: TemplateInstance;
        private _customCellTemplateType: string;
        private _lastColumnType: string;

        constructor(private _row: QueryGridTableDataRow) {
            super("vi-query-grid-table-data-column");
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

        private _empty() {
            if (!this.cell)
                return;

            this._customCellTemplateInstance = this._customCellTemplateType = null;
            Polymer.dom(this.host).removeChild(this.cell);
            this.cell = null;
        }

        private _setScopedStyle() {
            Enumerable.from(this.host.children).forEach(c => {
                c.classList.add("style-scope", "vi-query-grid");
            });
        }

        private _render(): boolean {
            if (this.column) {
                if (this._lastColumnType !== this.column.type) {
                    const customCellTemplate = QueryGridCellTemplate.Load(this.column.type);

                    if (this._customCellTemplateInstance && customCellTemplate !== this._customCellTemplate)
                        this._empty();

                    this._customCellTemplate = customCellTemplate;
                    this._lastColumnType = this.column.type;
                }
            }
            else
                this._lastColumnType = null;

            if (!this._item || !this.column) {
                if (this.hasContent) {
                    this._empty();
                    this._setHasContent(false);
                }

                return true;
            }

            if (!this._row.table.grid.isColumnInView(this.column))
                return false;

            const itemValue = this._item.getFullValue(this.column.name);
            if (!this._customCellTemplateInstance || this._customCellTemplateType !== this.column.type) {
                this._empty();
                this._customCellTemplateInstance = this._customCellTemplate.stamp({ value: itemValue });
                this._customCellTemplateType = this.column.type;

                if (this._customCellTemplateInstance.root.childElementCount === 1) {
                    this.host.appendChild(this._customCellTemplateInstance.root);
                    this.cell = <HTMLElement>this.host.firstElementChild;
                }
                else {
                    this.cell = document.createElement("div");
                    this.cell.appendChild(this._customCellTemplateInstance.root);
                    Polymer.dom(this.host).appendChild(this.cell);
                }

                this._setScopedStyle();
            }
            else
                (<any>this._customCellTemplateInstance).value = itemValue;

            this._setHasContent(true);

            return true;
        }
    }

    export class QueryGridTableColumnRemainder extends QueryGridTableColumn {
        constructor() {
            super("vi-query-grid-table-column-remainder", document.createElement("div"));
        }
    }

    export class QueryGridTableDataColumnGroupHeader extends QueryGridTableColumn {
        private _groupIcon: Icon;
        private _label: HTMLLabelElement;
        private _group: QueryResultItemGroup;
        private _collapsed: boolean;

        constructor(private _row: QueryGridTableDataRow, private _sticky = false) {
            super("vi-query-grid-table-data-column-group-header", document.createElement("div"), true);

            const elements = document.createDocumentFragment();

            elements.appendChild(this._groupIcon = new Vidyano.WebComponents.Icon("QueryGrid_Group_Row"));
            this._groupIcon.classList.add("style-scope", "vi-query-grid");

            elements.appendChild(this._label = document.createElement("label"));
            this.cell.appendChild(elements);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
        }

        private _setCollapsed(collapsed: boolean) {
            if (this._collapsed === collapsed)
                return;

            if (this._collapsed = collapsed)
                this.host.setAttribute("collapsed", "");
            else
                this.host.removeAttribute("collapsed");
        }

        get group(): QueryResultItemGroup {
            return this._group;
        }

        set group(group: QueryResultItemGroup) {
            this._setCollapsed(group ? group.isCollapsed : false);

            if (this._group === group)
                return;

            this._group = group;
            if (!!group) {
                let label = this.group.name;
                if (StringEx.isNullOrWhiteSpace(label))
                    label = label == null ? group.query.service.getTranslatedMessage("DistinctNullValue") : group.query.service.getTranslatedMessage("DistinctEmptyValue");

                this._label.textContent = `${label} (${group.count})`;
            }
            else
                this._label.textContent = "";
        }

        updateCollapsed() {
            this._setCollapsed(this.group.isCollapsed);
        }

        private _tap(e: TapEvent) {
            e.stopPropagation();
            if (!this.group)
                return;

            this.group.isCollapsed = !this.group.isCollapsed;
            this._setCollapsed(this.group.isCollapsed);

            this._row.table.grid.fire("group-collapsed-changed", this.group, { bubbles: false });
        }
    }

    export class QueryGridTableDataColumnGroupIndent extends QueryGridTableColumn {
        constructor(private _row: QueryGridTableDataRow, private _sticky = false) {
            super("vi-query-grid-table-data-column-group-indent", document.createElement("div"), true);
        }
    }

    export class QueryGridTableDataColumnSelector extends QueryGridTableColumn {
        item: QueryResultItem;

        constructor(private _row: QueryGridTableDataRow) {
            super("vi-query-grid-table-data-column-selector", new Vidyano.WebComponents.Icon("Selected"), true);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
            this._row.table.grid.async(() => Polymer.dom(this.host).appendChild(document.createElement("paper-ripple")));
        }

        private _tap(e: TapEvent) {
            e.stopPropagation();
            if (!this.item)
                return;

            const event = e.detail.preventer || e.detail.sourceEvent;
            this._row.table.grid.fire("item-select", {
                item: this.item,
                shift: !!event && event instanceof MouseEvent ? event.shiftKey : false,
                ctrl: this._row.table.grid.app.configuration.getSetting("vi-query-grid.single-click", "true").toLowerCase() === "true" || (!!event && event instanceof MouseEvent ? event.ctrlKey : true)
            }, { bubbles: false });
        }
    }

    export class QueryGridTableDataColumnActions extends QueryGridTableColumn {
        item: QueryResultItem;

        constructor(private _row: QueryGridTableDataRow) {
            super("vi-query-grid-table-data-column-actions", new Vidyano.WebComponents.Icon("EllipsisVertical"), true);

            Polymer.Gestures.add(this.host, "tap", this._tap.bind(this));
            this._row.table.grid.async(() => Polymer.dom(this.host).appendChild(document.createElement("paper-ripple")));
        }

        private _tap(e: TapEvent) {
            e.stopPropagation();

            if (!this.item || (this.item.query.selectedItems && this.item.query.selectedItems.length > 0))
                return;

            this._row.table.grid.fire("item-actions", { row: this._row, host: this.host }, { bubbles: false });
        }
    }

    interface IQueryGridOutOfViewColumns {
        left?: QueryGridColumn[];
        right?: QueryGridColumn[];
    }

    @WebComponent.register({
        properties: {
            initializing: {
                type: Boolean,
                readOnly: true,
                value: true,
                notify: true,
                observer: "_initializingChanged"
            },
            isBusy: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.isBusy"
            },
            configureOnly: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeConfigureOnly(query, _columns, isBusy, initializing)"
            },
            query: {
                type: Object,
                observer: "_queryChanged"
            },
            _settings: {
                type: Object,
                computed: "_computeSettings(query.columns)"
            },
            _columns: {
                type: Object,
                computed: "_computeColumns(_settings.columns)"
            },
            _items: {
                type: Object,
                computed: "_computeItems(query.items, collapsedGroups, viewportSize, _verticalScrollOffset, rowHeight, query.lastUpdated)"
            },
            collapsedGroups: {
                type: Object,
                readOnly: true,
                value: null
            },
            canReorder: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.canReorder"
            },
            asLookup: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            viewportSize: {
                type: Object,
                observer: "_viewportSizeChanged"
            },
            headerControlsSize: {
                type: Object,
                observer: "_headerControlsSizeChanged"
            },
            rowHeight: {
                type: Number,
                computed: "_computeRowHeight(query, app)"
            },
            noSelection: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            canSelect: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeCanSelect(query, noSelection, asLookup)"
            },
            selectAllSelected: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.selectAll.allSelected"
            },
            hasSelectedItems: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasSelectedItems(query.selectedItems)"
            },
            noInlineActions: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            inlineActions: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeInlineActions(query, noInlineActions)"
            },
            canFilter: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "query.canFilter"
            },
            hasGrouping: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            hasTotalItem: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasTotalItem(query.totalItem, _items, columnWidthsCalculated)"
            },
            isReordering: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            columnWidthsCalculated: {
                type: Boolean,
                readOnly: true
            },
            _verticalScrollOffset: {
                type: Number,
                observer: "_verticalScrollOffsetChanged"
            },
            _horizontalScrollOffset: {
                type: Number,
                observer: "_horizontalScrollOffsetChanged"
            },
            forceScrollbars: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        observers: [
            "_updateTables(_items, _columns, canReorder)",
            "_updateVerticalSpacer(rowHeight, viewportSize, query.lastUpdated)",
            "_updateOutOfViewColumns(_columns, viewportSize, _horizontalScrollOffset, columnWidthsCalculated)"
        ],
        forwardObservers: [
            "query.columns",
            "query.items",
            "query.isBusy",
            "query.lastUpdated",
            "query.canFilter",
            "query.totalItems",
            "query.totalItem",
            "query.selectAll.isAvailable",
            "query.selectAll.allSelected",
            "query.selectedItems",
            "_settings.columns"
        ],
        listeners: {
            "item-select": "_itemSelect",
            "item-actions": "_itemActions",
            "group-collapsed-changed": "_groupCollapsedChanged",
            "column-widths-updated": "_columnWidthsUpdated",
            "dataHost.contextmenu": "_contextmenuData",
            "scroll": "_preventScroll",
            "drag-start": "_dragStart",
            "drag-end": "_dragEnd",
            "toggle-pin": "_togglePin",
            "hide-column": "_hideColumn",
            "configure-columns": "_configureColumns"
        },
        keybindings: {
            "pagedown": "_pageDown",
            "pageup": "_pageUp",
            "down": "_downArrow",
            "up": "_upArrow"
        }
    })
    export class QueryGrid extends WebComponent {
        private static tableCache: { header: QueryGridTableHeader; footer: QueryGridTableFooter, data: QueryGridTableData }[] = [];
        private static perf = performance;
        static profile: boolean;

        private _tableData: QueryGridTableData;
        private _tableHeader: QueryGridTableHeader;
        private _tableFooter: QueryGridTableFooter;
        private _tablesUpdating: Promise<any>;
        private _tablesUpdatingTimestamp: Date;
        private _virtualTableOffset: number;
        private _virtualTableOffsetCurrent: number;
        private _virtualTableStartIndex: number;
        private _verticalSpacerCorrection: number = 1;
        private _verticalScrollOffset: number;
        private _horizontalScrollOffset: number;
        private _horizontalScrollOffsetCurrent: number;
        private _items: (QueryResultItem | QueryResultItemGroup)[];
        private _columns: QueryGridColumn[];
        private _hasPendingUpdates: boolean;
        private _itemOpening: Vidyano.QueryResultItem;
        private _lastSelectedItemIndex: number;
        private _minimumColumnWidth: number;
        private _remainderWidth: number;
        private _settings: QueryGridUserSettings;
        private _lastUpdated: Date;
        private _reorderRow: QueryGridTableDataRow;
        private _outOfViewColumnsWorkerHandle: number;
        readonly columnWidthsCalculated: boolean; private _setColumnWidthsCalculated: (val: boolean) => void;
        readonly rowHeight: number;;
        readonly initializing: boolean; private _setInitializing: (initializing: boolean) => void;
        readonly isReordering: boolean; private _setIsReordering: (reodering: boolean) => void;
        readonly hasGrouping: boolean; private _setHasGrouping: (hasGrouping: boolean) => void;
        readonly collapsedGroups: QueryResultItemGroup[]; private _setCollapsedGroups: (groups: QueryResultItemGroup[]) => void;
        readonly hasTotalItem: boolean;
        canReorder: boolean;
        viewportSize: ISize;
        headerControlsSize: ISize;
        query: Vidyano.Query;
        asLookup: boolean;

        attached() {
            if (QueryGrid.tableCache.length > 0 && !this._tableData) {
                const tableCache = QueryGrid.tableCache.pop();

                requestAnimationFrame(() => {
                    this._tableHeader = tableCache.header;
                    this._tableData = tableCache.data;
                    this._tableFooter = tableCache.footer;

                    this._tableHeader.grid = this._tableData.grid = this._tableFooter.grid = this;

                    Polymer.dom(this.$.dataHeaderHostColumns).appendChild(this._tableHeader.host);
                    Polymer.dom(this.$.dataHost).appendChild(this._tableData.host);
                    Polymer.dom(this.$.dataFooterHost).appendChild(this._tableFooter.host);

                    this.updateStyles();
                });
            }

            super.attached();
        }

        detached() {
            super.detached();

            if (this._tableData) {
                const headerFragment = document.createDocumentFragment();
                const dataFragment = document.createDocumentFragment();

                const cachEntry = {
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
                            this.transform("", cell.host);
                    });

                    row.transform(0);
                    row.setItem(null, null);
                });

                this._hasPendingUpdates = false;
            }
        }

        private _computeRowHeight(query: Vidyano.Query): number {
            if (!this.isAttached || !this.query)
                return;

            const config = this.app.configuration.getQueryConfig(query);
            const rowHeight = config && config.rowHeight ? config.rowHeight : parseInt(getComputedStyle(this).lineHeight);

            this.customStyle["--query-grid--row-height"] = `${rowHeight}px`;
            this.updateStyles();

            return rowHeight;
        }

        isColumnInView(column: QueryGridColumn): boolean {
            if (column.isPinned || !column.calculatedOffset)
                return true;

            return (column.calculatedOffset || 0) < this.viewportSize.width + this._horizontalScrollOffset;
        }

        private get _style(): Style {
            return <Style>this.$.style;
        }

        private get _actionMenu(): PopupCore {
            return <PopupCore>this.$.actions;
        }

        private _queryChanged(query: Vidyano.Query) {
            if (!query || !query.groupingInfo) {
                this._setCollapsedGroups(null);
                return;
            }

            this._setCollapsedGroups(query.groupingInfo.groups.filter(g => g.isCollapsed));
        }

        private _initializingChanged() {
            this.toggleClass("initializing", this.initializing);
        }

        private _viewportSizeChanged(viewportSize: ISize) {
            if (this._hasPendingUpdates)
                this._updateTableDataPendingUpdates();

            if (!this._remainderWidth || this._remainderWidth < viewportSize.width) {
                this._style.setStyle("Remainder", `td[is="vi-query-grid-table-column-remainder"] { width: ${viewportSize.width}px; }`);
                this._remainderWidth = viewportSize.width * 2;
            }
        }

        private _headerControlsSizeChanged(size: ISize) {
            this.customStyle["--vi-query-grid--data-offset"] = `${size.width}px`;
            this.updateStyles();
        }

        private _verticalScrollOffsetChanged(verticalScrollOffset: number) {
            if (!this.query)
                return;

            this.query["_query-grid-vertical-scroll-offset"] = verticalScrollOffset;
        }

        private _horizontalScrollOffsetChanged(horizontalScrollOffset: number) {
            if (!this._tableData || (!horizontalScrollOffset && !this._horizontalScrollOffsetCurrent))
                return;

            if (this._actionMenu.open)
                this._actionMenu.close();

            this.customStyle["--query-grid-table--horizontal-scroll-offset"] = `-${this._horizontalScrollOffsetCurrent = horizontalScrollOffset}px`;
            this.updateStyles();

            [this._tableHeader, this._tableData, this._tableFooter].forEach(table => {
                table.rows.forEach(row => {
                    row.columns.forEach(column => {
                        if (column.host.classList.contains("pinned"))
                            this.transform(`translate(${horizontalScrollOffset}px, 0)`, column.host);
                    });

                    if (row instanceof QueryGridTableDataRow) {
                        row.transform(horizontalScrollOffset);
                    }
                });
            });

            this._updateTableDataPendingUpdates();
        }

        private _computeSettings(columns: Vidyano.QueryColumn[]): QueryGridUserSettings {
            return columns && columns.length > 0 ? QueryGridUserSettings.Load(columns[0].query) : null;
        }

        private _computeColumns(columns: QueryGridColumn[]): QueryGridColumn[] {
            if (!columns || columns.length === 0)
                return [];

            const visibleColumns = Enumerable.from(
                columns).where(c => !c.isHidden).memoize();
            const pinnedColumns = visibleColumns.where(c => c.isPinned).orderBy(c => c.offset).toArray();
            const unpinnedColumns = visibleColumns.where(c => !c.isPinned).orderBy(c => c.offset).toArray();

            columns = pinnedColumns.concat(unpinnedColumns);
            columns.forEach(c => c.reset());

            return columns;
        }

        private _computeConfigureOnly(query: Vidyano.Query, _columns: QueryGridColumn[], isBusy: boolean, initializing: boolean): boolean {
            if (query && _columns && _columns.length === 0 && !isBusy && !initializing)
                return true;

            return false;
        }

        private _updateOutOfViewColumns(columns: QueryGridColumn[], viewportSize: ISize, horizontalScrollOffset: number, columnWidthsCalculated: boolean) {
            if (!columnWidthsCalculated)
                return;

            if (this._outOfViewColumnsWorkerHandle)
                window.cancelIdleCallback(this._outOfViewColumnsWorkerHandle);

            if (horizontalScrollOffset > 0)
                this.$.moreLeft.removeAttribute("hidden");

            columns = columns.filter(c => !c.isHidden && !c.isPinned);

            this.toggleAttribute("hidden", horizontalScrollOffset === 0, this.$.moreLeft);
            this.toggleAttribute("hidden", !columns.some(c => c.calculatedOffset + this.headerControlsSize.width - horizontalScrollOffset > viewportSize.width), this.$.moreRight);

            this._outOfViewColumnsWorkerHandle = window.requestIdleCallback(() => {
                if (!this.isAttached)
                    return;

                const left: PopupMenuItem[] = [];
                const right: PopupMenuItem[] = [];

                columns.forEach(c => {
                    if (c.calculatedOffset - horizontalScrollOffset < 0)
                        left.push(<PopupMenuItem>Polymer.dom(this.$.moreLeftContent).querySelector(`vi-popup-menu-item[name="${c.name}"]`) || new Vidyano.WebComponents.PopupMenuItem(c.label, null, () => this._bringColumnIntoView(c)));
                    else if (c.calculatedOffset + this.headerControlsSize.width - horizontalScrollOffset > viewportSize.width)
                        right.push(<PopupMenuItem>Polymer.dom(this.$.moreRightContent).querySelector(`vi-popup-menu-item[name="${c.name}"]`) || new Vidyano.WebComponents.PopupMenuItem(c.label, null, () => this._bringColumnIntoView(c, true)));
                });

                Polymer.dom(this.$.moreLeftContent).children.filter(c => left.indexOf(<PopupMenuItem>c) < 0).forEach(c => Polymer.dom(this.$.moreLeftContent).removeChild(c));
                Polymer.dom(this.$.moreRightContent).children.filter(c => left.indexOf(<PopupMenuItem>c) < 0).forEach(c => Polymer.dom(this.$.moreRightContent).removeChild(c));

                left.forEach(c => Polymer.dom(this.$.moreLeftContent).appendChild(c));
                right.forEach(c => Polymer.dom(this.$.moreRightContent).appendChild(c));

                Polymer.dom(this.$.moreLeftContent).flush();
                Polymer.dom(this.$.moreRightContent).flush();
            });
        }

        private _bringColumnIntoView(column: QueryGridColumn, rightAlign?: boolean) {
            if (rightAlign)
                this._horizontalScrollOffset = column.calculatedOffset + column.calculatedWidth - this.viewportSize.width + this.$.headerControls.offsetWidth + this.$.moreRight.offsetWidth - 1;
            else
                this._horizontalScrollOffset = column.calculatedOffset + this.$.headerControls.offsetWidth - this.headerControlsSize.width - this.$.moreLeft.offsetWidth - 1;
        }

        private _computeItems(items: Vidyano.QueryResultItem[], collapsedGroups: Vidyano.QueryResultItemGroup[], viewportSize: ISize, verticalScrollOffset: number, rowHeight: number, lastUpdated: Date): (Vidyano.QueryResultItem | Vidyano.QueryResultItemGroup)[] {
            if (!rowHeight || !viewportSize.height)
                return [];

            this._setHasGrouping(!!this.query.groupingInfo && !!this.query.groupingInfo.groups);
            const groups = this.hasGrouping && items.length > 0 ? this.query.groupingInfo.groups : [];

            const totalItems = this._calculateTotalItems();

            if (verticalScrollOffset > 0 && (!items || items.length === 0) && this.offsetParent != null) {
                (<Scroller>this.$.scroller).scrollToTop();
                return undefined;
            }

            verticalScrollOffset *= this._verticalSpacerCorrection;

            if (this._actionMenu.open)
                this._actionMenu.close();

            const maxTableRowCount = Math.floor(viewportSize.height * 1.5 / rowHeight);
            let viewportStartRowIndex = Math.floor(verticalScrollOffset / rowHeight);
            const viewportEndRowIndex = Math.ceil((verticalScrollOffset + viewportSize.height) / rowHeight);
            let newVirtualTableStartIndex;

            if (this._virtualTableStartIndex === undefined)
                this._virtualTableStartIndex = newVirtualTableStartIndex = 0;
            else if (viewportEndRowIndex - this._virtualTableStartIndex > maxTableRowCount)
                newVirtualTableStartIndex = viewportStartRowIndex;
            else if (viewportStartRowIndex < this._virtualTableStartIndex)
                newVirtualTableStartIndex = viewportEndRowIndex - maxTableRowCount;

            if (newVirtualTableStartIndex !== undefined) {
                if (newVirtualTableStartIndex % 2 !== 0 && this._verticalSpacerCorrection === 1)
                    newVirtualTableStartIndex--;

                if (newVirtualTableStartIndex < 0)
                    newVirtualTableStartIndex = 0;

                this._virtualTableStartIndex = newVirtualTableStartIndex;
                this._virtualTableOffset = (this._virtualTableStartIndex * rowHeight) / this._verticalSpacerCorrection;
            }

            const itemsStartIndex = this._virtualTableStartIndex;
            const itemsEndIndex = Math.min(itemsStartIndex + maxTableRowCount, totalItems);
            const missingItemIndexes: number[] = [];

            let newItems: (QueryResultItem | QueryResultItemGroup)[];
            if (!this.hasGrouping) {
                newItems = items.slice(itemsStartIndex, itemsEndIndex);
                if (Object.keys(newItems).length !== maxTableRowCount) {
                    for (let i = itemsStartIndex; i < itemsEndIndex; i++) {
                        if (!items[i])
                            missingItemIndexes.push(i);
                    }
                }

                if (this.query.hasMore && totalItems != null && itemsEndIndex > totalItems - 10)
                    missingItemIndexes.push(totalItems);
            }
            else {
                newItems = new Array(this.query.totalItems);
                newItems.splice(0, items.length, ...items);

                groups.forEach((group, index) => newItems.splice(group.start + index, 0, group));

                let collapsedItemCount = 0;
                groups.forEach((group, groupIndex) => {
                    const groupStart = group.start + groupIndex - collapsedItemCount;
                    const groupEnd = groupStart + group.count;

                    if (!group.isCollapsed) {
                        const start = Math.max(groupStart, itemsStartIndex);
                        const end = Math.min(groupEnd, itemsEndIndex);

                        if (end - start > 0) {
                            for (let i = start; i < end; i++) {
                                const itemIndex = i - groupIndex + collapsedItemCount;
                                if (!items[itemIndex])
                                    missingItemIndexes.push(itemIndex);
                            }
                        }

                        return;
                    }

                    newItems.splice(groupStart + 1, group.count);
                    collapsedItemCount += group.count;
                });

                newItems = newItems.slice(itemsStartIndex, itemsEndIndex + 1);
            }

            if (missingItemIndexes.length > 0) {
                const missing = itemsEndIndex - itemsStartIndex;
                for (let i = 0; i < missing; i++) {
                    if (!!newItems[i])
                        continue;

                    newItems[i] = null;
                }

                this.debounce(`QueryGrid.Query.${this.query.id}.getItemsByIndex`, () => this.query.getItemsByIndex(...missingItemIndexes), 250);
            }
            else if (newVirtualTableStartIndex === undefined && this._items && this._items.length === newItems.length && lastUpdated === this._lastUpdated)
                return this._items;

            this._lastUpdated = lastUpdated;
            return newItems;
        }

        private _computeCanSelect(query: Vidyano.Query, noSelection: boolean, asLookup: boolean): boolean {
            return !noSelection && !!query && (asLookup || query.actions.some(a => a.isVisible && a.definition.selectionRule !== ExpressionParser.alwaysTrue));
        }

        private _computeHasSelectedItems(selectedItems: Vidyano.QueryResultItem[]): boolean {
            return selectedItems && selectedItems.length > 0;
        }

        private _computeInlineActions(query: Vidyano.Query, noInlineActions: boolean): boolean {
            return !noInlineActions && !!query && !query.asLookup && !this.asLookup && (query.actions.some(a => a.isVisible && a.definition.selectionRule !== ExpressionParser.alwaysTrue && a.definition.selectionRule(1)));
        }

        private _computeHasTotalItem(totalItem: Vidyano.QueryResultItem, items: Vidyano.QueryResultItem[], columnWidthsUpdated: boolean): boolean {
            return !!totalItem && items && items.length > 0 && columnWidthsUpdated;
        }

        private _updateTables(items: Vidyano.QueryResultItem[], columns: QueryGridColumn[], canReorder: boolean) {
            const _tablesUpdatingTimestamp = this._tablesUpdatingTimestamp = new Date();

            const tablesUpdating = this._tablesUpdating = (this._tablesUpdating || Promise.resolve()).then(() => new Promise(resolve => {
                if (_tablesUpdatingTimestamp !== this._tablesUpdatingTimestamp)
                    return resolve(null);

                this._requestAnimationFrame(() => {
                    let start;
                    if (Vidyano.WebComponents.QueryGrid.profile)
                        start = Vidyano.WebComponents.QueryGrid.perf.now();

                    if (!this._tableHeader)
                        Polymer.dom(this.$.dataHeaderHostColumns).appendChild((this._tableHeader = new Vidyano.WebComponents.QueryGridTableHeader(this)).host);

                    if (!this._tableData)
                        Polymer.dom(this.$.dataHost).appendChild((this._tableData = new Vidyano.WebComponents.QueryGridTableData(this)).host);

                    if (!this._tableFooter)
                        Polymer.dom(this.$.dataFooterHost).appendChild((this._tableFooter = new Vidyano.WebComponents.QueryGridTableFooter(this)).host);

                    Promise.all([this._tableHeader.update(columns.length), this._tableFooter.update(columns.length), this._tableData.update(items.length, columns.length)]).then(() => {
                        (<QueryGridTableDataBody><any>this._tableData.section).enabled = canReorder;

                        if (Vidyano.WebComponents.QueryGrid.profile) {
                            const timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                            console.info(`Tables Updated: ${Math.round(timeTaken)}ms`);
                        }

                        this._updateTableHeadersAndFooters(columns).then(cont => {
                            if (!cont)
                                return Promise.resolve();

                            return this._updateTableData(items, columns);
                        }).then(() => {
                            resolve(null);

                            if (tablesUpdating === this._tablesUpdating)
                                this._tablesUpdating = null;

                            const savedVerticalScrollOffset = this.query["_query-grid-vertical-scroll-offset"];
                            if (!!savedVerticalScrollOffset && this._verticalScrollOffset !== savedVerticalScrollOffset)
                                this._verticalScrollOffset = savedVerticalScrollOffset;
                        });
                    });
                });
            }));
        }

        private _calculateTotalItems(): number {
            let totalItems = this.query.totalItems;
            if (this.query.groupingInfo) {
                totalItems += this.query.groupingInfo.groups.length;
                this.query.groupingInfo.groups.filter(group => group.isCollapsed).forEach(group => totalItems -= group.count);
            }

            return totalItems;
        }

        private _updateVerticalSpacer(rowHeight: number, viewportSize: ISize) {
            this._requestAnimationFrame(() => {
                const newHeight = this._calculateTotalItems() * rowHeight;
                this.$.verticalSpacer.style.height = `${newHeight}px`;

                this._verticalSpacerCorrection = (newHeight - this.viewportSize.height) / (this.$.verticalSpacer.clientHeight - this.viewportSize.height);
            });
        }

        private _updateTableHeadersAndFooters(columns: QueryGridColumn[]): Promise<boolean> {
            return new Promise(resolve => {
                this._requestAnimationFrame(() => {
                    if (columns !== this._columns) {
                        resolve(false);
                        return;
                    }

                    this._tableHeader.rows.forEach((row: QueryGridTableHeaderRow) => row.setColumns(columns));
                    this._tableFooter.rows.forEach((row: QueryGridTableFooterRow) => row.setColumns(columns));

                    resolve(true);
                });
            });
        }

        private _updateTableData(items: Vidyano.QueryResultItem[], columns: QueryGridColumn[]): Promise<any> {
            const horizontalScrollOffset = this._horizontalScrollOffset;
            const virtualTableStartIndex = this._virtualTableStartIndex;

            return new Promise(resolve => {
                let start;
                if (Vidyano.WebComponents.QueryGrid.profile)
                    start = Vidyano.WebComponents.QueryGrid.perf.now();

                const rowCount = this._tableData && this._tableData.rows && this._tableData.rows.length > 0 ? this._tableData.rows.length : 0;
                const virtualTableOffset = this._virtualTableOffset;

                this._requestAnimationFrame(() => {
                    const lastPinnedColumnIndex = Enumerable.from(columns).lastIndexOf(c => c.isPinned);
                    let hasPendingUpdates = this.isReordering || false;

                    let itemsIndex = 0;
                    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                        if (items !== this._items || virtualTableStartIndex !== this._virtualTableStartIndex) {
                            resolve(false);
                            return;
                        }

                        const row = <QueryGridTableDataRow>this._tableData.rows[rowIndex];
                        if (row === this._reorderRow)
                            continue;

                        hasPendingUpdates = row.setItem(items[itemsIndex++], columns, lastPinnedColumnIndex) || hasPendingUpdates;
                    }

                    this._hasPendingUpdates = hasPendingUpdates;

                    if (this._virtualTableOffsetCurrent !== this._virtualTableOffset && this._virtualTableOffset === virtualTableOffset)
                        this.translate3d("0", `${Math.round(this._virtualTableOffsetCurrent = this._virtualTableOffset)}px`, "0", this.$.dataHost);

                    if (Vidyano.WebComponents.QueryGrid.profile) {
                        const timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                        console.info(`Data Updated: ${timeTaken}ms`);
                    }

                    this._updateColumnWidths().then(() => resolve(true));

                    if (this.hasGrouping && this._items.some(i => !(i instanceof Vidyano.QueryResultItem)))
                        this._tableData.host.style.minWidth = `${this.$.dataHeaderHost.scrollWidth}px`;
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
                    let start;
                    if (Vidyano.WebComponents.QueryGrid.profile)
                        start = Vidyano.WebComponents.QueryGrid.perf.now();

                    let hasPendingUpdates = false;
                    Enumerable.from((<QueryGridTableDataRow[]>this._tableData.rows)).forEach(row => {
                        hasPendingUpdates = row.updatePendingCellUpdates() || hasPendingUpdates;
                    });

                    if (Vidyano.WebComponents.QueryGrid.profile) {
                        const timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                        console.info(`Pending Data Updated: ${timeTaken}ms`);
                    }

                    resolve(this._hasPendingUpdates = hasPendingUpdates);
                });
            });
        }

        private _updateColumnWidths(): Promise<any> {
            if (this._columns.some(c => !!c.calculatedWidth) || !this._tableData || !this._tableData.rows || !this._tableData.firstRow) {
                if (this.query && !this.query.isBusy && this.query.items.length === 0) {
                    this._tableData.host.style.minWidth = `${this.$.dataHeaderHost.scrollWidth}px`;
                    this._setInitializing(false);
                }

                return Promise.resolve();
            }

            if (this._tableData.host.style.minWidth)
                this._tableData.host.style.minWidth = null;

            return new Promise(resolve => {
                let start;
                if (Vidyano.WebComponents.QueryGrid.profile)
                    start = Vidyano.WebComponents.QueryGrid.perf.now();

                const tryCompute = () => {
                    this._requestAnimationFrame(() => {
                        let layoutUpdating: boolean;
                        let invalidateColumnWidths: boolean;
                        const columnWidths: { [key: string]: number; } = {};
                        const columnOffsets: { [key: string]: number; } = {};
                        let hasWidthsStyle = !!this._style.getStyle("ColumnWidths");

                        const tables: QueryGridTable[] = [this._tableHeader, this._tableData];
                        if (this.hasTotalItem)
                            tables.push(this._tableFooter);

                        tables.some(table => {
                            const firstRow = table.firstRow;
                            if (!firstRow)
                                return;

                            let offset = 0;
                            return firstRow.columns.filter(cell => !!cell.column && !cell.column.calculatedWidth).some(cell => {
                                if (hasWidthsStyle) {
                                    this._style.setStyle("ColumnWidths", "");
                                    hasWidthsStyle = false;
                                }

                                let width = parseInt(cell.column.width);
                                if (isNaN(width)) {
                                    width = cell.cell.offsetWidth;
                                    /* If grid is not visible, don't calculate the width */
                                    if (!width || this.offsetParent === null /* Visibility check */ || getComputedStyle(cell.cell).display === "none")
                                        return layoutUpdating = true; // Layout is still updating
                                }

                                if (!this._minimumColumnWidth)
                                    this._minimumColumnWidth = parseInt(this.getComputedStyleValue("--vi-query-grid--minimum-column-width"));

                                width = Math.max(width + 10, this._minimumColumnWidth);
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
                        });

                        if (!layoutUpdating && invalidateColumnWidths) {
                            this._columns.forEach(c => {
                                const width = columnWidths[c.name];
                                if (width >= 0) {
                                    c.calculatedWidth = width;
                                    c.calculatedOffset = columnOffsets[c.name];
                                }
                            });

                            this._columnWidthsUpdated();
                            this._setColumnWidthsCalculated(true);
                        }

                        if (!layoutUpdating) {
                            if (Vidyano.WebComponents.QueryGrid.profile) {
                                const timeTaken = Vidyano.WebComponents.QueryGrid.perf.now() - start;
                                console.info(`Column Widths Updated: ${timeTaken}ms`);
                            }

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
                const columnWidthsStyle: string[] = [];

                this._columns.forEach((col, index) => {
                    const columnName = Vidyano.WebComponents.QueryGridTableColumn.columnSafeName(col.name);
                    columnWidthsStyle.push(`table td[name="${columnName}"] > * { width: ${col.calculatedWidth}px; } `);
                });

                this._style.setStyle("ColumnWidths", ...columnWidthsStyle);
            }

            if (detail && detail.column) {
                const width = detail.save ? "" : detail.columnWidth + "px";
                [this._tableData, this._tableFooter].forEach(table => {
                    table.rows.forEach(r => {
                        const col = Enumerable.from(r.columns).firstOrDefault(c => c.column === detail.column);
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

                let columnOffset = detail.column.calculatedOffset + detail.columnWidth;
                this._columns.slice(this._columns.indexOf(detail.column) + 1).forEach(c => {
                    c.calculatedOffset = columnOffset;
                    columnOffset += c.calculatedWidth;
                });

                this._updateTableDataPendingUpdates();
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

        private _dragStart(e: CustomEvent) {
            e.stopPropagation();

            const row = <QueryGridTableDataRow>Enumerable.from(this._tableData.rows).firstOrDefault(r => r.host.classList.contains("sortable-chosen"));
            if (!row)
                return;

            this._reorderRow = row;
            this._setIsReordering(true);
        }

        private _dragEnd(e: CustomEvent, details: ISortableDragEndDetails) {
            e.stopPropagation();

            if (!this.isReordering)
                return;

            this._setIsReordering(false);

            const item = this._reorderRow.item;
            this._reorderRow = null;

            if (details.newIndex == null)
                return;

            this._tableData.rows.splice(details.newIndex, 0, this._tableData.rows.splice(details.oldIndex, 1)[0]);

            const before = details.newIndex > 0 ? (<QueryGridTableDataRow>this._tableData.rows[details.newIndex - 1]).item : null;
            const after = this._tableData.rows.length > details.newIndex + 1 ? (<QueryGridTableDataRow>this._tableData.rows[details.newIndex + 1]).item : null;

            this.query.reorder(before, item, after);
        }

        private _itemSelect(e: CustomEvent, detail: { item: Vidyano.QueryResultItem; shift: boolean; ctrl: boolean; }) {
            if (!detail.item)
                return;

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

        private async _itemActions(e: CustomEvent, detail: { row: QueryGridTableDataRow; host: HTMLElement; position: IPosition; }) {
            if (!(detail.row.item instanceof Vidyano.QueryResultItem))
                return;

            if (detail.row.item.getTypeHint("extraclass", "").split(" ").map(c => c.toUpperCase()).some(c => c === "DISABLED" || c === "READONLY"))
                return;

            if (this.query.selectedItems.length > 0 && this.query.selectedItems.indexOf(detail.row.item) < 0) {
                this.query.selectAll.allSelected = this.query.selectAll.inverse = false;
                this.query.selectedItems = [detail.row.item];
            }

            const actions = (detail.row.item.query.actions || []).filter(a => a.isVisible && a.definition.selectionRule !== ExpressionParser.alwaysTrue && a.selectionRule(Math.max(1, this.query.selectedItems.length)));
            if (actions.length === 0)
                return;

            let host = detail.host;
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
                const button = new Vidyano.WebComponents.ActionButton(this.query.selectedItems.length === 0 ? detail.row.item : null, action);
                button.forceLabel = true;
                button.openOnHover = true;
                button.setAttribute("overflow", "");

                Polymer.dom(this._actionMenu).appendChild(button);
            });

            Polymer.dom(this._actionMenu).flush();

            detail.row.host.setAttribute("hover", "");
            await this._actionMenu.popup(host);
            if (host !== detail.host)
                host.setAttribute("hidden", "");

            this._actionMenu.empty();
            detail.row.host.removeAttribute("hover");
        }

        private _groupCollapsedChanged(e: CustomEvent, group: QueryResultItemGroup) {
            this._updateVerticalSpacer(this.rowHeight, this.viewportSize);

            this._lastUpdated = null;
            this._setCollapsedGroups(this.query.groupingInfo.groups.filter(group => group.isCollapsed));
        }

        private _groupingToggleCollapse(e: TapEvent) {
            const collapse = (<PopupMenuItem>e.currentTarget).icon === "QueryGrid_Group_Collapse";
            this.query.groupingInfo.groups.forEach(g => g.isCollapsed = collapse);

            this.fire("group-collapsed-changed", null, { bubbles: false });

            const groupRows = (<QueryGridTableDataRow[]>this._tableData.rows).filter(r => !!r.group);
            groupRows.forEach(g => g.groupHeader.updateCollapsed());

            (<Scroller>this.$.scroller).scrollToTop();
        }

        private _groupingRemove(e: TapEvent) {
            this.query.group("");
        }

        private _contextmenuData(e: MouseEvent): boolean {
            if (e.which !== 3 || e.shiftKey || e.ctrlKey ||
                !this.query || this.query.asLookup || this.asLookup)
                return true;

            let src = <HTMLElement>e.target;
            while (src && src.tagName !== "TR")
                src = src.parentElement;

            if (!src)
                return true;

            const row = Enumerable.from(this._tableData.rows).firstOrDefault(r => r.host === src);
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

        private _togglePin(e: CustomEvent, column: QueryGridColumn) {
            e.stopPropagation();

            column.isPinned = !column.isPinned;
            this._horizontalScrollOffset = 0;

            this._settings.save();
        }

        private _hideColumn(e: CustomEvent, column: QueryGridColumn) {
            e.stopPropagation();

            column.isHidden = true;
            this._settings.save();
        }

        private async _configureColumns() {
            if (await this.app.showDialog(new Vidyano.WebComponents.QueryGridConfigureDialog(this, this._settings)))
                this._settings.save(true);
        }

        private _upArrow(e: Event) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.query || this.initializing)
                return;

            this._verticalScrollOffset = Math.max(this._verticalScrollOffset - this.rowHeight, 0);
        }

        private _pageUp(e: Event) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.query || this.initializing)
                return;

            const rows = Math.floor(this.viewportSize.height / this.rowHeight) - 2;
            this._verticalScrollOffset = Math.max(this._verticalScrollOffset - rows * this.rowHeight, 0);
        }

        private _downArrow(e: Event) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.query || this.initializing)
                return;

            const totalItems = !this.hasGrouping ? this.query.totalItems : this.query.groupingInfo.groups.length + this.query.totalItems;
            this._verticalScrollOffset = Math.min(this._verticalScrollOffset + this.rowHeight, this.rowHeight * totalItems - this.viewportSize.height);
        }

        private _pageDown(e: Event) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.query || this.initializing)
                return;

            const rows = Math.floor(this.viewportSize.height / this.rowHeight) - 2;
            const totalItems = !this.hasGrouping ? this.query.totalItems : this.query.groupingInfo.groups.length + this.query.totalItems;
            this._verticalScrollOffset = Math.min(this._verticalScrollOffset + rows * this.rowHeight, this.rowHeight * totalItems - this.viewportSize.height);
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
}