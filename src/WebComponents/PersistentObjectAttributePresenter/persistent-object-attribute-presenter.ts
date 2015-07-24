module Vidyano.WebComponents {
    export class PersistentObjectAttributePresenter extends WebComponent {
        private static _attributeImports: {
            [key: string]: Promise<boolean>;
        } = {
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

        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;
        attribute: Vidyano.PersistentObjectAttribute;

        private _setLoading: (loading: boolean) => void;

        private _attributeChanged(attribute: Vidyano.PersistentObjectAttribute, isAttached: boolean) {
            if (Polymer.dom(this).children.length > 0)
                this.empty();

            if (attribute && isAttached) {
                this._setLoading(true);

                var attributeType: string;
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

                var synonymResolvers: ((result: {}) => void)[];
                if (typeImport.synonyms) {
                    synonymResolvers = [];
                    typeImport.synonyms.forEach(s => Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[s] = new Promise(resolve => { synonymResolvers.push(resolve); }));
                }

                Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type] = new Promise(resolve => {
                    this.importHref(this.resolveUrl("../Attributes/" + typeImport.filename), e => {
                        resolve(true);
                        if (synonymResolvers)
                            synonymResolvers.forEach(resolver => resolver(true));

                        this._renderAttribute(attribute, attributeType);
                    }, err => {
                            console.error(err);

                            Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type] = Promise.resolve(false);
                            this._setLoading(false);
                        });
                });
            }
        }

        private _getAttributeTypeImportInfo(type: string): { filename: string; synonyms?: string[]; } {
            var synonyms: string[];
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
            //else if (type === "MultiString")
            //    return { filename: "PersistentObjectAttributeMultiString/persistent-object-attribute-multi-string.html", synonyms: synonyms };
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
        }

        private _renderAttribute(attribute: Vidyano.PersistentObjectAttribute, attributeType: string) {
            Vidyano.WebComponents.PersistentObjectAttributePresenter._attributeImports[attribute.type].then(() => {
                if (attribute !== this.attribute)
                    return;

                try {
                    var config = this.app.configuration.getAttributeConfig(attribute);
                    if (config && config.template) {
                        if (!this._templatePresenter)
                            this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(config.template, "attribute");

                        this._templatePresenter.dataContext = attribute;

                        if (!this._templatePresenter.isAttached)
                            Polymer.dom(this).appendChild(this._templatePresenter);

                        return;
                    }

                    var child = <WebComponents.Attributes.PersistentObjectAttribute>new (Vidyano.WebComponents.Attributes["PersistentObjectAttribute" + attributeType] || Vidyano.WebComponents.Attributes.PersistentObjectAttributeString)();
                    Polymer.dom(this).appendChild(child.asElement);

                    child.attribute = attribute;
                }
                finally {
                    this._setLoading(false);
                }
            });
        }

        private _computeRequired(required: boolean, value: any): boolean {
            return required && (value === "" || value == null);
        }
    }

    WebComponent.register(PersistentObjectAttributePresenter, WebComponents, "vi", {
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
}