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