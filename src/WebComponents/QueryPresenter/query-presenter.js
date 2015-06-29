var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var QueryPresenter = (function (_super) {
            __extends(QueryPresenter, _super);
            function QueryPresenter() {
                _super.apply(this, arguments);
            }
            QueryPresenter.prototype._activating = function (e, detail) {
                this._setApp(detail.route.app);
                this._cacheEntry = this.app.cache(new WebComponents.QueryAppCacheEntry(detail.parameters.id));
                if (this._cacheEntry && this._cacheEntry.query)
                    this.query = this._cacheEntry.query;
                else {
                    this.queryId = this.query = undefined;
                    this.queryId = detail.parameters.id;
                }
            };
            QueryPresenter.prototype._computeQuery = function () {
                var _this = this;
                if (this.query && this.query.id == this.queryId)
                    return;
                if (this.queryId) {
                    if (this.query)
                        this.query = null;
                    this._setLoading(true);
                    this.app.service.getQuery(this.queryId).then(function (query) {
                        if (query.id == _this.queryId) {
                            _this._cacheEntry = _this.app.cache(new WebComponents.QueryAppCacheEntry(query.id));
                            _this.query = _this._cacheEntry.query = query;
                        }
                        _this._setLoading(false);
                    }, function (e) {
                        _this._setLoading(false);
                    });
                }
                else
                    this.query = null;
            };
            QueryPresenter.prototype._queryChanged = function (newQuery, oldQuery) {
                if (oldQuery)
                    this.empty();
                if (this.query) {
                    var query = new Vidyano.WebComponents.Query();
                    query.query = this.query;
                    Polymer.dom(this).appendChild(query);
                }
            };
            return QueryPresenter;
        })(WebComponents.WebComponent);
        WebComponents.QueryPresenter = QueryPresenter;
        WebComponents.WebComponent.register(QueryPresenter, WebComponents, "vi", {
            properties: {
                queryId: {
                    type: String,
                    observer: "_computeQuery",
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
            listeners: {
                "activating": "_activating"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
