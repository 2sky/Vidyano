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
                PersistentObjectAttributeMultiLineString = __decorate([
                    Attributes.PersistentObjectAttribute.register({
                        properties: {
                            maxlength: Number
                        }
                    })
                ], PersistentObjectAttributeMultiLineString);
                return PersistentObjectAttributeMultiLineString;
            })(Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeMultiLineString = PersistentObjectAttributeMultiLineString;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
