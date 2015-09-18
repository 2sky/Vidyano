module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
            },
            loading: {
                type: Boolean,
                value: true,
                readOnly: true,
                reflectToAttribute: true
            },
            noActions: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeNoActions(query.actions)"
            }
        },
        forwardObservers: [
            "query.labelWithTotalItems"
        ]
    })
    export class Query extends WebComponent {
        private _cacheEntry: QueryAppCacheEntry;
        query: Vidyano.Query;

        attached() {
            super.attached();

            this._queryChanged();
        }

        private _queryChanged() {
            if (this.query && this.isAttached) {
                this._cacheEntry = <QueryAppCacheEntry>this.app.cache(new QueryAppCacheEntry(this.query.id));
                this._cacheEntry.query = this.query;
            }
            else
                this._cacheEntry = null;
        }

        private _computeNoActions(actions: Vidyano.Action[]): boolean {
            return actions && actions.filter(a => a.isVisible).length == 0 && actions["Filter"] == null;
        }

        private _computeSearchOnHeader(noActions: boolean, query: Vidyano.Query): boolean {
            return noActions && query && query.actions["Filter"] != null;
        }
    }
}