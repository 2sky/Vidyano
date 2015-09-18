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
!function () {
    var w = window, d = w.document;
    if (w.onfocusin === undefined) {
        d.addEventListener('focus', addPolyfill, true);
        d.addEventListener('blur', addPolyfill, true);
        d.addEventListener('focusin', removePolyfill, true);
        d.addEventListener('focusout', removePolyfill, true);
    }
    function addPolyfill(e) {
        var type = e.type === 'focus' ? 'focusin' : 'focusout';
        var event = new CustomEvent(type, { bubbles: true, cancelable: false });
        event.c1Generated = true;
        e.target.dispatchEvent(event);
    }
    function removePolyfill(e) {
        if (!e.c1Generated) {
            d.removeEventListener('focus', addPolyfill, true);
            d.removeEventListener('blur', addPolyfill, true);
            d.removeEventListener('focusin', removePolyfill, true);
            d.removeEventListener('focusout', removePolyfill, true);
        }
        setTimeout(function () {
            d.removeEventListener('focusin', removePolyfill, true);
            d.removeEventListener('focusout', removePolyfill, true);
        });
    }
}();
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var Attributes;
        (function (Attributes) {
            var PersistentObjectAttribute = (function (_super) {
                __extends(PersistentObjectAttribute, _super);
                function PersistentObjectAttribute() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttribute.prototype._attributeValueChanged = function () {
                    this.value = this.attribute.value !== undefined ? this.attribute.value : null;
                };
                PersistentObjectAttribute.prototype._optionsChanged = function () {
                };
                PersistentObjectAttribute.prototype._attributeChanged = function () {
                };
                PersistentObjectAttribute.prototype._editingChanged = function () {
                };
                PersistentObjectAttribute.prototype._valueChanged = function (newValue) {
                    if (this.attribute && newValue !== this.attribute.value)
                        this.attribute.setValue(newValue, false);
                };
                PersistentObjectAttribute.prototype._computeHasError = function (validationError) {
                    return !StringEx.isNullOrEmpty(validationError);
                };
                PersistentObjectAttribute.register = function (info) {
                    if (info === void 0) { info = {}; }
                    if (typeof info == "function")
                        return PersistentObjectAttribute.register({})(info);
                    return function (obj) {
                        info.properties = info.properties || {};
                        info.properties["isAttached"] =
                            {
                                type: Boolean,
                                readOnly: true
                            };
                        info.properties["attribute"] = {
                            type: Object,
                            observer: "_attributeChanged"
                        };
                        info.properties["editing"] =
                            {
                                type: Boolean,
                                reflectToAttribute: true,
                                computed: "attribute.parent.isEditing"
                            };
                        info.properties["readOnly"] =
                            {
                                type: Boolean,
                                reflectToAttribute: true,
                                computed: "attribute.isReadOnly"
                            };
                        info.properties["required"] =
                            {
                                type: Boolean,
                                reflectToAttribute: true,
                                computed: "attribute.isRequired"
                            };
                        info.properties["value"] =
                            {
                                type: Object,
                                notify: true,
                                observer: "_valueChanged"
                            };
                        info.properties["validationError"] =
                            {
                                type: Object,
                                notify: true,
                                computed: "attribute.validationError"
                            };
                        info.properties["hasError"] =
                            {
                                type: Boolean,
                                reflectToAttribute: true,
                                computed: "_computeHasError(attribute.validationError)"
                            };
                        info.forwardObservers = info.forwardObservers || [];
                        info.forwardObservers.push("attribute.displayValue");
                        info.forwardObservers.push("attribute.isRequired");
                        info.forwardObservers.push("attribute.isReadOnly");
                        info.forwardObservers.push("attribute.validationError");
                        info.forwardObservers.push("_optionsChanged(attribute.options)");
                        info.forwardObservers.push("_editingChanged(attribute.parent.isEditing)");
                        info.forwardObservers.push("_attributeValueChanged(attribute.value)");
                        var ctor = WebComponents.WebComponent.register(obj, info);
                        var synonyms = Vidyano.WebComponents.Attributes.PersistentObjectAttribute.typeSynonyms[WebComponents.WebComponent.getName(obj).replace("PersistentObjectAttribute", "")];
                        if (synonyms) {
                            synonyms.forEach(function (ss) {
                                Attributes["PersistentObjectAttribute" + ss] = ctor;
                            });
                        }
                        return ctor;
                    };
                };
                PersistentObjectAttribute.typeSynonyms = {
                    "Boolean": ["YesNo"],
                    "DropDown": ["Enum"],
                    "MultiLineString": ["MultiString"],
                    "String": ["Guid", "NullableGuid"],
                    "User": ["NullableUser"]
                };
                return PersistentObjectAttribute;
            })(WebComponents.WebComponent);
            Attributes.PersistentObjectAttribute = PersistentObjectAttribute;
            var PersistentObjectAttributeEdit = (function (_super) {
                __extends(PersistentObjectAttributeEdit, _super);
                function PersistentObjectAttributeEdit() {
                    _super.apply(this, arguments);
                }
                PersistentObjectAttributeEdit.prototype._focus = function (e) {
                    this._setFocus(true);
                };
                PersistentObjectAttributeEdit.prototype._blur = function (e) {
                    this._setFocus(false);
                };
                PersistentObjectAttributeEdit.prototype._showError = function () {
                    if (!this.attribute || !this.attribute.validationError)
                        return;
                    this.app.showMessageDialog({
                        title: this.app.translateMessage(Vidyano.NotificationType[Vidyano.NotificationType.Error]),
                        titleIcon: "Notification_Error",
                        actions: [this.translations.OK],
                        message: this.attribute.validationError
                    });
                };
                PersistentObjectAttributeEdit.prototype._computeHasError = function (validationError) {
                    return !StringEx.isNullOrEmpty(validationError);
                };
                PersistentObjectAttributeEdit = __decorate([
                    WebComponents.WebComponent.register({
                        properties: {
                            attribute: Object,
                            focus: {
                                type: Boolean,
                                readOnly: true,
                                reflectToAttribute: true
                            },
                            hasError: {
                                type: Boolean,
                                reflectToAttribute: true,
                                computed: "_computeHasError(attribute.validationError)"
                            }
                        },
                        listeners: {
                            "focusin": "_focus",
                            "focusout": "_blur",
                        },
                        forwardObservers: [
                            "attribute.validationError"
                        ]
                    })
                ], PersistentObjectAttributeEdit);
                return PersistentObjectAttributeEdit;
            })(WebComponents.WebComponent);
            Attributes.PersistentObjectAttributeEdit = PersistentObjectAttributeEdit;
        })(Attributes = WebComponents.Attributes || (WebComponents.Attributes = {}));
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
