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
            var PersistentObjectAttributeFlagsEnum = (function (_super) {
                __extends(PersistentObjectAttributeFlagsEnum, _super);
                function PersistentObjectAttributeFlagsEnum() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeFlagsEnum = __decorate([
                    Attributes.PersistentObjectAttribute.register
                ], PersistentObjectAttributeFlagsEnum);
                return PersistentObjectAttributeFlagsEnum;
            })(WebComponents.Attributes.PersistentObjectAttribute);
            Attributes.PersistentObjectAttributeFlagsEnum = PersistentObjectAttributeFlagsEnum;
            var PersistentObjectAttributeFlagsEnumFlag = (function (_super) {
                __extends(PersistentObjectAttributeFlagsEnumFlag, _super);
                function PersistentObjectAttributeFlagsEnumFlag() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeFlagsEnumFlag.prototype._checkedChanged = function () {
                    if (this._skipCheckedChanged || !this.attribute)
                        return;
                    var myValue = parseInt(this.option.key);
                    if (this.checked && myValue == 0)
                        this.attribute.value = this.option.value;
                    else {
                        var currentOptions = Enumerable.from(this.attribute.options);
                        var currentValue = this.attribute.value ? this._values(this.attribute.value).sum(function (v) { return parseInt(currentOptions.first(function (o) { return o.value == v; }).key); }) : 0;
                        if (this.checked)
                            currentValue |= myValue;
                        else
                            currentValue &= ~myValue;
                        var value = [];
                        currentOptions.orderByDescending(function (o) { return parseInt(o.key); }).forEach(function (option) {
                            var optionKey = parseInt(option.key);
                            if (optionKey != 0 && (currentValue & optionKey) == optionKey) {
                                currentValue &= ~optionKey;
                                value.splice(0, 0, option.value);
                            }
                        });
                        if (value.length > 0)
                            this.attribute.value = value.join(", ");
                        else {
                            this.attribute.value = currentOptions.first(function (o) { return o.key == "0"; }).value;
                            if (myValue == 0)
                                this.checked = true;
                        }
                    }
                };
                PersistentObjectAttributeFlagsEnumFlag.prototype._computeLabel = function (option) {
                    return option.value;
                };
                PersistentObjectAttributeFlagsEnumFlag.prototype._valueChanged = function (value, label) {
                    try {
                        this._skipCheckedChanged = true;
                        var currentOptions = Enumerable.from(this.attribute.options);
                        var currentValue = this.attribute.value ? this._values(this.attribute.value).sum(function (v) { return parseInt(currentOptions.first(function (o) { return o.value == v; }).key); }) : 0;
                        var myValue = parseInt(this.option.key);
                        this.checked = (currentValue == 0 && myValue == 0) || (myValue != 0 && (currentValue & myValue) == myValue);
                    }
                    finally {
                        this._skipCheckedChanged = false;
                    }
                };
                PersistentObjectAttributeFlagsEnumFlag.prototype._values = function (value) {
                    return Enumerable.from(value.split(",")).select(function (v) { return v.trim(); });
                };
                PersistentObjectAttributeFlagsEnumFlag = __decorate([
                    WebComponents.WebComponent.register({
                        properties: {
                            attribute: Object,
                            checked: {
                                type: Boolean,
                                notify: true,
                                observer: "_checkedChanged",
                                value: false
                            },
                            label: {
                                type: String,
                                computed: "_computeLabel(option)"
                            },
                            option: Object,
                            value: {
                                type: String,
                                computed: "attribute.value"
                            }
                        },
                        observers: [
                            "_valueChanged(value, label)"
                        ],
                        forwardObservers: [
                            "attribute.value"
                        ]
                    })
                ], PersistentObjectAttributeFlagsEnumFlag);
                return PersistentObjectAttributeFlagsEnumFlag;
            })(WebComponents.WebComponent);
            Attributes.PersistentObjectAttributeFlagsEnumFlag = PersistentObjectAttributeFlagsEnumFlag;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
