module Vidyano.WebComponents {
    export class QueryGridFilters extends WebComponent {
        private _dialog: WebComponents.DialogInstance;
        private _preventColumnFilterChangedListener: boolean;
        query: Vidyano.Query;
        currentFilter: string;
        filters: string[];

        private _setCurrentFilter: (filter: string) => void;
        private _setFilters: (filters: string[]) => void;
        private _setFiltering: (filtering: boolean) => void;

        private _queryChanged(query: Vidyano.Query) {
            this._setFilters(query && query.filters ? this._computeFilters(query.filters) : null);

            if (query && query.filters) {
                var filterAttr = <Vidyano.PersistentObjectAttributeAsDetail>this.query.filters.attributesByName["Filters"];
                var defaultFilter = Enumerable.from(filterAttr.objects).firstOrDefault(filter => filter.getAttributeValue("IsDefault"));
                if (defaultFilter)
                    this._setCurrentFilter(defaultFilter.getAttributeValue("Name"));
                else if (this.currentFilter)
                    this._setCurrentFilter(null);
            }
            else
                this._setCurrentFilter(null);
        }

        private _currentFilterChanged() {
            try {
                this._preventColumnFilterChangedListener = true;

                this.fire("filter-changed", null);
                this._updateFiltering();
            }
            finally {
                this._preventColumnFilterChangedListener = false;
            }
        }

        private _computeFilters(filters: Vidyano.PersistentObject): string[] {
            var filterAttr = <Vidyano.PersistentObjectAttributeAsDetail>filters.attributesByName["Filters"];
            return filterAttr.objects.map(filter => filter.getAttributeValue("Name")).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        }

        private _columnFilterChangedListener(e: Event) {
            e.stopPropagation();

            if (!this._preventColumnFilterChangedListener)
                this._updateFiltering();
        }

        private _updateFiltering() {
            this._setFiltering(this.query && this.query.columns.some(c => (c.includes && c.includes.length > 0) || (c.excludes && c.excludes.length > 0)));
        }

        private _getFilterObject(name: string): Vidyano.PersistentObject {
            var filterAttr = <Vidyano.PersistentObjectAttributeAsDetail>this.query.filters.attributesByName["Filters"];
            return Enumerable.from(filterAttr.objects).firstOrDefault(filter => filter.getAttributeValue("Name") === name);
        }

        private _getColumnsFilterData(query: Vidyano.Query): string {
            return JSON.stringify(query.columns.filter(c => (c.includes && c.includes.length > 0) || (c.excludes && c.excludes.length > 0)).map(c => {
                return {
                    name: c.name,
                    includes: c.includes,
                    excludes: c.excludes
                };
            }));
        }

        private _save() {
            this.query.filters.beginEdit();

            var filterAttr = <Vidyano.PersistentObjectAttributeAsDetail>this.query.filters.attributesByName["Filters"];
            var action = (<Action>filterAttr.details.actions["New"]);
            action.skipOpen = true;

            action.execute().then(po => {
                var dialog = <PersistentObjectDialog><any>this.$["dialog"];
                dialog.show(po, () => {
                    po.attributesByName["Columns"].setValue(this._getColumnsFilterData(this.query));
                    filterAttr.objects.push(po);
                    return this.query.filters.save().then(result => {
                        this._setFilters(this._computeFilters(this.query.filters));
                        this._setCurrentFilter(po.getAttributeValue("Name"));

                        return result;
                    });
                });
            });
        }

        private _saveCurrent() {
            this.query.filters.beginEdit();

            var po = this._getFilterObject(this.currentFilter);
            if (!po)
                return;

            po.attributesByName["Columns"].setValue(this._getColumnsFilterData(this.query));
            this.query.filters.save();
        }

        private _reset() {
            this.query.columns.forEach(col => {
                col.includes = [];
                col.excludes = [];
            });

            if (this.currentFilter === null)
                this.fire("filter-changed", null);
            else
                this._setCurrentFilter(null);

            this.query.search();
        }

        private _edit(e: Event) {
            e.stopPropagation();
            Popup.closeAll();

            var name = (<HTMLElement>e.currentTarget).getAttribute("data-filter");
            if (!name)
                return;

            var po = this._getFilterObject(name);
            if (!po)
                return;

            this.query.filters.beginEdit();

            var isCurrentFilter = po.getAttributeValue("Name") === this.currentFilter && this.currentFilter != null;

            var dialog = <PersistentObjectDialog><any>this.$["dialog"];
            po.breadcrumb = po.actions["Edit"].displayName + " '" + name + "'";

            dialog.show(po, () => {
                if (isCurrentFilter)
                    po.attributesByName["Columns"].setValue(this._getColumnsFilterData(this.query));

                return this.query.filters.save().then(result => {
                    this._setFilters(this._computeFilters(this.query.filters));

                    if (isCurrentFilter)
                        this._setCurrentFilter(po.getAttributeValue("Name"));

                    return result;
                });
            });
        }

        private _load(e: Event) {
            var name = (<HTMLElement>e.currentTarget).getAttribute("data-filter");
            if (!name)
                return;

            var po = this._getFilterObject(name);
            if (!po)
                return;

            var columnsFilterData = Enumerable.from(JSON.parse(po.getAttributeValue("Columns")));
            this.query.columns.forEach(col => {
                var columnFilterData = columnsFilterData.firstOrDefault(c => c.name === col.name);
                if (columnFilterData) {
                    col.includes = columnFilterData.includes;
                    col.excludes = columnFilterData.excludes;
                }
                else {
                    col.includes = [];
                    col.excludes = [];
                }
            });

            this.query.search();
            this._setCurrentFilter(Enumerable.from(this.filters).firstOrDefault(filter => filter === name));
        }

        private _delete(e: Event) {
            e.stopPropagation();
            Popup.closeAll();

            var name = (<HTMLElement>e.currentTarget).getAttribute("data-filter");
            if (!name)
                return;

            var filterAttr = <Vidyano.PersistentObjectAttributeAsDetail>this.query.filters.attributesByName["Filters"];
            var po = Enumerable.from(filterAttr.objects).firstOrDefault(filter => filter.getAttributeValue("Name") === name);
            if (!po)
                return;

            this.app.showMessageDialog({
                title: name,
                titleIcon: "Icon_Action_Delete",
                message: this.translateMessage("AskForDeleteFilter", name),
                actions: [this.translateMessage("Delete"), this.translateMessage("Cancel")],
                actionTypes: ["Danger"]
            }).then(result => {
                if (result === 0) {
                    this.query.filters.beginEdit();

                    po.isDeleted = true;
                    this.query.filters.save().then(() => {
                        this._setFilters(this._computeFilters(this.query.filters));
                        if (this.currentFilter && this.currentFilter === name)
                            this._setCurrentFilter(null);
                    });
                }
            });
        }

        private _ok() {
            this._dialog.resolve(true);
        }

        private _cancel() {
            this._dialog.reject(false);
        }

        private _getCurrentFilterSave(currentFilter: string): string {
            if (!currentFilter)
                return "";

            return this.translateMessage("Save") + " '" + currentFilter + "'";
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridFilters, Vidyano.WebComponents, "vi", {
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
            },
            filters: {
                type: Array,
                readOnly: true
            },
            filtering: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            currentFilter: {
                type: Object,
                readOnly: true,
                observer: "_currentFilterChanged"
            },
            editLabel: {
                type: String,
                computed: "query.filters.actions.Edit.displayName"
            }
        },
        listeners: {
            "column-filter-changed": "_columnFilterChangedListener"
        }
    });
}