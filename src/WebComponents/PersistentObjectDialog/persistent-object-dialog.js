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
        var PersistentObjectDialog = (function (_super) {
            __extends(PersistentObjectDialog, _super);
            function PersistentObjectDialog(persistentObject) {
                _super.call(this);
                this.persistentObject = persistentObject;
                persistentObject.beginEdit();
            }
            PersistentObjectDialog.prototype._save = function () {
                var _this = this;
                (this._saveHook ? this._saveHook(this.persistentObject) : this.persistentObject.save()).then(function () {
                    _this.instance.resolve(_this.persistentObject);
                });
            };
            PersistentObjectDialog.prototype._cancel = function () {
                if (this.persistentObject) {
                    this.persistentObject.cancelEdit();
                    this.cancel();
                }
            };
            PersistentObjectDialog.prototype._computeTab = function (persistentObject) {
                if (!persistentObject)
                    return null;
                var tab = Enumerable.from(persistentObject.tabs).firstOrDefault(function (tab) { return tab instanceof Vidyano.PersistentObjectAttributeTab; });
                tab.columnCount = 1;
                return tab;
            };
            PersistentObjectDialog.prototype._onSelectAction = function (e) {
                this.instance.resolve(parseInt(e.target.getAttribute("data-action-index"), 10));
                e.stopPropagation();
            };
            PersistentObjectDialog = __decorate([
                WebComponents.Dialog.register({
                    properties: {
                        persistentObject: Object,
                        tab: {
                            type: Object,
                            computed: "_computeTab(persistentObject)"
                        }
                    },
                    hostAttributes: {
                        "dialog": ""
                    },
                    keybindings: {
                        "esc": {
                            listener: "_cancel",
                            priority: Number.MAX_VALUE
                        }
                    }
                })
            ], PersistentObjectDialog);
            return PersistentObjectDialog;
        })(WebComponents.Dialog);
        WebComponents.PersistentObjectDialog = PersistentObjectDialog;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
