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
            var PersistentObjectAttributeTranslatedString = (function (_super) {
                __extends(PersistentObjectAttributeTranslatedString, _super);
                function PersistentObjectAttributeTranslatedString() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeTranslatedString.prototype._optionsChanged = function () {
                    _super.prototype._optionsChanged.call(this);
                    var strings = [];
                    this._defaultLanguage = this.attribute.options[1];
                    var data = JSON.parse(this.attribute.options[0]);
                    var labels = JSON.parse(this.attribute.options[2]);
                    for (var key in labels) {
                        strings.push({
                            key: key,
                            value: data[key] || "",
                            label: labels[key]
                        });
                    }
                    this._setStrings(strings);
                };
                PersistentObjectAttributeTranslatedString.prototype._valueChanged = function (newValue) {
                    var _this = this;
                    if (newValue === this.attribute.value)
                        return;
                    _super.prototype._valueChanged.call(this, newValue);
                    Enumerable.from(this.strings).first(function (s) { return s.key == _this._defaultLanguage; }).value = newValue;
                    var newOption = {};
                    this.strings.forEach(function (val) {
                        newOption[val.key] = val.value;
                    });
                    this.set("attribute.options.0", JSON.stringify(newOption));
                };
                PersistentObjectAttributeTranslatedString.prototype._editInputBlur = function () {
                    if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                        this.attribute.setValue(this.value = this.attribute.value, true);
                };
                PersistentObjectAttributeTranslatedString.prototype._computeMultiLine = function (attribute) {
                    return attribute && attribute.getTypeHint("MultiLine") == "True";
                };
                PersistentObjectAttributeTranslatedString.prototype._computeCanShowDialog = function (readOnly, strings) {
                    return !readOnly && strings.length > 1;
                };
                PersistentObjectAttributeTranslatedString.prototype._showLanguagesDialog = function () {
                    var _this = this;
                    var dialog = this.$$("#dialog");
                    dialog.strings = this.strings.slice();
                    return dialog.show().then(function (result) {
                        if (!result)
                            return;
                        var newData = {};
                        result.forEach(function (s) {
                            newData[s.key] = _this.strings[s.key] = s.value;
                            if (s.key === _this._defaultLanguage)
                                _this.attribute.value = s.value;
                        });
                        _this.attribute.options[0] = JSON.stringify(newData);
                        _this.attribute.isValueChanged = true;
                        _this.attribute.parent.triggerDirty();
                        _this.attribute.setValue(_this.value = _this.attribute.value, true);
                    });
                };
                return PersistentObjectAttributeTranslatedString;
            })(Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeTranslatedString = PersistentObjectAttributeTranslatedString;
            var PersistentObjectAttributeTranslatedStringDialog = (function (_super) {
                __extends(PersistentObjectAttributeTranslatedStringDialog, _super);
                function PersistentObjectAttributeTranslatedStringDialog() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeTranslatedStringDialog.prototype.show = function () {
                    var dialog = this.$["dialog"];
                    this._dialog = dialog.show();
                    return this._dialog.result;
                };
                PersistentObjectAttributeTranslatedStringDialog.prototype._ok = function () {
                    this._dialog.resolve(this.strings);
                };
                PersistentObjectAttributeTranslatedStringDialog.prototype._cancel = function () {
                    this._dialog.reject(null);
                };
                return PersistentObjectAttributeTranslatedStringDialog;
            })(WebComponents.WebComponent);
            Attributes.PersistentObjectAttributeTranslatedStringDialog = PersistentObjectAttributeTranslatedStringDialog;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeTranslatedString, {
                properties: {
                    strings: {
                        type: Array,
                        readOnly: true
                    },
                    multiline: {
                        type: Boolean,
                        reflectToAttribute: true,
                        computed: "_computeMultiLine(attribute)"
                    },
                    canShowDialog: {
                        type: Boolean,
                        computed: "_computeCanShowDialog(readOnly, strings)"
                    }
                }
            });
            Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Attributes.PersistentObjectAttributeTranslatedStringDialog, Vidyano.WebComponents, "vi", {
                properties: {
                    label: String,
                    strings: Array,
                    multiline: {
                        type: Boolean,
                        reflectToAttribute: true,
                    }
                }
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
