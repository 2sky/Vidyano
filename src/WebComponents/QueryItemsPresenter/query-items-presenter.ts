module Vidyano.WebComponents {
    export class QueryItemsPresenter extends WebComponent {
        private static _queryGridComponentLoader: Promise<any>;
        query: Vidyano.Query;

        private _queryChanged(query: Vidyano.Query, oldQuery: Vidyano.Query) {
            if (oldQuery)
                this.empty();

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
                this.appendChild(grid);
            });
        }
    }

    WebComponent.register(QueryItemsPresenter, WebComponents, "vi", {
        properties: {
            query: {
                type: Object,
                observer: "_queryChanged"
            }
        }
    });
}