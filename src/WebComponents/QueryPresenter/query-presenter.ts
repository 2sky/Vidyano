module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            queryId: {
                type: String,
                reflectToAttribute: true
            },
            query: {
                type: Object,
                observer: "_queryChanged"
            },
            loading: {
                type: Boolean,
                readOnly: true,
                value: true,
                reflectToAttribute: true
            },
            error: {
                type: String,
                readOnly: true
            },
            hasError: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasError(error)"
            }
        },
        observers: [
            "_computeQuery(queryId, isAttached)"
        ],
        listeners: {
            "activating": "_activating"
        }
    })
    export class QueryPresenter extends WebComponent {
        private static _queryComponentLoader: Promise<any>;
        private _customTemplatePresenter: Vidyano.WebComponents.TemplatePresenter;
        private _customTemplate: HTMLElement;
        private _cacheEntry: QueryAppCacheEntry;
        queryId: string;
        query: Vidyano.Query;

        private _setLoading: (loading: boolean) => void;
        private _setError: (error: string) => void;

        attached() {
            if (!this._customTemplate) {
                this._customTemplate = <HTMLElement>Polymer.dom(this).querySelector("template");
                if (this._customTemplate)
                    this._customTemplate = <HTMLElement>this._customTemplate.cloneNode(true);
            }

            super.attached();
        }

        private _activating(e: CustomEvent, detail: { route: AppRoute; parameters: any; }) {
            this._setApp(detail.route.app);

            this._cacheEntry = <QueryAppCacheEntry>this.app.cache(new QueryAppCacheEntry(detail.parameters.id));
            if (this._cacheEntry && this._cacheEntry.query)
                this.query = this._cacheEntry.query;
            else {
                this.queryId = this.query = undefined;
                this.queryId = detail.parameters.id;
            }
        }

        private _computeHasError(error: string): boolean {
            return !StringEx.isNullOrEmpty(error);
        }

        private _computeQuery(queryId: string, isAttached: boolean) {
            if (this.query && queryId && this.query.id.toUpperCase() == queryId.toUpperCase())
                return;

            if (isAttached && !this._customTemplate)
                this.empty();

            if (this.queryId) {
                if (this.query)
                    this.query = null;

                this._setLoading(true);
                this.app.service.getQuery(this.queryId).then(query => {
                    if (query.id.toUpperCase() == this.queryId.toUpperCase()) {
                        this._cacheEntry = <QueryAppCacheEntry>this.app.cache(new QueryAppCacheEntry(query.id));
                        this.query = this._cacheEntry.query = query;
                    }

                    this._setLoading(false);
                }, e => {
                    this._setError(e);
                    this._setLoading(false);
                });
            }
            else
                this.query = null;
        }

        private _queryChanged(query: Vidyano.Query, oldQuery: Vidyano.Query) {
            if (this.isAttached && oldQuery)
                this.empty();

            if (query) {
                if(this.queryId !== query.id)
                    this.queryId = query.id;

                if (!this._customTemplate) {
                    if (!Vidyano.WebComponents.QueryPresenter._queryComponentLoader) {
                        Vidyano.WebComponents.QueryPresenter._queryComponentLoader = new Promise(resolve => {
                            this.importHref(this.resolveUrl("../Query/query.html"), e => {
                                resolve(true);
                            }, err => {
                                console.error(err);
                                resolve(false);
                            });
                        });
                    }

                    this._renderQuery(query);
                }
                else {
                    if (!this._customTemplatePresenter)
                        this._customTemplatePresenter = new Vidyano.WebComponents.TemplatePresenter(this._customTemplate, "query");

                    this._customTemplatePresenter.dataContext = query;

                    if (!this._customTemplatePresenter.isAttached)
                        Polymer.dom(this).appendChild(this._customTemplatePresenter);
                }
            }
        }

        private _renderQuery(query: Vidyano.Query) {
            Vidyano.WebComponents.QueryPresenter._queryComponentLoader.then(() => {
                if (query !== this.query)
                    return;

                var queryComponent = new Vidyano.WebComponents.Query();
                queryComponent.query = query;
                Polymer.dom(this).appendChild(queryComponent);

                this._setLoading(false);
            });
        }
    }
}