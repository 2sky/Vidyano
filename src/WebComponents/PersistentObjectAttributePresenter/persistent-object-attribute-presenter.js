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
        var PersistentObjectAttributePresenter = (function (_super) {
            __extends(PersistentObjectAttributePresenter, _super);
            function PersistentObjectAttributePresenter() {
                _super.apply(this, arguments);
            }
            PersistentObjectAttributePresenter.prototype._attributeChanged = function (attribute, isAttached) {
                var _this = this;
                if (Polymer.dom(this).children.length > 0)
                    this.empty();
                if (attribute && isAttached) {
                    this._setLoading(true);
                    var attributeType;
                    if (Vidyano.Service.isNumericType(attribute.type))
                        attributeType = "Numeric";
                    else if (Vidyano.Service.isDateTimeType(attribute.type))
                        attributeType = "DateTime";
                    else
                        attributeType = attribute.type;
                    if (Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type] !== undefined) {
                        this._renderAttribute(attribute, attributeType);
                        return;
                    }
                    var typeImport = this._getAttributeTypeImportInfo(attributeType);
                    if (!typeImport) {
                        Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type] = Promise.resolve(false);
                        this._renderAttribute(attribute, attributeType);
                        return;
                    }
                    var synonymResolvers;
                    if (typeImport.synonyms) {
                        synonymResolvers = [];
                        typeImport.synonyms.forEach(function (s) { return Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[s] = new Promise(function (resolve) { synonymResolvers.push(resolve); }); });
                    }
                    Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type] = new Promise(function (resolve) {
                        _this.importHref(_this.resolveUrl("../Attributes/" + typeImport.filename), function (e) {
                            resolve(true);
                            if (synonymResolvers)
                                synonymResolvers.forEach(function (resolver) { return resolver(true); });
                            _this._renderAttribute(attribute, attributeType);
                        }, function (err) {
                            console.error(err);
                            Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type] = Promise.resolve(false);
                            _this._setLoading(false);
                        });
                    });
                }
            };
            PersistentObjectAttributePresenter.prototype._getAttributeTypeImportInfo = function (type) {
                var synonyms;
                for (var key in Vidyano.WebComponents.Attributes.PersistentObjectAttribute.typeSynonyms) {
                    var typeSynonyms = Vidyano.WebComponents.Attributes.PersistentObjectAttribute.typeSynonyms[key];
                    if (key === type)
                        synonyms = typeSynonyms;
                    else if (typeSynonyms.indexOf(type) >= 0) {
                        type = key;
                        synonyms = typeSynonyms;
                    }
                }
                if (type === "AsDetail")
                    return { filename: "PersistentObjectAttributeAsDetail/persistent-object-attribute-as-detail.html", synonyms: synonyms };
                else if (type === "BinaryFile")
                    return { filename: "PersistentObjectAttributeBinaryFile/persistent-object-attribute-binary-file.html", synonyms: synonyms };
                else if (type === "Boolean" || type === "NullableBoolean")
                    return { filename: "PersistentObjectAttributeBoolean/persistent-object-attribute-boolean.html", synonyms: synonyms };
                else if (type === "ComboBox")
                    return { filename: "PersistentObjectAttributeComboBox/persistent-object-attribute-combo-box.html", synonyms: synonyms };
                else if (type === "CommonMark")
                    return { filename: "PersistentObjectAttributeCommonMark/persistent-object-attribute-common-mark.html", synonyms: synonyms };
                else if (type === "DateTime")
                    return { filename: "PersistentObjectAttributeDateTime/persistent-object-attribute-date-time.html", synonyms: synonyms };
                else if (type === "DropDown")
                    return { filename: "PersistentObjectAttributeDropDown/persistent-object-attribute-drop-down.html", synonyms: synonyms };
                else if (type === "FlagsEnum")
                    return { filename: "PersistentObjectAttributeFlagsEnum/persistent-object-attribute-flags-enum.html", synonyms: synonyms };
                else if (type === "Image")
                    return { filename: "PersistentObjectAttributeImage/persistent-object-attribute-image.html", synonyms: synonyms };
                else if (type === "KeyValueList")
                    return { filename: "PersistentObjectAttributeKeyValueList/persistent-object-attribute-key-value-list.html", synonyms: synonyms };
                else if (type === "MultiLineString")
                    return { filename: "PersistentObjectAttributeMultiLineString/persistent-object-attribute-multi-line-string.html", synonyms: synonyms };
                else if (type === "Numeric")
                    return { filename: "PersistentObjectAttributeNumeric/persistent-object-attribute-numeric.html", synonyms: synonyms };
                else if (type === "Password")
                    return { filename: "PersistentObjectAttributePassword/persistent-object-attribute-password.html", synonyms: synonyms };
                else if (type === "Reference")
                    return { filename: "PersistentObjectAttributeReference/persistent-object-attribute-reference.html", synonyms: synonyms };
                else if (type === "String")
                    return { filename: "PersistentObjectAttributeString/persistent-object-attribute-string.html", synonyms: synonyms };
                else if (type === "TranslatedString")
                    return { filename: "PersistentObjectAttributeTranslatedString/persistent-object-attribute-translated-string.html", synonyms: synonyms };
                else if (type === "User")
                    return { filename: "PersistentObjectAttributeUser/persistent-object-attribute-user.html", synonyms: synonyms };
                return null;
            };
            PersistentObjectAttributePresenter.prototype._renderAttribute = function (attribute, attributeType) {
                var _this = this;
                Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type].then(function () {
                    if (attribute !== _this.attribute)
                        return;
                    try {
                        var config = _this.app.configuration.getAttributeConfig(attribute);
                        if (config && config.template) {
                            if (!_this._templatePresenter)
                                _this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(config.template, "attribute");
                            _this._templatePresenter.dataContext = attribute;
                            if (!_this._templatePresenter.isAttached)
                                Polymer.dom(_this).appendChild(_this._templatePresenter);
                            return;
                        }
                        var child = new (Vidyano.WebComponents.Attributes["PersistentObjectAttribute" + attributeType] || Vidyano.WebComponents.Attributes.PersistentObjectAttributeString)();
                        child.classList.add("attribute");
                        Polymer.dom(_this).appendChild(child.asElement);
                        child.attribute = attribute;
                    }
                    finally {
                        _this._setLoading(false);
                    }
                });
            };
            PersistentObjectAttributePresenter.prototype._computeRequired = function (required, value) {
                return required && (value === "" || value == null);
            };
            PersistentObjectAttributePresenter._attributeImports = {
                "AsDetail": undefined,
                "BinaryFile": undefined,
                "Boolean": undefined,
                "ComboBox": undefined,
                "CommonMark": undefined,
                "DateTime": undefined,
                "DropDown": undefined,
                "FlagsEnum": undefined,
                "Image": undefined,
                "KeyValueList": undefined,
                "MultiLineString": undefined,
                "MultiString": undefined,
                "Numeric": undefined,
                "Password": undefined,
                "Reference": undefined,
                "String": undefined,
                "TranslatedString": undefined,
                "User": undefined
            };
            return PersistentObjectAttributePresenter;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectAttributePresenter = PersistentObjectAttributePresenter;
        WebComponents.WebComponent.register(PersistentObjectAttributePresenter, WebComponents, "vi", {
            properties: {
                attribute: Object,
                noLabel: {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false
                },
                editing: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "attribute.parent.isEditing"
                },
                required: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_computeRequired(attribute.isRequired, attribute.value)"
                },
                readOnly: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "attribute.isReadOnly"
                },
                loading: {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true,
                    value: true
                }
            },
            observers: [
                "_attributeChanged(attribute, isAttached)"
            ],
            forwardObservers: [
                "attribute.parent.isEditing",
                "attribute.isRequired",
                "attribute.isReadOnly",
                "attribute.value"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
