module Vidyano.WebComponents {
    export class QueryItemsPresenter extends WebComponent {
        private static _queryGridComponentLoader: Promise<any>;
        private _content: HTMLElement | WebComponent;
        query: Vidyano.Query;

        private _queryChanged(query: Vidyano.Query, oldQuery: Vidyano.Query) {
            if (this._content) {
                Polymer.dom(this).removeChild(this._content);
                this._content = null;
            }

            if (query) {
                var child: HTMLElement;

                //! TODO Custom templates for queries
                //var queryTemplateName = "QUERY." + this.query.name;
                //if (Vidyano.WebComponents.Resource.Exists(queryTemplateName)) {
                //    var resource = new Vidyano.WebComponents.Resource();
                //    resource.source = queryTemplateName;
                //    this.appendChild(resource);
                //}
                //else {
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

                this._renderGrid(query);
                //}
            }
        }

        private _renderGrid(query: Vidyano.Query) {
            Vidyano.WebComponents.QueryItemsPresenter._queryGridComponentLoader.then(() => {
                if (query !== this.query)
                    return;

                var grid = new Vidyano.WebComponents.QueryGrid();
                grid.query = this.query;
                Polymer.dom(this).appendChild(this._content = grid);
            });
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

    WebComponent.register(QueryItemsPresenter, WebComponents, "vi", {
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
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
        }
    });
}