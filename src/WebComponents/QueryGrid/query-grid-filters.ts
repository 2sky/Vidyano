module Vidyano.WebComponents {
    class QueryFilterManager {
        private _filters: QueryFilter[];
        private _names: string[];
        private _current: QueryFilter;

        constructor(private _query: Vidyano.Query) {
            this._filters = JSON.parse(this._query.service.application.userSettings["Filters_" + this._query.id] || "[]").map(f => new QueryFilter(f));
            this._names = this._filters.map(f => f.header);

            this._current = Enumerable.from(this._filters).firstOrDefault(f => f.isDefault);
        }

        get current(): QueryFilter {
            return this._current;
        }

        get names(): string[] {
            return this._names;
        }
    }

    class QueryFilter implements QueryFilter {
        columns: {
            name: string;
            includes?: string[];
            excludes?: string[];
        }[];
        header: string;
        isDefault: boolean;
        autoOpen: boolean;

        constructor(setting?: QueryFilter) {
            if (setting) {
                this.columns = setting.columns;
                this.header = setting.header;
                this.isDefault = setting.isDefault;
                this.autoOpen = setting.autoOpen;
            }
        }
    }

    export class QueryGridFilters extends WebComponent {
        private _dialog: DialogInstance;
        filters: QueryFilter[];
        current: QueryFilter;

        private _saveAsNew() {
            var dialog = <Dialog><any>this.$["saveAsNewDialog"];
            this._dialog = dialog.show();
        }


        private _ok() {
            this._dialog.resolve(true);
        }

        private _cancel() {
            this._dialog.reject(false);
        }

        private _computeFilters(query: Vidyano.Query): QueryFilter[] {
            if (!query)
                return [];

            return JSON.parse(query.service.application.userSettings["Filters_" + query.id] || "[]").map(f => new QueryFilter(f));
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridFilters, Vidyano.WebComponents, "vi", {
        properties: {
            query: Object,
            filters: {
                type: Array,
                computed: "_computeFilters(query)"
            }
        }
    });
}