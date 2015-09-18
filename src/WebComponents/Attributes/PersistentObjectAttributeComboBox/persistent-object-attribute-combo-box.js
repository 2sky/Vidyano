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
                PersistentObjectAttributeComboBox = __decorate([
                    Attributes.PersistentObjectAttribute.register({
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
                    })
                ], PersistentObjectAttributeComboBox);
                return PersistentObjectAttributeComboBox;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeComboBox = PersistentObjectAttributeComboBox;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
