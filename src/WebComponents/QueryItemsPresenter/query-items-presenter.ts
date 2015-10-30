module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            query: Object,
            loading: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true,
                value: true
            },
            templated: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            }
        },
        hostAttributes: {
            "tabindex": "0"
        },
        keybindings: {
            "f5 ctrl+r": "_refresh",
            "ctrl+n": "_new",
            "del": "_delete",
            "f2": "_bulkEdit"
        },
        observers: [
            "_renderQuery(query, isAttached)"
        ]
    })
    export class QueryItemsPresenter extends WebComponent {
        private static _queryGridComponentLoader: Promise<any>;
        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;
        private _renderedQuery: Vidyano.Query;
        query: Vidyano.Query;
        templated: boolean;

        private _setLoading: (loading: boolean) => void;
        private _setTemplated: (templated: boolean) => void;

        private _renderQuery(query: Vidyano.Query, isAttached: boolean) {
            if (!isAttached || this._renderedQuery === query)
                return;

            this.empty();

            if (!query)
                return;

            this._setLoading(true);

            var child: HTMLElement;

            var config = this.app.configuration.getQueryConfig(query);
            this._setTemplated(!!config && !!config.template);

            if (this.templated) {
                if (!this._templatePresenter)
                    this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(config.template, "query");

                this._templatePresenter.dataContext = query;

                if (!this._templatePresenter.isAttached)
                    Polymer.dom(this).appendChild(this._templatePresenter);

                this._setLoading(false);
            }
            else {
                if (!Vidyano.WebComponents.QueryItemsPresenter._queryGridComponentLoader) {
                    Vidyano.WebComponents.QueryItemsPresenter._queryGridComponentLoader = new Promise(resolve => {
                        this.importHref(this.resolveUrl("../QueryGrid/query-grid.html"), e => {
                            resolve(true);
                        }, err => {
                                console.error(err);
                                resolve(false);
                            });
                    });
                }

                Vidyano.WebComponents.QueryItemsPresenter._queryGridComponentLoader.then(() => {
                    if (query !== this.query)
                        return;

                    var grid = new Vidyano.WebComponents.QueryGrid();
                    grid.query = this.query;
                    Polymer.dom(this).appendChild(grid);

                    this._setLoading(false);
                });
            }
        }

        private _refresh() {
            if (this.query)
                this.query.search();
        }

        private _new() {
            if (!this.query)
                return;

            var action = <Vidyano.Action>this.query.actions["New"];
            if (action)
                action.execute();
        }

        private _delete() {
            if (!this.query)
                return;

            var action = <Vidyano.Action>this.query.actions["Delete"];
            if (action)
                action.execute();
        }

        private _bulkEdit() {
            if (!this.query)
                return;

            var action = <Vidyano.Action>this.query.actions["BulkEdit"];
            if (action)
                action.execute();
        }
    }
}