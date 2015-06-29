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
        var Query = (function (_super) {
            __extends(Query, _super);
            function Query() {
                _super.apply(this, arguments);
            }
            Query.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._queryChanged();
            };
            Query.prototype._queryChanged = function () {
                if (this.query && this.isAttached) {
                    this._cacheEntry = this.app.cache(new WebComponents.QueryAppCacheEntry(this.query.id));
                    this._cacheEntry.query = this.query;
                }
                else
                    this._cacheEntry = null;
            };
            Query.prototype._computeNoActions = function (actions) {
                return actions && actions.filter(function (a) { return a.isVisible; }).length == 0 && actions["Filter"] == null;
            };
            Query.prototype._computeSearchOnHeader = function (noActions, query) {
                return noActions && query && query.actions["Filter"] != null;
            };
            return Query;
        })(WebComponents.WebComponent);
        WebComponents.Query = Query;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Query, Vidyano.WebComponents, "vi", {
            properties: {
                query: {
                    type: Object,
                    observer: "_queryChanged"
                },
                loading: {
                    type: Boolean,
                    value: true,
                    readOnly: true,
                    reflectToAttribute: true
                },
                noActions: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_computeNoActions(query.actions)"
                }
            },
            forwardObservers: [
                "query.labelWithTotalItems"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
