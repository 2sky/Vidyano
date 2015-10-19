var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
            Query = __decorate([
                WebComponents.WebComponent.register({
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
                })
            ], Query);
            return Query;
        })(WebComponents.WebComponent);
        WebComponents.Query = Query;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
