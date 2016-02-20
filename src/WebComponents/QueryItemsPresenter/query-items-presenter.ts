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
            "_renderQuery(query, query.currentChart, isAttached)"
        ],
        forwardObservers: [
            "query.currentChart"
        ]
    })
    export class QueryItemsPresenter extends WebComponent {
        private static _queryGridComponentLoader: Promise<any>;
        private static _chartComponentLoader: Promise<any>;
        private _renderedQuery: Vidyano.Query;
        query: Vidyano.Query;
        templated: boolean;

        private _setLoading: (loading: boolean) => void;
        private _setTemplated: (templated: boolean) => void;

        private _renderQuery(query: Vidyano.Query, currentChart: Vidyano.QueryChart, isAttached: boolean) {
            if (!isAttached || this._renderedQuery === query)
                return;

            this.empty();

            if (!query)
                return;

            this._setLoading(true);

            var config = this.app.configuration.getQueryConfig(query);
            this._setTemplated(!!config && config.hasTemplate);

            if (this.templated) {
                Polymer.dom(this).appendChild(config.stamp(query, config.as || "query"));
                this._setLoading(false);
            }
            else {
                if (!currentChart) {
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
                else {
                    var chartConfig = this.app.configuration.getQueryChartConfig(currentChart.type);
                    if (!chartConfig) {
                        console.error(`No chart configuration found for type '${currentChart.type}'`);
                        return;
                    }

                    if (!Vidyano.WebComponents.QueryItemsPresenter._chartComponentLoader) {
                        Vidyano.WebComponents.QueryItemsPresenter._chartComponentLoader = new Promise(resolve => {
                            this.importHref(this.resolveUrl("../Chart/chart-dependencies.html"), e => {
                                resolve(true);
                            }, err => {
                                    console.error(err);
                                    resolve(false);
                                });
                        });
                    }

                    Vidyano.WebComponents.QueryItemsPresenter._chartComponentLoader.then(() => {
                        if (query !== this.query)
                            return;

                        Polymer.dom(this).appendChild(chartConfig.stamp(currentChart, chartConfig.as || "chart"));
                        this._setLoading(false);
                    });
                }
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