namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            attribute: Object,
            hidden: {
                type: Boolean,
                computed: "_computeHidden(attribute.validationError, attribute.isReadOnly)",
                reflectToAttribute: true,
                value: true
            }
        },
        listeners: {
            "tap": "_showError"
        },
        forwardObservers: [
            "attribute.validationError",
            "attribute.isReadOnly"
        ]
    })
    export class PersistentObjectAttributeValidationError extends WebComponents.WebComponent {
        attribute: Vidyano.PersistentObjectAttribute;

        private _computeHidden(validationError: string, isReadOnly: boolean): boolean {
            return !validationError || isReadOnly;
        }

        private _showError(e: Polymer.TapEvent) {
            e.stopPropagation();

            this.app.showMessageDialog({
                title: this.app.translateMessage(NotificationType[NotificationType.Error]),
                titleIcon: "Notification_Error",
                actions: [this.translations.OK],
                message: this.attribute.validationError
            });
        }
    }
}