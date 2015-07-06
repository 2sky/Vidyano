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
            var PersistentObjectAttributeMultiLineString = (function (_super) {
                __extends(PersistentObjectAttributeMultiLineString, _super);
                function PersistentObjectAttributeMultiLineString() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeMultiLineString.prototype._attributeChanged = function () {
                    _super.prototype._attributeChanged.call(this);
                    if (this.attribute) {
                        var maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                        this.maxlength = maxlength > 0 ? maxlength : null;
                    }
                };
                PersistentObjectAttributeMultiLineString.prototype._editTextAreaBlur = function () {
                    if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                        this.attribute.setValue(this.value = this.attribute.value, true);
                };
                return PersistentObjectAttributeMultiLineString;
            })(Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeMultiLineString = PersistentObjectAttributeMultiLineString;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeMultiLineString, {
                properties: {
                    maxlength: Number
                }
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
