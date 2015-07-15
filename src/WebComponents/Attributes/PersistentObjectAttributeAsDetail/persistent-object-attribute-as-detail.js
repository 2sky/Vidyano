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
            var PersistentObjectAttributeAsDetail = (function (_super) {
                __extends(PersistentObjectAttributeAsDetail, _super);
                function PersistentObjectAttributeAsDetail() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeAsDetail.prototype.getDisplayValue = function (obj, column) {
                    var attr = this.getAttributeForColumn(obj, column);
                    return attr && attr.displayValue || "";
                };
                PersistentObjectAttributeAsDetail.prototype.getAttributeForColumn = function (obj, column) {
                    return obj.attributesByName[column.name];
                };
                PersistentObjectAttributeAsDetail.prototype.isVisible = function (column) {
                    return !column.isHidden && column.width !== "0";
                };
                return PersistentObjectAttributeAsDetail;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeAsDetail = PersistentObjectAttributeAsDetail;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeAsDetail, {
                forwardObservers: [
                    "attribute.objects"
                ]
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
