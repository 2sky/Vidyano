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
            var PersistentObjectAttributeString = (function (_super) {
                __extends(PersistentObjectAttributeString, _super);
                function PersistentObjectAttributeString() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeString.prototype._attributeChanged = function () {
                    _super.prototype._attributeChanged.call(this);
                    if (this.attribute instanceof Vidyano.PersistentObjectAttribute) {
                        this.characterCasing = this.attribute.getTypeHint("CharacterCasing", "Normal");
                        this.inputtype = this.attribute.getTypeHint("InputType", "text");
                        var maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                        this.maxlength = maxlength > 0 ? maxlength : null;
                        var suggestionsSeparator = this.attribute.getTypeHint("SuggestionsSeparator");
                        if (suggestionsSeparator != null && this.attribute.options != null && this.attribute.options.length > 0) {
                            var value = this.attribute.value;
                            this.suggestions = this.attribute.options.filter(function (o) { return !StringEx.isNullOrEmpty(o) && (value == null || !value.contains(o)); });
                        }
                    }
                };
                PersistentObjectAttributeString.prototype._editInputBlur = function () {
                    if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                        this.attribute.setValue(this.value = this.attribute.value, true);
                };
                PersistentObjectAttributeString.prototype._valueChanged = function () {
                    var newValue = this._changeCasing(this.value);
                    if (newValue == this.value)
                        _super.prototype._valueChanged.call(this, newValue);
                    else
                        this.attribute.setValue(newValue, false);
                };
                PersistentObjectAttributeString.prototype._characterCasingChanged = function (casing) {
                    if (casing == "Upper")
                        this._setEditInputStyle("text-transform: uppercase;");
                    else if (casing == "Lower")
                        this._setEditInputStyle("text-transform: lowercase;");
                    else
                        this._setEditInputStyle(undefined);
                };
                PersistentObjectAttributeString.prototype._changeCasing = function (val) {
                    if (val == null)
                        return null;
                    if (this.characterCasing == "Normal")
                        return val;
                    return this.characterCasing == "Upper" ? val.toUpperCase() : val.toLowerCase();
                };
                return PersistentObjectAttributeString;
            })(Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeString = PersistentObjectAttributeString;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeString, {
                properties: {
                    characterCasing: {
                        type: String,
                        observer: "_characterCasingChanged"
                    },
                    editInputStyle: {
                        type: String,
                        readOnly: true
                    },
                    suggestions: Array,
                    inputtype: String,
                    maxlength: Number,
                },
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
