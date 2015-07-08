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
        var PersistentObjectDialog = (function (_super) {
            __extends(PersistentObjectDialog, _super);
            function PersistentObjectDialog() {
                _super.apply(this, arguments);
            }
            PersistentObjectDialog.prototype.show = function (persistentObject, save) {
                this._setPersistentObject(persistentObject);
                this.persistentObject.beginEdit();
                this._saveHook = save;
                this._dialog = this.$["dialog"].show();
                return this._dialog.result;
            };
            PersistentObjectDialog.prototype._save = function () {
                var _this = this;
                (this._saveHook ? this._saveHook(this.persistentObject) : this.persistentObject.save()).then(function () {
                    _this._dialog.resolve(_this.persistentObject);
                });
            };
            PersistentObjectDialog.prototype._cancel = function () {
                this.persistentObject.cancelEdit();
                this._dialog.reject();
            };
            PersistentObjectDialog.prototype._computeTab = function (persistentObject) {
                if (!persistentObject)
                    return null;
                return Enumerable.from(persistentObject.tabs).firstOrDefault(function (tab) { return tab instanceof Vidyano.PersistentObjectAttributeTab; });
            };
            PersistentObjectDialog.prototype._onSelectAction = function (e) {
                this._dialog.resolve(parseInt(e.target.getAttribute("data-action-index"), 10));
                e.stopPropagation();
            };
            return PersistentObjectDialog;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectDialog = PersistentObjectDialog;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.PersistentObjectDialog, Vidyano.WebComponents, "vi", {
            properties: {
                persistentObject: {
                    type: Object,
                    readOnly: true
                },
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
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
