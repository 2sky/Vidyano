namespace Vidyano.WebComponents {
    "use strict";

    const _attributeImports: { [key: string]: Promise<any>; } = {
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

    @WebComponent.register({
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
                computed: "_computeEditing(attribute.parent.isEditing, nonEdit)"
            },
            nonEdit: {
                type: Boolean,
                reflectToAttribute: true,
                value: false,
                observer: "_nonEditChanged"
            },
            required: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeRequired(attribute, attribute.isRequired, attribute.value)"
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true,
                value: false,
                observer: "_disabledChanged"
            },
            readOnly: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeReadOnly(attribute.isReadOnly, attribute.parent.isFrozen, disabled)"
            },
            bulkEdit: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "attribute.parent.isBulkEdit"
            },
            loading: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true,
                value: true,
                observer: "_loadingChanged"
            },
            height: {
                type: Number,
                reflectToAttribute: true
            },
            hidden: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_isHidden(attribute.isVisible)"
            },
            hasError: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasError(attribute.validationError)"
            }
        },
        hostAttributes: {
            "tabindex": "-1"
        },
        listeners: {
            "focus": "_onFocus"
        },
        observers: [
            "_attributeChanged(attribute, isAttached)"
        ],
        forwardObservers: [
            "attribute.parent.isEditing",
            "attribute.parent.isFrozen",
            "attribute.isRequired",
            "attribute.isReadOnly",
            "attribute.isVisible",
            "attribute.value",
            "attribute.isValueChanged",
            "attribute.validationError",
            "attribute.parent.isBulkEdit"
        ]
    })
    export class PersistentObjectAttributePresenter extends WebComponent implements IConfigurable {
        private _renderedAttribute: Vidyano.PersistentObjectAttribute;
        private _renderedAttributeElement: Vidyano.WebComponents.Attributes.PersistentObjectAttribute;
        private _customTemplate: PolymerTemplate;
        private _focusQueued: boolean;
        readonly loading: boolean; private _setLoading: (loading: boolean) => void;
        attribute: Vidyano.PersistentObjectAttribute;
        nonEdit: boolean;
        noLabel: boolean;
        height: number;
        disabled: boolean;
        readOnly: boolean;

        attached() {
            if (!this._customTemplate)
                this._customTemplate = <PolymerTemplate><any>Polymer.dom(this).querySelector("template[is='dom-template']");

            super.attached();
        }

        queueFocus() {
            const activeElement = document.activeElement;
            this._focusElement(this);

            if (activeElement !== document.activeElement)
                this._focusQueued = true;
        }

        private _attributeChanged(attribute: Vidyano.PersistentObjectAttribute, isAttached: boolean) {
            if (this._renderedAttribute) {
                Polymer.dom(this.$.content).children.forEach(c => Polymer.dom(this.$.content).removeChild(c));
                this._renderedAttributeElement = this._renderedAttribute = null;
            }

            if (attribute && isAttached) {
                this._setLoading(true);

                if (!this.getAttribute("height"))
                    this.height = this.app.configuration.getAttributeConfig(attribute).calculateHeight(attribute);

                let attributeType: string;
                if (Vidyano.DataType.isNumericType(attribute.type))
                    attributeType = "Numeric";
                else if (Vidyano.DataType.isDateTimeType(attribute.type))
                    attributeType = "DateTime";
                else if (attribute.parent.isBulkEdit && (attribute.type === "YesNo" || attribute.type === "Boolean"))
                    attributeType = "NullableBoolean";
                else
                    attributeType = attribute.type;

                if (_attributeImports[attributeType] !== undefined) {
                    this._renderAttribute(attribute, attributeType);
                    return;
                }

                const typeImport = this._getAttributeTypeImportInfo(attributeType);
                if (!typeImport) {
                    _attributeImports[attributeType] = Promise.resolve(false);
                    this._renderAttribute(attribute, attributeType);
                    return;
                }

                let synonymResolvers: ((result: {}) => void)[];
                if (typeImport.synonyms) {
                    synonymResolvers = [];
                    typeImport.synonyms.forEach(s => _attributeImports[s] = new Promise(resolve => { synonymResolvers.push(resolve); }));
                }

                _attributeImports[attributeType] = new Promise(async (resolve) => {
                    try {
                        await this.importHref(this.resolveUrl("../Attributes/" + typeImport.filename));
                        if (synonymResolvers)
                            synonymResolvers.forEach(resolver => resolver(true));

                        this._renderAttribute(attribute, attributeType);
                        resolve(true);
                    }
                    catch (err) {
                        _attributeImports[attributeType] = Promise.resolve(false);
                        this._setLoading(false);
                        resolve(false);
                    }
                });
            }
        }

        private _getAttributeTypeImportInfo(type: string): { filename: string; synonyms?: string[]; } {
            let synonyms: string[];
            for (const key in Vidyano.WebComponents.Attributes.PersistentObjectAttribute.typeSynonyms) {
                const typeSynonyms = Vidyano.WebComponents.Attributes.PersistentObjectAttribute.typeSynonyms[key];
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
            else if (type === "MultiString")
                return { filename: "PersistentObjectAttributeMultiString/persistent-object-attribute-multi-string.html", synonyms: synonyms };
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

        private async _renderAttribute(attribute: Vidyano.PersistentObjectAttribute, attributeType: string) {
            await _attributeImports[attributeType];
            if (!this.isAttached || attribute !== this.attribute || this._renderedAttribute === attribute)
                return;

            let focusTarget: HTMLElement;
            try {
                if (this._customTemplate)
                    Polymer.dom(focusTarget = this.$.content).appendChild(this._customTemplate.stamp({ attribute: attribute }).root);
                else {
                    const config = <PersistentObjectAttributeConfig>this.app.configuration.getAttributeConfig(attribute);
                    this.noLabel = this.noLabel || (config && !!config.noLabel);

                    if (!!config && config.hasTemplate)
                        Polymer.dom(this.$.content).appendChild(config.stamp(attribute, config.as || "attribute"));
                    else {
                        this._renderedAttributeElement = <WebComponents.Attributes.PersistentObjectAttribute>new (Vidyano.WebComponents.Attributes["PersistentObjectAttribute" + attributeType] || Vidyano.WebComponents.Attributes.PersistentObjectAttributeString)();
                        this._renderedAttributeElement.classList.add("attribute");
                        this._renderedAttributeElement.attribute = attribute;
                        this._renderedAttributeElement.nonEdit = this.nonEdit;
                        this._renderedAttributeElement.disabled = this.disabled;

                        Polymer.dom(this.$.content).appendChild(focusTarget = this._renderedAttributeElement);
                    }
                }

                this._renderedAttribute = attribute;
            }
            finally {
                this._setLoading(false);

                if (this._focusQueued) {
                    Polymer.dom(focusTarget).flush();

                    this._focusElement(focusTarget);
                    this._focusQueued = false;
                }
            }
        }

        private _computeEditing(isEditing: boolean, nonEdit: boolean): boolean {
            return !nonEdit && isEditing;
        }

        private _nonEditChanged(nonEdit: boolean) {
            if (this._renderedAttributeElement)
                this._renderedAttributeElement.nonEdit = nonEdit;
        }

        private _disabledChanged(disabled: boolean) {
            if (!this._renderedAttributeElement)
                return;

            this._renderedAttributeElement.disabled = disabled;
        }

        private _computeRequired(attribute: Vidyano.PersistentObjectAttribute, required: boolean, value: any): boolean {
            return required && (value == null || (attribute && attribute.rules && attribute.rules.contains("NotEmpty") && value === ""));
        }

        private _computeReadOnly(isReadOnly: boolean, isFrozen: boolean, disabled: boolean): boolean {
            return isReadOnly || disabled || isFrozen;
        }

        private _computeHasError(validationError: string): boolean {
            return !StringEx.isNullOrEmpty(validationError);
        }

        private _isHidden(isVisible: boolean): boolean {
            return !isVisible;
        }

        private _onFocus() {
            const target = <HTMLElement>this._renderedAttributeElement || this._getFocusableElement();
            if (!target)
                return;

            this._focusElement(target);
        }

        private _loadingChanged(loading: boolean) {
            if (loading)
                this.fire("attribute-loading", { attribute: this.attribute }, { bubbles: true });
            else {
                Polymer.dom(this).flush();
                this.fire("attribute-loaded", { attribute: this.attribute }, { bubbles: true });
            }
        }

        _viConfigure(actions: IConfigurableAction[]) {
            if (this.attribute.parent.isSystem)
                return;

            actions.push({
                label: `Attribute: ${this.attribute.name}`,
                icon: "viConfigure",
                action: () => {
                    this.app.changePath(`Management/PersistentObject.1456569d-e02b-44b3-9d1a-a1e417061c77/${this.attribute.id}`);
                }
            });
        }
    }
}