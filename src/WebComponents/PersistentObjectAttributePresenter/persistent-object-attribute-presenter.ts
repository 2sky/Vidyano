namespace Vidyano.WebComponents {
    class DeveloperShortcut extends Vidyano.Common.Observable<DeveloperShortcut> {
        private _state: boolean = false;

        get state(): boolean {
            return this._state;
        }

        set state(state: boolean) {
            if (state === this._state)
                return;

            const oldState = this._state;
            this.notifyPropertyChanged("state", this._state = state, oldState);
        }
    }

    const developerShortcut = new DeveloperShortcut();
    document.addEventListener("keydown", e => {
        developerShortcut.state = e.ctrlKey && e.altKey;
    });

    document.addEventListener("keyup", e => {
        developerShortcut.state = e.ctrlKey && e.altKey;
    });

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
                computed: "!attribute.isVisible"
            },
            hasError: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasError(attribute.validationError)"
            },
            developer: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        hostAttributes: {
            "tabindex": "-1"
        },
        listeners: {
            "focus": "_onFocus"
        },
        observers: [
            "_attributeChanged(attribute, isConnected)"
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
        private _developerToggleDisposer: Common.ISubjectDisposer;
        private _renderedAttribute: Vidyano.PersistentObjectAttribute;
        private _renderedAttributeElement: Vidyano.WebComponents.Attributes.PersistentObjectAttribute;
        private _focusQueued: boolean;
        readonly loading: boolean; private _setLoading: (loading: boolean) => void;
        attribute: Vidyano.PersistentObjectAttribute;
        nonEdit: boolean;
        noLabel: boolean;
        height: number;
        disabled: boolean;
        readOnly: boolean;

        connectedCallback() {
            if (this.service && this.service.application && this.service.application.hasManagement)
                this._developerToggleDisposer = developerShortcut.propertyChanged.attach(this._devToggle.bind(this));

            super.connectedCallback();
        }

        disconnectedCallback() {
            if (this._developerToggleDisposer) {
                this._developerToggleDisposer();
                this._developerToggleDisposer = null;
            }

            super.disconnectedCallback();
        }

        private _devToggle() {
            this.set("developer", !this.attribute.parent.isSystem && developerShortcut.state);
        }

        queueFocus() {
            const activeElement = document.activeElement;
            this._focusElement(this);

            if (activeElement !== document.activeElement)
                this._focusQueued = true;
        }

        private _attributeChanged(attribute: Vidyano.PersistentObjectAttribute, isConnected: boolean) {
            if (this._renderedAttribute) {
                Array.from(this.$.content.children).forEach(c => this.$.content.removeChild(c));
                this._renderedAttributeElement = this._renderedAttribute = null;
            }

            if (attribute && isConnected) {
                this._setLoading(true);

                if (!this.getAttribute("height"))
                    this.height = this.app.configuration.getAttributeConfig(attribute).calculateHeight(attribute);

                let attributeType: string;
                if (Vidyano.Service.isNumericType(attribute.type))
                    attributeType = "Numeric";
                else if (Vidyano.Service.isDateTimeType(attribute.type))
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
            const typeSynonyms: { [key: string]: string[]; } = {
                "Boolean": ["YesNo"],
                "DropDown": ["Enum"],
                "String": ["Guid", "NullableGuid"],
                "User": ["NullableUser"]
            };

            let synonyms: string[];
            for (const key in typeSynonyms) {
                if (key === type)
                    synonyms = typeSynonyms[key];
                else if (typeSynonyms[key].indexOf(type) >= 0) {
                    type = key;
                    synonyms = typeSynonyms[key];
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
            if (!this.isConnected || attribute !== this.attribute || this._renderedAttribute === attribute)
                return;

            let focusTarget: HTMLElement;
            try {
                const config = <PersistentObjectAttributeConfig>this.app.configuration.getAttributeConfig(attribute);
                this.noLabel = this.noLabel || (config && !!config.noLabel);

                if (!!config && config.hasTemplate)
                    this.$.content.appendChild(config.stamp(attribute, config.as || "attribute"));
                else {
                    this._renderedAttributeElement = <WebComponents.Attributes.PersistentObjectAttribute>new (Vidyano.WebComponents.Attributes["PersistentObjectAttribute" + attributeType] || Vidyano.WebComponents.Attributes.PersistentObjectAttributeString)();
                    this._renderedAttributeElement.classList.add("attribute");
                    this._renderedAttributeElement.attribute = attribute;
                    this._renderedAttributeElement.nonEdit = this.nonEdit;
                    this._renderedAttributeElement.disabled = this.disabled;

                    this.$.content.appendChild(focusTarget = this._renderedAttributeElement);
                }

                this._renderedAttribute = attribute;
            }
            finally {
                this._setLoading(false);

                if (this._focusQueued) {
                    Polymer.flush();

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

        private _onFocus() {
            const element = <HTMLElement>this._renderedAttributeElement || Polymer.IronFocusablesHelper.getTabbableNodes(this.shadowRoot.host)[0];
            if (!element)
                return;

            this._focusElement(element);
        }

        private _loadingChanged(loading: boolean) {
            if (loading)
                this.fire("attribute-loading", { attribute: this.attribute }, { bubbles: true });
            else {
                Polymer.flush();
                this.fire("attribute-loaded", { attribute: this.attribute }, { bubbles: true });
            }
        }

        private _openAttributeManagement() {
            this.app.changePath(`Management/PersistentObject.1456569d-e02b-44b3-9d1a-a1e417061c77/${this.attribute.id}`);
        }

        _viConfigure(actions: IConfigurableAction[]) {
            if (this.attribute.parent.isSystem)
                return;

            actions.push({
                label: `Attribute: ${this.attribute.name}`,
                icon: "viConfigure",
                action: this._openAttributeManagement.bind(this)
            });
        }
    }
}