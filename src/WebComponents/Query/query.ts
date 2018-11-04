namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
            },
            noActions: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeNoActions(query.actions)"
            },
            label: {
                type: String,
                computed: "_computeLabel(query.labelWithTotalItems, currentFilter)"
            },
            currentFilter: {
                type: Object,
                computed: "query.filters.currentFilter",
                value: null
            },
            hideHeader: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHideHeader(query, app)"
            },
            preview: {
                type: Object,
                readOnly: true
            }
        },
        forwardObservers: [
            "query.isBusy",
            "query.labelWithTotalItems",
            "query.filters.currentFilter.name"
        ]
    })
    export class Query extends WebComponent {
        private _cacheEntry: QueryAppCacheEntry;
        readonly preview: Vidyano.PersistentObject; private _setPreview: (preview: Vidyano.PersistentObject) => void;
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
            return actions && actions.filter(a => a.isVisible).length === 0 && actions["Filter"] == null;
        }

        private _computeSearchOnHeader(noActions: boolean, query: Vidyano.Query): boolean {
            return noActions && query && query.actions["Filter"] != null;
        }

        private _computeLabel(labelWithTotalItems: string, currentFilter: Vidyano.QueryFilter): string {
            return labelWithTotalItems + (currentFilter && currentFilter.name ? " — " + currentFilter.name : "");
        }

        private _computeHideHeader(query: Vidyano.Query, app: Vidyano.WebComponents.App): boolean {
            if (!query || !app)
                return false;

            const config = app.configuration.getQueryConfig(query);
            return !!config && !!config.hideHeader;
        }

        private _open(e: CustomEvent, item: Vidyano.QueryResultItem) {
            e.stopPropagation();

            const panel = <PersistentObjectSlideInPanel>this.$.preview;
            panel.persistentObjectLoader = item.getPersistentObject();
        }

        private _close(e: CustomEvent) {
            e.stopPropagation();

            const panel = <PersistentObjectSlideInPanel>this.$.preview;
            panel.open = false;

            setTimeout(() => {
                if (panel.persistentObjectLoader)
                    return;

                panel.persistentObject = panel.persistentObjectLoader = null;
            }, 300);
        }
    }
}