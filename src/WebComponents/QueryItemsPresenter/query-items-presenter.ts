namespace Vidyano.WebComponents {
    "use strict";

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
            },
            fileDrop: {
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
        ],
        listeners: {
            "file-dropped": "_onFileDropped"
        }
    })
    export class QueryItemsPresenter extends WebComponent {
        private static _queryGridComponentLoader: Promise<any>;
        private static _chartComponentLoader: Promise<any>;
        private _renderedQuery: Vidyano.Query;
        query: Vidyano.Query;
        templated: boolean;
        fileDrop: boolean;

        private _setLoading: (loading: boolean) => void;
        private _setTemplated: (templated: boolean) => void;
        private _setFileDrop: (fileDrop: boolean) => void;

        private _renderQuery(query: Vidyano.Query, currentChart: Vidyano.QueryChart, isAttached: boolean) {
            if (!isAttached)
                return;

            this.empty();
            this._renderedQuery = null;

            if (!query) {
                this._setFileDrop(false);
                this._setTemplated(false);

                return;
            }

            this._setLoading(true);

            const config = this.app.configuration.getQueryConfig(query);

            this._setFileDrop(!!config && !!config.fileDropAttribute && query.actions["New"]);
            this._setTemplated(!!config && config.hasTemplate);

            if (this.templated) {
                if (this._renderedQuery !== query) {
                    Polymer.dom(this).appendChild(config.stamp(query, config.as || "query"));
                    this._renderedQuery = query;
                }

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
                        if (query !== this.query || this._renderedQuery === query || !!query.currentChart)
                            return;

                        const grid = new Vidyano.WebComponents.QueryGrid();
                        this._renderedQuery = grid.query = this.query;
                        Polymer.dom(this).appendChild(grid);

                        this._setLoading(false);
                    });
                }
                else {
                    const chartConfig = this.app.configuration.getQueryChartConfig(currentChart.type);
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
                        if (query !== this.query || this._renderedQuery === query)
                            return;

                        this._renderedQuery = query;

                        Polymer.dom(this).appendChild(chartConfig.stamp(currentChart, chartConfig.as || "chart"));
                        this._setLoading(false);
                    });
                }
            }
        }

        private _onFileDropped(e: CustomEvent, details: IFileDropDetails) {
            if (!this.fileDrop)
                return;

            (<AppServiceHooks>this.app.service.hooks).onQueryFileDrop(this.query, details.name, details.contents);
        }

        private _refresh() {
            if (this.query)
                this.query.search();
        }

        private _new() {
            if (!this.query)
                return;

            const action = <Vidyano.Action>this.query.actions["New"];
            if (action)
                action.execute();
        }

        private _delete() {
            if (!this.query)
                return;

            const action = <Vidyano.Action>this.query.actions["Delete"];
            if (action)
                action.execute();
        }

        private _bulkEdit() {
            if (!this.query)
                return;

            const action = <Vidyano.Action>this.query.actions["BulkEdit"];
            if (action)
                action.execute();
        }
    }
}