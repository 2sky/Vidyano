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
        var QueryPresenter = (function (_super) {
            __extends(QueryPresenter, _super);
            function QueryPresenter() {
                _super.apply(this, arguments);
            }
            QueryPresenter.prototype.attached = function () {
                if (!this._customTemplate) {
                    this._customTemplate = Polymer.dom(this).querySelector("template");
                    if (this._customTemplate)
                        this._customTemplate = this._customTemplate.cloneNode(true);
                }
                _super.prototype.attached.call(this);
            };
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
            QueryPresenter.prototype._computeHasError = function (error) {
                return !StringEx.isNullOrEmpty(error);
            };
            QueryPresenter.prototype._computeQuery = function (queryId, isAttached) {
                var _this = this;
                if (this.query && queryId && this.query.id.toUpperCase() == queryId.toUpperCase())
                    return;
                if (isAttached && !this._customTemplate)
                    this.empty();
                if (this.queryId) {
                    if (this.query)
                        this.query = null;
                    this._setLoading(true);
                    this.app.service.getQuery(this.queryId).then(function (query) {
                        if (query.id.toUpperCase() == _this.queryId.toUpperCase()) {
                            _this._cacheEntry = _this.app.cache(new WebComponents.QueryAppCacheEntry(query.id));
                            _this.query = _this._cacheEntry.query = query;
                        }
                        _this._setLoading(false);
                    }, function (e) {
                        _this._setError(e);
                        _this._setLoading(false);
                    });
                }
                else
                    this.query = null;
            };
            QueryPresenter.prototype._queryChanged = function (query, oldQuery) {
                var _this = this;
                if (query) {
                    if (!this._customTemplate) {
                        if (!Vidyano.WebComponents.QueryPresenter._queryComponentLoader) {
                            Vidyano.WebComponents.QueryPresenter._queryComponentLoader = new Promise(function (resolve) {
                                _this.importHref(_this.resolveUrl("../Query/query.html"), function (e) {
                                    resolve(true);
                                }, function (err) {
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
            };
            QueryPresenter.prototype._renderQuery = function (query) {
                var _this = this;
                Vidyano.WebComponents.QueryPresenter._queryComponentLoader.then(function () {
                    if (query !== _this.query)
                        return;
                    var queryComponent = new Vidyano.WebComponents.Query();
                    queryComponent.query = query;
                    Polymer.dom(_this).appendChild(queryComponent);
                    _this._setLoading(false);
                });
            };
            return QueryPresenter;
        })(WebComponents.WebComponent);
        WebComponents.QueryPresenter = QueryPresenter;
        WebComponents.WebComponent.register(QueryPresenter, WebComponents, "vi", {
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
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
