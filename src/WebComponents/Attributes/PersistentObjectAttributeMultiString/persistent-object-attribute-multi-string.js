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
            var MultiString = (function () {
                function MultiString(_value, _valueChanged) {
                    this._value = _value;
                    this._valueChanged = _valueChanged;
                }
                Object.defineProperty(MultiString.prototype, "value", {
                    get: function () {
                        return this._value;
                    },
                    set: function (val) {
                        this._value = val;
                        this._valueChanged();
                    },
                    enumerable: true,
                    configurable: true
                });
                MultiString.prototype.updateValueChanged = function (newValueChanged) {
                    this._valueChanged = newValueChanged;
                    this._valueChanged();
                };
                return MultiString;
            })();
            var PersistentObjectAttributeMultiString = (function (_super) {
                __extends(PersistentObjectAttributeMultiString, _super);
                function PersistentObjectAttributeMultiString() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeMultiString.prototype.templateLoaded = function () {
                    if (this.target && this.target.parent.isEditing)
                        this._render();
                };
                PersistentObjectAttributeMultiString.prototype.stringsChanged = function () {
                    if (this.target && this.target.parent.isEditing)
                        this._render();
                };
                PersistentObjectAttributeMultiString.prototype._computeStrings = function (value) {
                    if (!value)
                        return [];
                    var valueChangedCallback = this._onSort.bind(this);
                    return value.split("\n").filter(function (v) { return v.length > 0; }).map(function (v) { return new MultiString(v, valueChangedCallback); });
                };
                PersistentObjectAttributeMultiString.prototype._render = function () {
                    var _this = this;
                    if (!this.isTemplatedLoaded || !this.strings)
                        return;
                    var newContainer = this.asElement.querySelector("#new");
                    if (newContainer.childNodes.length == 0)
                        newContainer.appendChild(this._createMultiStringResource(this._newMultiString = new MultiString("", this._newMultiStringValueChanged.bind(this))));
                    var skipRefreshStrings;
                    if (this._sortable) {
                        var values = this._getValues();
                        if (values.length == this.strings.length) {
                            var stringValues = this.strings.map(function (s) { return s.value; });
                            if (values.every(function (v, index) { return v == stringValues[index]; }))
                                skipRefreshStrings = true;
                        }
                        this._sortable.destroy();
                    }
                    var inputs = this.asElement.querySelector("#inputs");
                    if (!skipRefreshStrings) {
                        inputs.textContent = "";
                        this.strings.forEach(function (s) { return inputs.appendChild(_this._createMultiStringResource(s)); });
                    }
                    this._sortable = window["Sortable"].create(inputs, {
                        handle: ".sort-handle",
                        animation: 150,
                        onSort: this._onSort.bind(this)
                    });
                };
                PersistentObjectAttributeMultiString.prototype._onSort = function () {
                    this.value = this._getValues().filter(function (v) { return v.length > 0; }).join("\n");
                };
                PersistentObjectAttributeMultiString.prototype._newMultiStringValueChanged = function () {
                    if (this._newMultiString.value)
                        var newContainer = this.asElement.querySelector("#new");
                    var newResource = this.asElement.querySelector("#new > vi-resource");
                    this.asElement.querySelector("#inputs").appendChild(newResource);
                    var input = newResource.querySelector("input");
                    if (input)
                        input.focus();
                    this._newMultiString.updateValueChanged(this._onSort.bind(this));
                };
                PersistentObjectAttributeMultiString.prototype._createMultiStringResource = function (model) {
                    var resource = new Vidyano.WebComponents.Resource();
                    resource.model = model;
                    resource.source = "vi-persistent-object-attribute-multi-string+part:edit";
                    return resource;
                };
                PersistentObjectAttributeMultiString.prototype._getValues = function () {
                    return Array.prototype.map.apply(this.asElement.querySelectorAll("#inputs > vi-resource"), [function (resource) { return resource.model.value; }]);
                };
                return PersistentObjectAttributeMultiString;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeMultiString = PersistentObjectAttributeMultiString;
            Attributes.PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeMultiString, {
                _newMultiString: { value: null }
            }, {
                strings: "_computeStrings(target.value)"
            });
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
