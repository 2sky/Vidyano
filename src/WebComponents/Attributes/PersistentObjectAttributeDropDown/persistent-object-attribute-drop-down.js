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
            var PersistentObjectAttributeDropDown = (function (_super) {
                __extends(PersistentObjectAttributeDropDown, _super);
                function PersistentObjectAttributeDropDown() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeDropDown.prototype._valueChanged = function (newValue) {
                    if (this.attribute && newValue != this.attribute.value)
                        this.attribute.setValue(newValue, true);
                };
                return PersistentObjectAttributeDropDown;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeDropDown = PersistentObjectAttributeDropDown;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeDropDown);
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
