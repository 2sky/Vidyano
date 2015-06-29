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
            var PersistentObjectAttributeKeyValueList = (function (_super) {
                __extends(PersistentObjectAttributeKeyValueList, _super);
                function PersistentObjectAttributeKeyValueList() {
                    _super.apply(this, arguments);
                }
                return PersistentObjectAttributeKeyValueList;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeKeyValueList = PersistentObjectAttributeKeyValueList;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeKeyValueList, {});
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
