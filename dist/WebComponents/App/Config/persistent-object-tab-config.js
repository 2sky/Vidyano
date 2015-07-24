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
        var PersistentObjectTabConfig = (function (_super) {
            __extends(PersistentObjectTabConfig, _super);
            function PersistentObjectTabConfig() {
                _super.apply(this, arguments);
            }
            PersistentObjectTabConfig.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._setTemplate(Polymer.dom(this).querySelector("template"));
            };
            return PersistentObjectTabConfig;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectTabConfig = PersistentObjectTabConfig;
        WebComponents.WebComponent.register(PersistentObjectTabConfig, WebComponents, "vi", {
            properties: {
                name: String,
                type: String,
                objectId: String,
                template: {
                    type: Object,
                    readOnly: true
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
