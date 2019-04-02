namespace Vidyano.WebComponents.Attributes {

    @WebComponent.registerAbstract({
        properties: {
            attribute: {
                type: Object,
                observer: "_attributeChanged"
            },
            editing: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeEditing(attribute.parent.isEditing, nonEdit)"
            },
            nonEdit: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            readOnly: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeReadOnly(attribute.isReadOnly, disabled, sensitive)"
            },
            readOnlyTabIndex: {
                type: String,
                reflectToAttribute: true,
                computed: "_computeReadOnlyTabIndex(readOnly)"
            },
            required: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "attribute.isRequired"
            },
            appSensitive: {
                type: Boolean,
                readOnly: true
            },
            sensitive: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeSensitive(attribute.isSensitive, isAppSensitive, attribute.type)"
            },
            value: {
                type: Object,
                notify: true,
                observer: "_valueChanged"
            },
            placeholder: {
                type: String,
                computed: "_computePlaceholder(attribute)"
            },
            validationError: {
                type: Object,
                notify: true,
                computed: "attribute.validationError"
            },
            hasError: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasError(attribute.validationError)"
            },
            options: {
                type: Array,
                computed: "_computeOptions(attribute.options, attribute.isRequired, attribute.type)",
                observer: "_optionsChanged"
            }
        },
        forwardObservers: [
            "attribute.displayValue",
            "attribute.isRequired",
            "attribute.isReadOnly",
            "attribute.isSensitive",
            "attribute.options",
            "attribute.validationError",
            "attribute.parent.isFrozen",
            "_editingChanged(attribute.parent.isEditing)",
            "_attributeValueChanged(attribute.value)"
        ],
        observers: [
            "_updateForegroundDataTypeHint(attribute, editing, readOnly)"
        ],
        listeners: {
            "focus": "_onFocus"
        },
        hostAttributes: {
            "tabindex": "-1"
        },
        sensitive: true
    })
    export abstract class PersistentObjectAttribute extends WebComponent {
        private _foreground: string;
        attribute: Vidyano.PersistentObjectAttribute;
        value: any;
        editing: boolean;
        nonEdit: boolean;
        readOnly: boolean;
        disabled: boolean;
        sensitive: boolean;

        protected _attributeValueChanged() {
            this.value = this.attribute.value !== undefined ? this.attribute.value : null;
        }

        protected _optionsChanged(options: string[] | PersistentObjectAttributeOption[]) {
            // Noop
        }

        protected _attributeChanged() {
            // Noop
        }

        protected _editingChanged() {
            // Noop
        }

        protected _valueChanged(newValue: any, oldValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, false).catch(Vidyano.noop);
        }

        private _computeHasError(validationError: string): boolean {
            return !StringEx.isNullOrEmpty(validationError);
        }

        private _computeEditing(isEditing: boolean, nonEdit: boolean): boolean {
            return !nonEdit && isEditing;
        }

        private _computeReadOnly(isReadOnly: boolean, disabled: boolean, sensitive: boolean): boolean {
            return isReadOnly || disabled || sensitive;
        }

        private _computeReadOnlyTabIndex(readOnly: boolean): string {
            return readOnly ? "-1" : null;
        }

        private _computeSensitive(isSensitive: boolean, isAppSensitive: boolean, type: string): boolean {
            return isSensitive && isAppSensitive && type !== "AsDetail";
        }

        private _computePlaceholder(attribute: Vidyano.PersistentObjectAttribute): string {
            return attribute ? this.attribute.getTypeHint("placeholder", "", void 0, true) : "";
        }

        private _computeOptions(options: string[] | PersistentObjectAttributeOption[], isRequired: boolean, type: string): string[] | PersistentObjectAttributeOption[] {
            if (!options || options.length === 0 || isRequired || ["KeyValueList", "DropDown", "ComboBox"].indexOf(type) === -1)
                return options;

            if (typeof options[0] === "string" || options[0] == null) {
                if ((<string[]>options).some(o => o == null))
                    return options;

                return [null].concat(options);
            }

            if ((<PersistentObjectAttributeOption[]>options).some(o => !o.key))
                return options;

            return [{ key: null, value: "" }].concat((<PersistentObjectAttributeOption[]>options));
        }

        private _updateForegroundDataTypeHint(attribute: Vidyano.PersistentObjectAttribute, isEditing: boolean, isReadOnly: boolean) {
            const foreground = this.attribute.getTypeHint("foreground", null, true);

            if ((!isEditing || isReadOnly) && foreground) {
                this.updateStyles({
                    "--vi-persistent-object-attribute-foreground": this._foreground = foreground
                });
            }
            else if (this._foreground) {
                this.updateStyles({
                    "--vi-persistent-object-attribute-foreground": this._foreground = null
                });
            }
        }

        protected _onFocus(e: FocusEvent) {
            Polymer.flush();

            if (this.shadowRoot.activeElement)
                return;

            const element = Polymer.IronFocusablesHelper.getTabbableNodes(this.shadowRoot.host)[0];
            if (!element)
                return;

            element.focus();
        }
    }
} 