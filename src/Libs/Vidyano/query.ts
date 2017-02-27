﻿namespace Vidyano {
    "use strict";

    export enum SortDirection {
        None,
        Ascending,
        Descending
    }

    export interface ISortOption {
        column: QueryColumn;
        direction: SortDirection;
    }

    export interface IQuerySelectAll {
        isAvailable: boolean;
        allSelected: boolean;
        inverse: boolean;
    }

    class QuerySelectAllImpl extends Vidyano.Common.Observable<IQuerySelectAll> implements IQuerySelectAll {
        private _allSelected: boolean = false;
        private _inverse: boolean = false;

        constructor(private _query: Query, private _isAvailable: boolean, observer: Common.IPropertyChangedObserver<QuerySelectAllImpl>) {
            super();

            this.propertyChanged.attach(observer);
        }

        get isAvailable(): boolean {
            if (this._query.maxSelectedItems)
                return;

            return this._isAvailable;
        }

        set isAvailable(isAvailable: boolean) {
            if (this._query.maxSelectedItems)
                return;

            if (this._isAvailable === isAvailable)
                return;

            this.allSelected = this.inverse = false;

            const oldValue = this._isAvailable;
            this.notifyPropertyChanged("isAvailable", this._isAvailable = isAvailable, oldValue);
        }

        get allSelected(): boolean {
            return this._allSelected;
        }

        set allSelected(allSelected: boolean) {
            if (!this.isAvailable)
                return;

            if (this._allSelected === allSelected)
                return;

            const oldInverse = this._inverse;
            if (oldInverse)
                this._inverse = false;

            const oldValue = this._allSelected;
            this.notifyPropertyChanged("allSelected", this._allSelected = allSelected, oldValue);

            if (oldInverse)
                this.notifyPropertyChanged("inverse", this._inverse, oldValue);
        }

        get inverse(): boolean {
            return this._inverse;
        }

        set inverse(inverse: boolean) {
            if (!this.isAvailable)
                return;

            if (this._inverse === inverse)
                return;

            const oldValue = this._inverse;
            this.notifyPropertyChanged("inverse", this._inverse = inverse, oldValue);
        }
    }

    export class Query extends ServiceObjectWithActions {
        private _lastResult: any;
        private _asLookup: boolean;
        private _isSelectionModifying: boolean;
        private _totalItems: number;
        private _labelWithTotalItems: string;
        private _sortOptions: ISortOption[];
        private _queriedPages: Array<number> = [];
        private _filters: QueryFilters;
        private _canFilter: boolean;
        private _canRead: boolean;
        private _canReorder: boolean;
        private _charts: linqjs.Enumerable<QueryChart> = null;
        private _defaultChartName: string = null;
        private _currentChart: QueryChart = null;
        private _lastUpdated: Date;
        private _totalItem: QueryResultItem;
        private _isSystem: boolean;
        private _isFiltering: boolean;
        private _columnObservers: Common.ISubjectDisposer[];

        persistentObject: PersistentObject;
        columns: QueryColumn[];
        id: string;
        name: string;
        autoQuery: boolean;
        isHidden: boolean;
        hasSearched: boolean;
        label: string;
        singularLabel: string;
        offset: number;
        textSearch: string;
        pageSize: number;
        skip: number;
        top: number;
        items: QueryResultItem[];
        groupingInfo: {
            groupedBy: string;
            type: string;
            groups: {
                name: string;
                start: number;
                count: number;
                end: number;
            }[];
        };
        selectAll: IQuerySelectAll;

        constructor(service: Service, query: any, public parent?: PersistentObject, asLookup: boolean = false, public maxSelectedItems?: number) {
            super(service, query._actionNames || query.actions);

            this._asLookup = asLookup;
            this._isSystem = !!query.isSystem;
            this.id = query.id;
            this.name = query.name;
            this.autoQuery = query.autoQuery;
            if (!this.autoQuery)
                this.items = [];

            this._canRead = !!query.canRead;
            this._canReorder = !!query.canReorder && !asLookup;
            this.isHidden = query.isHidden;
            this.label = query.label;
            this.setNotification(query.notification, query.notificationType, query.notificationDuration);
            this.offset = query.offset || 0;
            this.textSearch = query.textSearch || "";
            this.pageSize = query.pageSize;
            this.skip = query.skip;
            this.top = query.top;
            this.groupingInfo = query.groupingInfo;

            this.persistentObject = query.persistentObject instanceof Vidyano.PersistentObject ? query.persistentObject : service.hooks.onConstructPersistentObject(service, query.persistentObject);
            this.singularLabel = this.persistentObject.label;

            this._updateColumns(query.columns);
            this._initializeActions();
            this.selectAll = new QuerySelectAllImpl(this, (!!query.isSystem || !!query.enableSelectAll) && !query.maxSelectedItems && this.actions.some(a => a.isVisible && a.definition.selectionRule !== ExpressionParser.alwaysTrue), this._selectAllPropertyChanged.bind(this));

            this._setTotalItems(query.totalItems);
            this._setSortOptionsFromService(query.sortOptions);

            if (query.disableBulkEdit) {
                const bulkEdit = <Action>this.actions["BulkEdit"];
                if (bulkEdit)
                    bulkEdit.selectionRule = count => count === 1;
            }

            if (!asLookup && query.filters && !(query.filters instanceof PersistentObject))
                this._filters = new QueryFilters(this, service.hooks.onConstructPersistentObject(service, query.filters));
            else
                this._filters = null;

            this._canFilter = this.actions.some(a => a.name === "Filter") && this.columns.some(c => c.canFilter);

            if (query.result)
                this._setResult(query.result);
            else {
                this.items = [];
                this._labelWithTotalItems = this.label;
                this._lastUpdated = new Date();
            }
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get filters(): QueryFilters {
            return this._filters;
        }

        get canFilter(): boolean {
            return this._canFilter;
        }

        private _setCanFilter(val: boolean) {
            if (this._canFilter === val)
                return;

            const oldValue = this._canFilter;
            this.notifyPropertyChanged("canFilter", this._canFilter = val, oldValue);
        }

        get canRead(): boolean {
            return this._canRead;
        }

        get canReorder(): boolean {
            return this._canReorder;
        }

        get charts(): linqjs.Enumerable<QueryChart> {
            return this._charts;
        }

        private _setCharts(charts: linqjs.Enumerable<QueryChart>) {
            if (this._charts && charts && !this._charts.isEmpty() && this._charts.count() === charts.count() && this._charts.orderBy(c => c.name).toArray().join("\n") === charts.orderBy(c => c.name).toArray().join("\n"))
                return;

            const oldCharts = this._charts;
            this.notifyPropertyChanged("charts", this._charts = Enumerable.from(charts).memoize(), oldCharts);

            if (charts && this.defaultChartName && !this.currentChart)
                this.currentChart = this.charts.firstOrDefault(c => c.name === this._defaultChartName);
        }

        get currentChart(): QueryChart {
            return this._currentChart;
        }

        set currentChart(currentChart: QueryChart) {
            if (this._currentChart === currentChart)
                return;

            const oldCurrentChart = this._currentChart;
            this.notifyPropertyChanged("currentChart", this._currentChart = currentChart !== undefined ? currentChart : null, oldCurrentChart);
        }

        get defaultChartName(): string {
            return this._defaultChartName;
        }

        set defaultChartName(defaultChart: string) {
            if (this._defaultChartName === defaultChart)
                return;

            const oldDefaultChart = this._defaultChartName;
            this.notifyPropertyChanged("defaultChartName", this._defaultChartName = defaultChart !== undefined ? defaultChart : null, oldDefaultChart);

            if (this.charts && defaultChart && !this.currentChart)
                this.currentChart = this.charts.firstOrDefault(c => c.name === this._defaultChartName);
        }

        get lastUpdated(): Date {
            return this._lastUpdated;
        }

        private _setLastUpdated(date: Date = new Date()) {
            if (this._lastUpdated === date)
                return;

            const oldLastUpdated = this._lastUpdated;
            this.notifyPropertyChanged("lastUpdated", this._lastUpdated = date, oldLastUpdated);
        }

        get selectedItems(): QueryResultItem[] {
            return this.items ? this.items.filter(i => i.isSelected) : [];
        }

        set selectedItems(items: QueryResultItem[]) {
            try {
                this._isSelectionModifying = true;
                items = items.filter(i => !i.ignoreSelect) || [];

                const selectedItems = this.selectedItems;
                if (selectedItems && selectedItems.length > 0)
                    selectedItems.forEach(item => item.isSelected = false);

                items.forEach(item => item.isSelected = true);
                this.notifyPropertyChanged("selectedItems", items);
            }
            finally {
                this._isSelectionModifying = false;
            }
        }

        private _selectAllPropertyChanged(selectAll: QuerySelectAllImpl, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "allSelected")
                this.selectedItems = this.selectAll.allSelected ? this.items : [];
        }

        selectRange(from: number, to: number): boolean {
            let selectionUpdated: boolean;

            try {
                this._isSelectionModifying = true;
                const itemsToSelect = this.items.slice(from, ++to);

                if (this.maxSelectedItems && Enumerable.from(this.selectedItems.concat(itemsToSelect)).distinct().count() > this.maxSelectedItems)
                    return;

                // Detect if array has gaps
                if (Object.keys(itemsToSelect).length === to - from) {
                    itemsToSelect.forEach(item => {
                        item.isSelected = true;
                    });

                    selectionUpdated = itemsToSelect.length > 0;
                    this.notifyPropertyChanged("selectedItems", this.selectedItems);
                    return true;
                }

                return false;
            }
            finally {
                this._isSelectionModifying = false;

                if (selectionUpdated)
                    this._updateSelectAll();
            }
        }

        get asLookup(): boolean {
            return this._asLookup;
        }

        get totalItems(): number {
            return this._totalItems;
        }

        get labelWithTotalItems(): string {
            return this._labelWithTotalItems;
        }

        get sortOptions(): ISortOption[] {
            return this._sortOptions;
        }

        get totalItem(): QueryResultItem {
            return this._totalItem;
        }

        private _setTotalItem(item: QueryResultItem) {
            if (this._totalItem === item)
                return;

            const oldTotalItem = this._totalItem;
            this.notifyPropertyChanged("totalItem", this._totalItem = item, oldTotalItem);
        }

        set sortOptions(options: ISortOption[]) {
            if (this._sortOptions === options)
                return;

            const oldSortOptions = this._sortOptions;
            this.notifyPropertyChanged("sortOptions", this._sortOptions = options, oldSortOptions);
        }

        async reorder(before: QueryResultItem, item: QueryResultItem, after: QueryResultItem): Promise<QueryResultItem[]> {
            if (!this.canReorder)
                throw "Unable to reorder, canReorder is set to false.";

            return await this.queueWork(async () => {
                const po = await this.service.executeAction("QueryOrder.Reorder", this.parent, this, [before, item, after]);
                this._setResult(po.queries[0]._lastResult);

                return this.items;
            });
        }

        private _setSortOptionsFromService(options: string | ISortOption[]) {
            let newSortOptions: ISortOption[];
            if (typeof options === "string") {
                if (!StringEx.isNullOrEmpty(options)) {
                    newSortOptions = [];
                    options.split(";").map(option => option.trim()).forEach(option => {
                        const optionParts = splitWithTail(option, " ", 2).map(option => option.trim());
                        const col = this.getColumn(optionParts[0]);
                        if (col) {
                            newSortOptions.push({
                                column: col,
                                direction: optionParts.length < 2 || optionParts[1].toUpperCase() === "ASC" ? SortDirection.Ascending : SortDirection.Descending
                            });
                        }
                    });
                }
            }
            else
                newSortOptions = !!options ? options.slice(0) : [];

            this.sortOptions = newSortOptions;
        }

        private _setTotalItems(items: number) {
            if (this._totalItems === items)
                return;

            const oldTotalItems = this._totalItems;
            this.notifyPropertyChanged("totalItems", this._totalItems = items, oldTotalItems);

            const oldLabelWithTotalItems = this._labelWithTotalItems;
            this._labelWithTotalItems = (this.totalItems != null ? this.totalItems + " " : "") + (this.totalItems !== 1 ? this.label : (this.singularLabel || this.persistentObject.label || this.persistentObject.type));
            this.notifyPropertyChanged("labelWithTotalItems", this._labelWithTotalItems, oldLabelWithTotalItems);
        }

        get isFiltering(): boolean {
            return this._isFiltering;
        }

        private _updateIsFiltering() {
            let isFiltering = !!Enumerable.from(this.columns).firstOrDefault(c => !!c.selectedDistincts && !!c.selectedDistincts.firstOrDefault());
            if (isFiltering === this._isFiltering)
                return;

            const oldIsFiltering = this._isFiltering;
            this.notifyPropertyChanged("isFiltering", this._isFiltering = isFiltering, oldIsFiltering);
        }

        _toServiceObject() {
            const result = this.copyProperties(["id", "isSystem", "name", "label", "pageSize", "skip", "top", "textSearch"]);
            if (this.selectAll.allSelected) {
                result["allSelected"] = true;
                if (this.selectAll.inverse)
                    result["allSelectedInversed"] = true;
            }

            result["sortOptions"] = this.sortOptions ? this.sortOptions.filter(option => option.direction !== SortDirection.None).map(option => option.column.name + (option.direction === SortDirection.Ascending ? " ASC" : " DESC")).join("; ") : "";

            if (this.persistentObject)
                result.persistentObject = this.persistentObject.toServiceObject();

            result.columns = Enumerable.from(this.columns).select(col => col._toServiceObject()).toArray();

            return result;
        }

        _setResult(result: any) {
            this._lastResult = result;

            this.pageSize = result.pageSize || 0;

            this.groupingInfo = result.groupingInfo;
            if (this.groupingInfo) {
                let start = 0;
                this.groupingInfo.groups.forEach(g => {
                    g.start = start;
                    g.end = (start = start + g.count) - 1;
                });
            }

            if (this.pageSize > 0) {
                this._setTotalItems(result.totalItems || 0);
                this._queriedPages.push(Math.floor((this.skip || 0) / this.pageSize));
            }
            else
                this._setTotalItems(result.items.length);

            this.hasSearched = true;
            this._updateColumns(result.columns);
            this._updateItems(Enumerable.from(result.items).select(item => this.service.hooks.onConstructQueryResultItem(this.service, item, this)).toArray());
            this._setSortOptionsFromService(result.sortOptions);

            this._setTotalItem(result.totalItem != null ? this.service.hooks.onConstructQueryResultItem(this.service, result.totalItem, this) : null);

            this.setNotification(result.notification, result.notificationType, result.notificationDuration);

            if ((this._charts && this._charts.count() > 0) || (result.charts && result.charts.length > 0))
                this._setCharts(Enumerable.from(result.charts).select(c => new QueryChart(this, c.label, c.name, c.options, c.type)).memoize());

            this._setLastUpdated();
        }

        getColumn(name: string): QueryColumn {
            return Enumerable.from(this.columns).firstOrDefault(c => c.name === name);
        }

        getItemsInMemory(start: number, length: number): QueryResultItem[] {
            if (!this.hasSearched)
                return null;

            if (this.totalItems >= 0) {
                if (start > this.totalItems)
                    start = this.totalItems;

                if (start + length > this.totalItems)
                    length = this.totalItems - start;
            }

            if (this.pageSize <= 0 || length === 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();

            let startPage = Math.floor(start / this.pageSize);
            let endPage = Math.floor((start + length - 1) / this.pageSize);

            while (startPage < endPage && this._queriedPages.indexOf(startPage) >= 0)
                startPage++;
            while (endPage > startPage && this._queriedPages.indexOf(endPage) >= 0)
                endPage--;

            if (startPage === endPage && this._queriedPages.indexOf(startPage) >= 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();

            return null;
        }

        async getItems(start: number, length: number = this.pageSize, skipQueue: boolean = false): Promise<QueryResultItem[]> {
            if (!this.hasSearched) {
                await this.search({ delay: 0, throwExceptions: true });
                return this.getItems(start, length);
            }

            if (this.totalItems >= 0) {
                if (start > this.totalItems)
                    start = this.totalItems;

                if (start + length > this.totalItems)
                    length = this.totalItems - start;
            }

            if (this.pageSize <= 0 || length === 0)
                return this.items.slice(start, start + length);

            let startPage = Math.floor(start / this.pageSize);
            let endPage = Math.floor((start + length - 1) / this.pageSize);

            while (startPage < endPage && this._queriedPages.indexOf(startPage) >= 0)
                startPage++;
            while (endPage > startPage && this._queriedPages.indexOf(endPage) >= 0)
                endPage--;

            if (startPage === endPage && this._queriedPages.indexOf(startPage) >= 0)
                return this.items.slice(start, start + length);

            const clonedQuery = this.clone(this._asLookup);
            clonedQuery.skip = startPage * this.pageSize;
            clonedQuery.top = (endPage - startPage + 1) * this.pageSize;

            const work = async () => {
                if (Enumerable.rangeTo(startPage, endPage).all(p => this._queriedPages.indexOf(p) >= 0))
                    return this.items.slice(start, start + length);

                try {
                    const result = await this.service.executeQuery(this.parent, clonedQuery, this._asLookup);

                    for (let p = startPage; p <= endPage; p++)
                        this._queriedPages.push(p);

                    const isChanged = this.pageSize > 0 && result.totalItems !== this.totalItems;
                    if (isChanged) {
                        // NOTE: Query has changed (items added/deleted) so remove old data
                        this._queriedPages = [];
                        for (let i = startPage; i <= endPage; i++)
                            this._queriedPages.push(i);

                        if (!this.selectAll.allSelected) {
                            /* tslint:disable:no-var-keyword */ var selectedItems = {}; /* tslint:enable:no-var-keyword */
                            this.selectedItems.forEach(i => selectedItems[i.id] = i);
                        }

                        this.items = [];
                        this._setTotalItems(result.totalItems);
                    }

                    for (let n = 0; n < clonedQuery.top && (clonedQuery.skip + n < clonedQuery.totalItems); n++) {
                        if (this.items[clonedQuery.skip + n] == null) {
                            const item = this.items[clonedQuery.skip + n] = this.service.hooks.onConstructQueryResultItem(this.service, result.items[n], this);
                            if (this.selectAll.allSelected || (selectedItems && selectedItems[item.id]))
                                (<any>item)._isSelected = true;
                        }
                    }

                    if (isChanged) {
                        const result = await this.getItems(start, length, true);
                        this.notifyPropertyChanged("items", this.items);

                        return result;
                    }

                    this._setLastUpdated();

                    return this.items.slice(start, start + length);
                }
                catch (e) {
                    this.setNotification(e);
                    throw e;
                }
            };

            return !skipQueue ? this.queueWork(work, false) : work();
        }

        search(delay?: number): Promise<QueryResultItem[]>;
        search(options: { delay?: number; throwExceptions?: boolean; }): Promise<QueryResultItem[]>;
        async search(options: { delay?: number; throwExceptions?: boolean; } = {}): Promise<QueryResultItem[]> {
            if (typeof options === "number") {
                options = { delay: options };
                console.warn(`Calling search with a single delay parameter is deprecated. Use search({delay: ${options.delay}) instead.`);
            }

            const search = () => {
                this._queriedPages = [];
                this._updateItems([], true);

                const now = new Date();
                return this.queueWork(async () => {
                    if (this._lastUpdated && this._lastUpdated > now)
                        return this.items;

                    const result = await this.service.executeQuery(this.parent, this, this._asLookup, !!options.throwExceptions);
                    if (!result)
                        return null;

                    if (!this._lastUpdated || this._lastUpdated <= now) {
                        this.hasSearched = true;
                        this._setResult(result);
                    }

                    return this.items;
                }, false);
            };

            if (options.delay > 0) {
                const now = new Date();
                await new Promise(resolve => setTimeout(resolve, options.delay));

                if (!this._lastUpdated || this._lastUpdated <= now)
                    return search();
                else
                    return this.items;
            }

            return search();
        }

        clone(asLookup: boolean = false): Query {
            return this.service.hooks.onConstructQuery(this.service, this, this.parent, asLookup);
        }

        private _updateColumns(_columns: any[] = []) {
            const oldColumns = this.columns ? this.columns.slice(0) : this.columns;
            const columns = this.columns || [];
            let columnsChanged = columns !== this.columns;

            const _columnsEnum = Enumerable.from(_columns || []);
            let i = columns.length;

            while (i--) {
                if (_columnsEnum.firstOrDefault(c => columns[i].name === c.name) == null) {
                    let column = columns.splice(i, 1)[0];
                    columns[column.name] = undefined;
                    columnsChanged = true;
                }
            }
            _columns.forEach(c => {
                if (!columns[c.name]) {
                    columns.push(columns[c.name] = this.service.hooks.onConstructQueryColumn(this.service, c, this));
                    columnsChanged = true;
                }
            });

            columns.sort((c1, c2) => c1.offset - c2.offset);

            columns.forEach(c => {
                if (c.distincts)
                    c.distincts.isDirty = true;
            });

            if (columnsChanged) {
                if (this.columns !== columns)
                    this.columns = columns;

                this.notifyPropertyChanged("columns", this.columns, oldColumns);
                if (this._columnObservers)
                    this._columnObservers.forEach(c => c());

                this._columnObservers = this.columns.map(c => c.propertyChanged.attach(this._queryColumnPropertyChanged.bind(this)));
                this._updateIsFiltering();
            }

            this._setCanFilter(this.actions.some(a => a.name === "Filter") && this.columns.some(c => c.canFilter));
        }

        private _queryColumnPropertyChanged(sender: Vidyano.QueryColumn, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "selectedDistincts")
                this._updateIsFiltering();
        }

        private _updateItems(items: QueryResultItem[], reset: boolean = false) {
            if (reset) {
                this.hasSearched = false;
                this._setTotalItems(null);
            }

            this.selectAll.inverse = this.selectAll.allSelected = false;

            const oldItems = this.items;
            this.notifyPropertyChanged("items", this.items = items, oldItems);
            this.selectedItems = this.selectedItems;
        }

        _notifyItemSelectionChanged(item: QueryResultItem) {
            if (this._isSelectionModifying)
                return;

            let selectedItems = this.selectedItems;
            if (this.maxSelectedItems && selectedItems.length > this.maxSelectedItems) {
                try {
                    this._isSelectionModifying = true;
                    selectedItems.filter(i => i !== item && selectedItems.length > this.maxSelectedItems).forEach(i => i.isSelected = false);
                    selectedItems = this.selectedItems;
                } finally {
                    this._isSelectionModifying = false;
                }
            }

            this._updateSelectAll(item, selectedItems);

            this.notifyPropertyChanged("selectedItems", selectedItems);
        }

        private _updateSelectAll(item?: QueryResultItem, selectedItems: QueryResultItem[] = this.selectedItems) {
            if (this.selectAll.isAvailable) {
                if (this.selectAll.allSelected) {
                    if (selectedItems.length > 0)
                        this.selectAll.inverse = selectedItems.length !== this.items.filter(i => !i.ignoreSelect).length;
                    else
                        this.selectAll.allSelected = this.selectAll.inverse = false;
                }
                else if (selectedItems.length === this.totalItems)
                    this.selectAll.allSelected = true;
            }
        }

        static FromJsonData(service: Service, data: IJsonQueryData): Query {
            const query = {
                actions: [],
                allowTextSearch: false,
                autoQuery: true,
                canRead: false,
                columns: data.columns,
                disableBulkEdit: true,
                filters: {},
                id: data.id || Unique.get(),
                label: data.label,
                name: data.name || data.label,
                persistentObject: { label: data.singularLabel },
                result: data
            };

            return new Query(service, query);
        }
    }

    export interface IJsonQueryData {
        id?: string;
        name?: string;
        label?: string;
        singularLabel?: string;

        items: {
            id: string | number;
            breadcrumb?: string;
            typeHints?: { [name: string]: string };
            values: {
                key: string;
                value: string;
                typeHints?: { [name: string]: string };
            }[];
        }[];

        columns: {
            name: string;
            label: string;
            type: string;
            width?: string;
            typeHints?: { [name: string]: string };
        }[];
    }
}