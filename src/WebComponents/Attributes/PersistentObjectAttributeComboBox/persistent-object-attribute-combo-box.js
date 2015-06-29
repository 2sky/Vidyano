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
            var PersistentObjectAttributeComboBox = (function (_super) {
                __extends(PersistentObjectAttributeComboBox, _super);
                function PersistentObjectAttributeComboBox() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeComboBox.prototype._editingChanged = function () {
                    _super.prototype._editingChanged.call(this);
                    if (this.newValue) {
                        this.newValue = null;
                        this._optionsChanged();
                    }
                };
                PersistentObjectAttributeComboBox.prototype._optionsChanged = function () {
                    var options = this.attribute.options ? this.attribute.options.slice() : [];
                    var empty = options.indexOf(null);
                    if (empty < 0)
                        empty = options.indexOf("");
                    if (options.indexOf(this.attribute.value) < 0) {
                        options.splice(empty >= 0 ? empty + 1 : 0, 0, this.attribute.value);
                    }
                    this._setComboBoxOptions(options);
                };
                PersistentObjectAttributeComboBox.prototype._add = function () {
                    this.value = this.newValue;
                    this._optionsChanged();
                };
                PersistentObjectAttributeComboBox.prototype._computeCanAdd = function (newValue, options) {
                    return newValue != null && options && !options.some(function (o) { return o == newValue; });
                };
                return PersistentObjectAttributeComboBox;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeComboBox = PersistentObjectAttributeComboBox;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeComboBox, {
                properties: {
                    newValue: {
                        type: String,
                        value: null,
                        notify: true
                    },
                    comboBoxOptions: {
                        type: Array,
                        readOnly: true
                    },
                    canAdd: {
                        type: Boolean,
                        computed: "_computeCanAdd(newValue, comboBoxOptions)"
                    }
                }
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
