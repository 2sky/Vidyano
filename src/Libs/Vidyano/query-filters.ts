namespace Vidyano {
    "use strict";

    export class QueryFilters extends Vidyano.Common.Observable<QueryFilters> {
        private _filters: QueryFilter[];
        private _currentFilter: QueryFilter;
        private _filtersAsDetail: PersistentObjectAttributeAsDetail;
        private _skipSearch: boolean;

        constructor(private _query: Query, private _filtersPO: Vidyano.PersistentObject) {
            super();

            this._filtersAsDetail = <Vidyano.PersistentObjectAttributeAsDetail>this._filtersPO.attributes["Filters"];
            this._computeFilters(true);

            const defaultFilter = Enumerable.from(this._filters).firstOrDefault(f => f.isDefault);
            if (defaultFilter) {
                this._skipSearch = true;
                try {
                    this.currentFilter = defaultFilter;
                }
                finally {
                    this._skipSearch = false;
                }
            }
        }

        get filters(): QueryFilter[] {
            return this._filters;
        }

        private _setFilters(filters: QueryFilter[]) {
            const oldFilters = this._filters;
            this.notifyPropertyChanged("filters", this._filters = filters, oldFilters);
        }

        get detailsAttribute(): PersistentObjectAttributeAsDetail {
            return this._filtersAsDetail;
        }

        get currentFilter(): QueryFilter {
            return this._currentFilter;
        }

        set currentFilter(filter: QueryFilter) {
            let doSearch;
            if (!!filter) {
                if (!filter.persistentObject.isNew) {
                    let columnsFilterData = Enumerable.from(JSON.parse(filter.persistentObject.getAttributeValue("Columns")));
                    this._query.columns.forEach(col => {
                        let columnFilterData = columnsFilterData.firstOrDefault(c => c.name === col.name);
                        if (columnFilterData) {
                            if (columnFilterData.includes && columnFilterData.includes.length > 0)
                                col.selectedDistincts = Enumerable.from(columnFilterData.includes);
                            else if (columnFilterData.excludes && columnFilterData.excludes.length > 0)
                                col.selectedDistincts = Enumerable.from(columnFilterData.excludes);
                            else
                                col.selectedDistincts = Enumerable.from([]);

                            col.selectedDistinctsInversed = columnFilterData.excludes && columnFilterData.excludes.length > 0;
                            col.distincts = null;

                            doSearch = doSearch || (col.selectedDistincts.isEmpty() === false);
                        }
                        else
                            col.selectedDistincts = Enumerable.empty<string>();
                    });
                }
            } else {
                this._query.columns.forEach(col => {
                    col.selectedDistincts = Enumerable.empty<string>();
                    col.selectedDistinctsInversed = false;
                    col.distincts = null;
                });

                doSearch = !!this._currentFilter;
            }

            const oldCurrentFilter = this._currentFilter;
            this.notifyPropertyChanged("currentFilter", this._currentFilter = filter, oldCurrentFilter);

            if (doSearch && !this._skipSearch)
                this._query.search();
        }

        private _computeFilters(setDefaultFilter?: boolean) {
            if (!this._filtersAsDetail) {
                this._setFilters([]);
                return;
            }

            const currentFilters: { [name: string]: QueryFilter; } = {};
            if (this._filters)
                this._filters.forEach(f => currentFilters[f.name || ""] = f);

            this._setFilters(this._filtersAsDetail.objects.map(filter => {
                const existing = currentFilters[filter.getAttributeValue("Name") || ""];
                if (existing) {
                    existing.persistentObject.refreshFromResult(filter);
                    return existing;
                }

                return new QueryFilter(filter);
            }));

            if (setDefaultFilter)
                this._currentFilter = Enumerable.from(this._filters).firstOrDefault(f => f.persistentObject.getAttributeValue("IsDefault"));
        }

        private _computeFilterData(): string {
            return JSON.stringify(this._query.columns.filter(c => !c.selectedDistincts.isEmpty()).map(c => {
                return {
                    name: c.name,
                    includes: !c.selectedDistinctsInversed ? c.selectedDistincts.toArray() : [],
                    excludes: c.selectedDistinctsInversed ? c.selectedDistincts.toArray() : []
                };
            }));
        }

        clone(targetQuery: Query): QueryFilters {
            return new QueryFilters(targetQuery, targetQuery.service.hooks.onConstructPersistentObject(targetQuery.service, this._filtersPO["_lastResult"]));
        }

        getFilter(name: string): QueryFilter {
            return Enumerable.from(this.filters).first(f => f.name === name);
        }

        createNew(): Promise<QueryFilter> {
            const newAction = (<Action>this._filtersAsDetail.details.actions["New"]);

            return this._query.queueWork(async () => {
                const po = await newAction.execute({ skipOpen: true });
                return new QueryFilter(po);
            });
        }

        save(filter: QueryFilter = this.currentFilter): Promise<boolean> {
            if (!filter)
                return Promise.reject<boolean>("Expected argument filter.");

            if (filter.isLocked)
                return Promise.reject<boolean>("Filter is locked.");

            if (this._filtersAsDetail.objects.some(f => f.isNew))
                return Promise.reject<boolean>("Only one new filter can be saved at a time.");

            this._filtersPO.beginEdit();

            if (filter === this.currentFilter || filter.persistentObject.isNew) {
                filter.persistentObject.beginEdit();
                filter.persistentObject.attributes["Columns"].setValue(this._computeFilterData());
            }

            if (filter.persistentObject.isNew)
                this._filtersAsDetail.objects.push(filter.persistentObject);

            return this._query.queueWork(async () => {
                let result: boolean;

                try {
                    result = await this._filtersPO.save();
                }
                catch (e) {
                    result = false;
                    filter.persistentObject.setNotification(e, "Error");
                }

                const newFilter = Enumerable.from(this._filtersAsDetail.objects).firstOrDefault(f => f.isNew);
                if (newFilter)
                    this._filtersAsDetail.objects.remove(filter.persistentObject = newFilter);

                this._computeFilters();

                if (!newFilter && filter.persistentObject.isNew)
                    this.currentFilter = Enumerable.from(this.filters).firstOrDefault(f => f.name === filter.name);

                return result;
            });
        }

        delete(name: string | QueryFilter): Promise<any> {
            const filter = typeof name === "string" ? this.getFilter(name) : name;
            if (!filter)
                return Promise.reject(`No filter found with name '${name}'.`);

            if (filter.isLocked)
                return Promise.reject("Filter is locked.");

            if (!filter.persistentObject.isNew) {
                filter.persistentObject.isDeleted = true;

                return this._query.queueWork(async () => {
                    this._filtersPO.beginEdit();

                    await this._filtersPO.save();
                    this._computeFilters();

                    return null;
                });
            }

            this._filtersAsDetail.objects.remove(filter.persistentObject);
            this._computeFilters();

            return Promise.resolve(null);
        }
    }

    export class QueryFilter extends Vidyano.Common.Observable<QueryFilter> {
        constructor(public persistentObject: PersistentObject) {
            super();
        }

        get name(): string {
            return this.persistentObject.getAttributeValue("Name") || "";
        }

        get isLocked(): boolean {
            return this.persistentObject.getAttributeValue("IsLocked");
        }

        get isDefault(): boolean {
            return this.persistentObject.getAttributeValue("IsDefault");
        }
    }
}