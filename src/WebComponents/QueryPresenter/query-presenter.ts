module Vidyano.WebComponents {
    export class QueryPresenter extends WebComponent {
        private static _queryComponentLoader: Promise<any>;
        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;
        private _template: HTMLElement;
        private _cacheEntry: QueryAppCacheEntry;
        queryId: string;
        query: Vidyano.Query;

        private _setLoading: (loading: boolean) => void;
        private _setError: (error: string) => void;

        attached() {
            super.attached();

            this._template = <HTMLElement>Polymer.dom(this).querySelector("template");
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

        private _computeQuery() {
            if (this.query && this.query.id == this.queryId)
                return;

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
            if (oldQuery)
                this.empty();

            if (query) {
                if (!this._template) {
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
                    if (!this._templatePresenter)
                        this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(this._template, "query");

                    this._templatePresenter.dataContext = query;

                    if (!this._templatePresenter.isAttached)
                        Polymer.dom(this).appendChild(this._templatePresenter);
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

    WebComponent.register(QueryPresenter, WebComponents, "vi", {
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
    });
}