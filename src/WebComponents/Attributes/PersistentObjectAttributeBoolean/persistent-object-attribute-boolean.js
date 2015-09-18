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
            var PersistentObjectAttributeBoolean = (function (_super) {
                __extends(PersistentObjectAttributeBoolean, _super);
                function PersistentObjectAttributeBoolean() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeBoolean.prototype._valueChanged = function (newValue) {
                    if (this.attribute && newValue != this.attribute.value)
                        this.attribute.setValue(newValue, true);
                };
                PersistentObjectAttributeBoolean = __decorate([
                    Attributes.PersistentObjectAttribute.register()
                ], PersistentObjectAttributeBoolean);
                return PersistentObjectAttributeBoolean;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeBoolean = PersistentObjectAttributeBoolean;
            var PersistentObjectAttributeNullableBoolean = (function (_super) {
                __extends(PersistentObjectAttributeNullableBoolean, _super);
                function PersistentObjectAttributeNullableBoolean() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeNullableBoolean.prototype.attached = function () {
                    _super.prototype.attached.call(this);
                    if (!this.options && this.attribute) {
                        this.options = [
                            {
                                key: null,
                                value: ""
                            },
                            {
                                key: true,
                                value: this.translations[this.attribute.getTypeHint("TrueKey", "Yes")]
                            },
                            {
                                key: false,
                                value: this.translations[this.attribute.getTypeHint("FalseKey", "No")]
                            }];
                    }
                };
                PersistentObjectAttributeNullableBoolean.prototype._valueChanged = function (newValue) {
                    if (this.attribute && newValue != this.attribute.value)
                        this.attribute.setValue(newValue, true);
                };
                PersistentObjectAttributeNullableBoolean.prototype._notNull = function (value) {
                    return value != null;
                };
                PersistentObjectAttributeNullableBoolean = __decorate([
                    Attributes.PersistentObjectAttribute.register({
                        properties: {
                            options: Array
                        }
                    })
                ], PersistentObjectAttributeNullableBoolean);
                return PersistentObjectAttributeNullableBoolean;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeNullableBoolean = PersistentObjectAttributeNullableBoolean;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
