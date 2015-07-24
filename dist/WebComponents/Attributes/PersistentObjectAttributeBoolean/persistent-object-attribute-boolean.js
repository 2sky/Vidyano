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
        var Attributes;
        (function (Attributes) {
            var PersistentObjectAttributeBoolean = (function (_super) {
                __extends(PersistentObjectAttributeBoolean, _super);
                function PersistentObjectAttributeBoolean() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeBoolean.prototype.toggle = function () {
                    if (this.attribute.parent.isEditing && !this.attribute.isReadOnly)
                        this.attribute.setValue(!this.value); // If value was null, we also toggle to 'true'
                };
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
                return PersistentObjectAttributeNullableBoolean;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeNullableBoolean = PersistentObjectAttributeNullableBoolean;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeBoolean, {
                listeners: {
                    "tap": "toggle"
                }
            });
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeNullableBoolean, {
                properties: {
                    options: Array
                }
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
