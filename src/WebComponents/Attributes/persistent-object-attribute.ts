// https://gist.github.com/nuxodin/9250e56a3ce6c0446efa
/* focusin/out event polyfill (firefox) */
!function () {
    var w = window,
        d = w.document;

    if ((<any>w).onfocusin === undefined) {
        d.addEventListener('focus', addPolyfill, true);
        d.addEventListener('blur', addPolyfill, true);
        d.addEventListener('focusin', removePolyfill, true);
        d.addEventListener('focusout', removePolyfill, true);
    }
    function addPolyfill(e) {
        var type = e.type === 'focus' ? 'focusin' : 'focusout';
        var event = new CustomEvent(type, { bubbles: true, cancelable: false });
        (<any>event).c1Generated = true;
        e.target.dispatchEvent(event);
    }
    function removePolyfill(e) {
        if (!e.c1Generated) { // focus after focusin, so chrome will the first time trigger tow times focusin
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

} ();

module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttribute extends WebComponent {
        static typeSynonyms: { [key: string]: string[]; } = {
            "Boolean": ["YesNo"],
            "DropDown": ["Enum"],
            "MultiLineString": ["MultiString"],
            "String": ["Guid", "NullableGuid"],
            "User": ["NullableUser"]
        };

        attribute: Vidyano.PersistentObjectAttribute;
        value: any;
        editing: boolean;
        readOnly: boolean;

        protected _attributeValueChanged() {
            this.value = this.attribute.value !== undefined ? this.attribute.value : null;
        }

        protected _optionsChanged() {
        }

        protected _attributeChanged() {
        }

        protected _editingChanged() {
        }

        protected _valueChanged(newValue: any) {
            if (this.attribute && newValue !== this.attribute.value)
                this.attribute.setValue(newValue, false);
        }

        private _computeHasError(validationError: string): boolean {
            return !StringEx.isNullOrEmpty(validationError);
        }

        static register(info: WebComponentRegistrationInfo = {}): any {
            if (typeof info == "function")
                return PersistentObjectAttribute.register({})(info);

            return (obj: Function) => {
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

                var ctor = WebComponent.register(obj, info);

                var synonyms = Vidyano.WebComponents.Attributes.PersistentObjectAttribute.typeSynonyms[WebComponent.getName(obj).replace("PersistentObjectAttribute", "")];
                if (synonyms) {
                    synonyms.forEach(ss => {
                        Attributes["PersistentObjectAttribute" + ss] = ctor;
                    });
                }

                return ctor;
            };
        }
    }

    @WebComponent.register({
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
    export class PersistentObjectAttributeEdit extends WebComponent {
        private _setFocus: (val: boolean) => void;
        attribute: Vidyano.PersistentObjectAttribute;

        private _focus(e: Event) {
            this._setFocus(true);
        }

        private _blur(e: Event) {
            this._setFocus(false);
        }

        private _showError() {
            if (!this.attribute || !this.attribute.validationError)
                return;

            this.app.showMessageDialog({
                title: this.app.translateMessage(NotificationType[NotificationType.Error]),
                titleIcon: "Notification_Error",
                actions: [this.translations.OK],
                message: this.attribute.validationError
            });
        }

        private _computeHasError(validationError: string): boolean {
            return !StringEx.isNullOrEmpty(validationError);
        }
    }
}