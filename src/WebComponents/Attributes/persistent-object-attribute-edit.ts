namespace Vidyano.WebComponents.Attributes {
    "use strict";

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
            "attribute.validationError",
            "attribute.parent.isFrozen"
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

        private _computeHasError(validationError: string): boolean {
            return !!validationError;
        }
    }
}