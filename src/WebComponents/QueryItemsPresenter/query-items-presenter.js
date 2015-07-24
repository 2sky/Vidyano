var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var QueryItemsPresenter = (function (_super) {
            __extends(QueryItemsPresenter, _super);
            function QueryItemsPresenter() {
                _super.apply(this, arguments);
            }
            QueryItemsPresenter.prototype._queryChanged = function (query, oldQuery) {
                var _this = this;
                if (this._content) {
                    Polymer.dom(this).removeChild(this._content);
                    this._content = null;
                }
                if (query) {
                    var child;
                    //! TODO Custom templates for queries
                    //var queryTemplateName = "QUERY." + this.query.name;
                    //if (Vidyano.WebComponents.Resource.Exists(queryTemplateName)) {
                    //    var resource = new Vidyano.WebComponents.Resource();
                    //    resource.source = queryTemplateName;
                    //    this.appendChild(resource);
                    //}
                    //else {
                    if (!Vidyano.WebComponents.QueryItemsPresenter._queryGridComponentLoader) {
                        Vidyano.WebComponents.QueryItemsPresenter._queryGridComponentLoader = new Promise(function (resolve) {
                            _this.importHref(_this.resolveUrl("../QueryGrid/query-grid.html"), function (e) {
                                resolve(true);
                            }, function (err) {
                                console.error(err);
                                resolve(false);
                            });
                        });
                    }
                    this._renderGrid(query);
                }
            };
            QueryItemsPresenter.prototype._renderGrid = function (query) {
                var _this = this;
                Vidyano.WebComponents.QueryItemsPresenter._queryGridComponentLoader.then(function () {
                    if (query !== _this.query)
                        return;
                    var grid = new Vidyano.WebComponents.QueryGrid();
                    grid.query = _this.query;
                    Polymer.dom(_this).appendChild(_this._content = grid);
                });
            };
            QueryItemsPresenter.prototype._refresh = function () {
                if (this.query)
                    this.query.search();
            };
            QueryItemsPresenter.prototype._new = function () {
                if (!this.query)
                    return;
                var action = this.query.actions["New"];
                if (action)
                    action.execute();
            };
            QueryItemsPresenter.prototype._delete = function () {
                if (!this.query)
                    return;
                var action = this.query.actions["Delete"];
                if (action)
                    action.execute();
            };
            QueryItemsPresenter.prototype._bulkEdit = function () {
                if (!this.query)
                    return;
                var action = this.query.actions["BulkEdit"];
                if (action)
                    action.execute();
            };
            return QueryItemsPresenter;
        })(WebComponents.WebComponent);
        WebComponents.QueryItemsPresenter = QueryItemsPresenter;
        WebComponents.WebComponent.register(QueryItemsPresenter, WebComponents, "vi", {
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
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
