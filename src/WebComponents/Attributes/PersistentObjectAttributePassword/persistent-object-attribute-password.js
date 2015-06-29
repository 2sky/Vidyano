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
        var Attributes;
        (function (Attributes) {
            var PersistentObjectAttributePassword = (function (_super) {
                __extends(PersistentObjectAttributePassword, _super);
                function PersistentObjectAttributePassword() {
                    _super.apply(this, arguments);
                }
                return PersistentObjectAttributePassword;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributePassword = PersistentObjectAttributePassword;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributePassword);
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
