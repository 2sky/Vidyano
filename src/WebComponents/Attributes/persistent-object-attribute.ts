// https://gist.github.com/nuxodin/9250e56a3ce6c0446efa
/* focusin/out event polyfill (firefox) */
(function () {
    const w = window,
          d = w.document;

    if ((<any>w).onfocusin === undefined) {
        d.addEventListener("focus", addPolyfill, true);
        d.addEventListener("blur", addPolyfill, true);
        d.addEventListener("focusin", removePolyfill, true);
        d.addEventListener("focusout", removePolyfill, true);
    }
    function addPolyfill(e) {
        const type = e.type === "focus" ? "focusin" : "focusout";
        const event = new CustomEvent(type, { bubbles: true, cancelable: false });
        (<any>event).c1Generated = true;
        e.target.dispatchEvent(event);
    }
    function removePolyfill(e) {
        if (!e.c1Generated) { // focus after focusin, so chrome will the first time trigger tow times focusin
            d.removeEventListener("focus", addPolyfill, true);
            d.removeEventListener("blur", addPolyfill, true);
            d.removeEventListener("focusin", removePolyfill, true);
            d.removeEventListener("focusout", removePolyfill, true);
        }
        setTimeout(function () {
            d.removeEventListener("focusin", removePolyfill, true);
            d.removeEventListener("focusout", removePolyfill, true);
        });
    }

})();

namespace Vidyano.WebComponents.Attributes {
    "use strict";

    export class PersistentObjectAttribute extends WebComponent {
        static typeSynonyms: { [key: string]: string[]; } = {
            "Boolean": ["YesNo"],
            "DropDown": ["Enum"],
            "String": ["Guid", "NullableGuid"],
            "User": ["NullableUser"]
        };

        private _foreground: string;
        attribute: Vidyano.PersistentObjectAttribute;
        value: any;
        editing: boolean;
        nonEdit: boolean;
        readOnly: boolean;
        disabled: boolean;

        protected _attributeValueChanged() {
            this.value = this.attribute.value !== undefined ? this.attribute.value : null;
        }

        protected _optionsChanged(options: string[] | Common.IKeyValuePair[]) {
            // Noop
        }

        protected _attributeChanged() {
            // Noop
        }

        protected _editingChanged() {
            // Noop
        }

        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, false).catch(Vidyano.noop);
        }

        private _computeHasError(validationError: string): boolean {
            return !StringEx.isNullOrEmpty(validationError);
        }

        private _computeEditing(isEditing: boolean, nonEdit: boolean): boolean {
            return !nonEdit && isEditing;
        }

        private _computeIsReadOnly(isReadOnly: boolean, disabled: boolean): boolean {
            return isReadOnly || disabled;
        }

        private _computePlaceholder(attribute: Vidyano.PersistentObjectAttribute): string {
            return attribute ? this.attribute.getTypeHint("placeholder", "", void 0, true) : "";
        }

        private _computeOptions(options: string[] | Common.IKeyValuePair[], isRequired: boolean, type: string): string[] | Common.IKeyValuePair[] {
            if (!options || options.length === 0 || isRequired || ["KeyValueList", "DropDown", "ComboBox"].indexOf(type) === -1)
                return options;

            if (typeof options[0] === "string") {
                if ((<string[]>options).some(o => o == null))
                    return options;

                return [null].concat(options);
            }

            if ((<Common.IKeyValuePair[]>options).some(o => !o.key))
                return options;

            return [{ key: null, value: "" }].concat((<Common.IKeyValuePair[]>options));
        }

        private _updateForegroundDataTypeHint(attribute: Vidyano.PersistentObjectAttribute, isEditing: boolean, isReadOnly: boolean) {
            const foreground = this.attribute.getTypeHint("foreground", null, true);

            if ((!isEditing || isReadOnly) && foreground) {
                this._foreground = this.customStyle["--vi-persistent-object-attribute-foreground"] = foreground;
                this.updateStyles();
            }
            else if (this._foreground) {
                this._foreground = this.customStyle["--vi-persistent-object-attribute-foreground"] = null;
                this.updateStyles();
            }
        }

        protected _onFocus(e: FocusEvent) {
            Polymer.dom(this).flush();

            const target = <HTMLElement>this._getFocusableElement(this.root);
            if (!target)
                return;

            target.focus();
        }

        static register(info: IWebComponentRegistrationInfo = {}): any {
            if (typeof info === "function")
                return PersistentObjectAttribute.register({})(info);

            return (obj: Function) => {
                info.properties = info.properties || {};

                info.properties["attribute"] = {
                    type: Object,
                    observer: "_attributeChanged"
                };
                info.properties["editing"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_computeEditing(attribute.parent.isEditing, nonEdit)"
                };
                info.properties["nonEdit"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false
                };
                info.properties["disabled"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    value: false
                };
                info.properties["readOnly"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_computeIsReadOnly(attribute.isReadOnly, disabled)"
                };
                info.properties["required"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "attribute.isRequired"
                };
                info.properties["value"] = {
                    type: Object,
                    notify: true,
                    observer: "_valueChanged"
                };
                info.properties["placeholder"] = {
                    type: String,
                    computed: "_computePlaceholder(attribute)"
                };
                info.properties["validationError"] = {
                    type: Object,
                    notify: true,
                    computed: "attribute.validationError"
                };
                info.properties["hasError"] = {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_computeHasError(attribute.validationError)"
                };
                info.properties["options"] = {
                    type: Array,
                    computed: "_computeOptions(attribute.options, attribute.isRequired, attribute.type)",
                    observer: "_optionsChanged"
                };

                info.forwardObservers = info.forwardObservers || [];
                info.forwardObservers.push("attribute.displayValue");
                info.forwardObservers.push("attribute.isRequired");
                info.forwardObservers.push("attribute.isReadOnly");
                info.forwardObservers.push("attribute.options");
                info.forwardObservers.push("attribute.validationError");
                info.forwardObservers.push("attribute.parent.isFrozen");
                info.forwardObservers.push("_editingChanged(attribute.parent.isEditing)");
                info.forwardObservers.push("_attributeValueChanged(attribute.value)");

                info.observers = info.observers || [];
                info.observers.push("_updateForegroundDataTypeHint(attribute, editing, readOnly)");

                info.listeners = info.listeners || {};
                info.listeners["focus"] = "_onFocus";

                info.hostAttributes = info.hostAttributes || {};
                info.hostAttributes["tabindex"] = "-1";

                const ctor = WebComponent.register(obj, info);

                const synonyms = Vidyano.WebComponents.Attributes.PersistentObjectAttribute.typeSynonyms[WebComponent.getName(obj).replace("PersistentObjectAttribute", "")];
                if (synonyms) {
                    synonyms.forEach(ss => {
                        Attributes["PersistentObjectAttribute" + ss] = ctor;
                    });
                }

                return ctor;
            };
        }
    }
}