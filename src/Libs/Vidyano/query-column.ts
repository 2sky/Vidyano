namespace Vidyano {
    export interface IQueryColumnDistincts {
        matching: string[];
        remaining: string[];
        isDirty: boolean;
        hasMore: boolean;
    }

    export interface IServiceQueryColumn {
        isSensitive?: boolean;
    }

    export class QueryColumn extends ServiceObject {
        private _id: string;
        private _displayAttribute: string;
        private _sortDirection: SortDirection;
        private _canSort: boolean;
        private _canGroupBy: boolean;
        private _canFilter: boolean;
        private _canListDistincts: boolean;
        private _isSensitive: boolean;
        private _name: string;
        private _type: string;
        private _label: string;
        private _distincts: IQueryColumnDistincts;
        private _selectedDistincts: string[];
        private _selectedDistinctsInversed: boolean;
        private _total: QueryResultItemValue;

        offset: number;
        isPinned: boolean;
        isHidden: boolean;
        width: string;
        typeHints: any;

        constructor(service: Service, col: IServiceQueryColumn, query: Query);
        constructor(service: Service, col: any, public query: Query) {
            super(service);

            this._id = col.id;
            this._canSort = !!col.canSort;
            this._canGroupBy = !!col.canGroupBy;
            this._canFilter = !!col.canFilter;
            this._canListDistincts = !!col.canListDistincts;
            this._displayAttribute = col.displayAttribute;
            this._isSensitive = !!col.isSensitive;
            if (col instanceof QueryColumn) {
                this._selectedDistincts = col._selectedDistincts;
                this._selectedDistinctsInversed = col._selectedDistinctsInversed;
            }
            else {
                this._selectedDistincts = col.includes || col.excludes || [];
                this._selectedDistinctsInversed = !!col.excludes && col.excludes.length > 0;
            }
            this._label = col.label;
            this._name = col.name;
            this.offset = col.offset || 0;
            this._type = col.type;
            this.isPinned = !!col.isPinned;
            this.isHidden = !!col.isHidden;
            this.width = col.width;
            this.typeHints = col.typeHints;
            this._sortDirection = SortDirection.None;

            query.propertyChanged.attach(this._queryPropertyChanged.bind(this));
        }

        get id(): string {
            return this._id;
        }

        get name(): string {
            return this._name;
        }

        get type(): string {
            return this._type;
        }

        get label(): string {
            return this._label;
        }

        get canFilter(): boolean {
            return this._canFilter;
        }

        get canSort(): boolean {
            return this._canSort;
        }

        get canGroupBy(): boolean {
            return this._canGroupBy;
        }

        get canListDistincts(): boolean {
            return this._canListDistincts;
        }

        get displayAttribute(): string {
            return this._displayAttribute;
        }

        get isSensitive(): boolean {
            return this._isSensitive;
        }

        get isSorting(): boolean {
            return this._sortDirection !== SortDirection.None;
        }

        get sortDirection(): SortDirection {
            return this._sortDirection;
        }

        get selectedDistincts(): string[] {
            return this._selectedDistincts;
        }

        set selectedDistincts(selectedDistincts: string[]) {
            const oldSelectedIncludes = this._selectedDistincts;

            this.notifyPropertyChanged("selectedDistincts", this._selectedDistincts = (selectedDistincts || []), oldSelectedIncludes);
            this.query.columns.forEach(c => {
                if (c === this)
                    return;

                if (c.distincts)
                    c.distincts.isDirty = true;
            });
        }

        get selectedDistinctsInversed(): boolean {
            return this._selectedDistinctsInversed;
        }

        set selectedDistinctsInversed(selectedDistinctsInversed: boolean) {
            const oldSelectedDistinctsInversed = this._selectedDistinctsInversed;

            this.notifyPropertyChanged("selectedDistinctsInversed", this._selectedDistinctsInversed = selectedDistinctsInversed, oldSelectedDistinctsInversed);
        }

        get distincts(): IQueryColumnDistincts {
            return this._distincts;
        }

        set distincts(distincts: IQueryColumnDistincts) {
            const oldDistincts = this._distincts;

            this.notifyPropertyChanged("distincts", this._distincts = distincts, oldDistincts);
        }

        get total(): QueryResultItemValue {
            return this._total;
        }

        private _setTotal(total: QueryResultItemValue) {
            const oldTotal = this._total;

            this.notifyPropertyChanged("total", this._total = total, oldTotal);
        }

        private _setSortDirection(direction: SortDirection) {
            if (this._sortDirection === direction)
                return;

            const oldSortDirection = this._sortDirection;
            this.notifyPropertyChanged("sortDirection", this._sortDirection = direction, oldSortDirection);
        }

        _toServiceObject() {
            const serviceObject = this.copyProperties(["id", "name", "label", "type", "displayAttribute"]);
            serviceObject.includes = !this.selectedDistinctsInversed ? this.selectedDistincts : [];
            serviceObject.excludes = this.selectedDistinctsInversed ? this.selectedDistincts : [];

            return serviceObject;
        }

        getTypeHint(name: string, defaultValue?: string, typeHints?: any, ignoreCasing?: boolean): string {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        }

        async refreshDistincts(search?: string): Promise<IQueryColumnDistincts> {
            const parameters: any = { ColumnName: this.name, AsLookup: this.query.asLookup };
            if (search)
                parameters.Search = search;

            let result: PersistentObject;
            try {
                result = await this.service.executeAction("QueryFilter.RefreshColumn", this.query.parent, this.query.clone(), null, parameters);
            }
            catch (e) {
                return this.distincts;
            }

            this.query.columns.filter(q => q !== this).forEach(col => {
                if (col.distincts)
                    col.distincts.isDirty = true;
            });

            const matchingDistinctsAttr = result.attributes["MatchingDistincts"];
            const remainingDistinctsAttr = result.attributes["RemainingDistincts"];

            this.distincts = {
                matching: <string[]>matchingDistinctsAttr.options,
                remaining: <string[]>remainingDistinctsAttr.options,
                isDirty: false,
                hasMore: matchingDistinctsAttr.typeHints.hasmore || remainingDistinctsAttr.typeHints.hasmore
            };

            return this.distincts;
        }

        async sort(direction: SortDirection, multiSort?: boolean): Promise<QueryResultItem[]> {
            if (!!multiSort) {
                const sortOption = this.query.sortOptions.filter(option => option.column === this)[0];
                if (sortOption && sortOption.direction === direction)
                    return;

                if (!sortOption) {
                    if (direction !== SortDirection.None)
                        this.query.sortOptions = this.query.sortOptions.concat([{ column: this, name: this.name, direction: direction }]);
                }
                else {
                    if (direction !== SortDirection.None) {
                        sortOption.direction = direction;
                        this.query.sortOptions = this.query.sortOptions.slice();
                    }
                    else
                        this.query.sortOptions = this.query.sortOptions.filter(option => option !== sortOption);
                }
            } else
                this.query.sortOptions = direction !== SortDirection.None ? [{ column: this, name: this.name, direction: direction }] : [];

            try {
                await this.query.search({ throwExceptions: true });
            }
            catch (e) {
                return this.query.items;
            }

            const querySettings = (this.service.application.userSettings["QuerySettings"] || (this.service.application.userSettings["QuerySettings"] = {}))[this.query.id] || {};
            querySettings["sortOptions"] = this.query.sortOptions.filter(option => option.direction !== SortDirection.None).map(option => option.name + (option.direction === SortDirection.Ascending ? " ASC" : " DESC")).join("; ");

            this.service.application.userSettings["QuerySettings"][this.query.id] = querySettings;
            await this.service.application.saveUserSettings();

            return this.query.items;
        }

        private _queryPropertyChanged(sender: Vidyano.Query, args: Vidyano.Common.PropertyChangedArgs) {
            if (args.propertyName === "sortOptions") {
                const sortOption = this.query.sortOptions ? this.query.sortOptions.filter(option => option.column === this)[0] : null;
                this._setSortDirection(sortOption ? sortOption.direction : SortDirection.None);
            } else if (args.propertyName === "totalItem")
                this._setTotal(sender.totalItem ? sender.totalItem.getFullValue(this.name) : null);
        }
    }
}