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
        var QueryFilterManager = (function () {
            function QueryFilterManager(_query) {
                this._query = _query;
                this._filters = JSON.parse(this._query.service.application.userSettings["Filters_" + this._query.id] || "[]").map(function (f) { return new QueryFilter(f); });
                this._names = this._filters.map(function (f) { return f.header; });
                this._current = Enumerable.from(this._filters).firstOrDefault(function (f) { return f.isDefault; });
            }
            Object.defineProperty(QueryFilterManager.prototype, "current", {
                get: function () {
                    return this._current;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(QueryFilterManager.prototype, "names", {
                get: function () {
                    return this._names;
                },
                enumerable: true,
                configurable: true
            });
            return QueryFilterManager;
        })();
        var QueryFilter = (function () {
            function QueryFilter(setting) {
                if (setting) {
                    this.columns = setting.columns;
                    this.header = setting.header;
                    this.isDefault = setting.isDefault;
                    this.autoOpen = setting.autoOpen;
                }
            }
            return QueryFilter;
        })();
        var QueryGridFilters = (function (_super) {
            __extends(QueryGridFilters, _super);
            function QueryGridFilters() {
                _super.apply(this, arguments);
            }
            QueryGridFilters.prototype._saveAsNew = function () {
                var dialog = this.$["saveAsNewDialog"];
                this._dialog = dialog.show();
            };
            QueryGridFilters.prototype._ok = function () {
                this._dialog.resolve(true);
            };
            QueryGridFilters.prototype._cancel = function () {
                this._dialog.reject(false);
            };
            QueryGridFilters.prototype._computeFilters = function (query) {
                if (!query)
                    return [];
                return JSON.parse(query.service.application.userSettings["Filters_" + query.id] || "[]").map(function (f) { return new QueryFilter(f); });
            };
            return QueryGridFilters;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridFilters = QueryGridFilters;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.QueryGridFilters, Vidyano.WebComponents, "vi", {
            properties: {
                query: Object,
                filters: {
                    type: Array,
                    computed: "_computeFilters(query)"
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
