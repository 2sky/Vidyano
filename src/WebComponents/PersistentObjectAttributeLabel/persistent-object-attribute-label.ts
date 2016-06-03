namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            attribute: Object,
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
            required: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeRequired(attribute, attribute.isRequired, attribute.value)"
            },
            disabled: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            readOnly: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeReadOnly(attribute.isReadOnly, disabled)"
            },
            bulkEdit: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "attribute.parent.isBulkEdit"
            },
            hasError: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasError(attribute.validationError)"
            }
        },
        forwardObservers: [
            "attribute.parent.isEditing",
            "attribute.isRequired",
            "attribute.isReadOnly",
            "attribute.value",
            "attribute.validationError",
            "attribute.parent.isBulkEdit"
        ]
    })
    export class PersistentObjectAttributeLabel extends WebComponent {
        private _computeRequired(attribute: Vidyano.PersistentObjectAttribute, required: boolean, value: any): boolean {
            return required && (value == null || (attribute && attribute.rules && attribute.rules.contains("NotEmpty") && value === ""));
        }

        private _computeReadOnly(isReadOnly: boolean, disabled: boolean): boolean {
            return isReadOnly || disabled;
        }

        private _computeEditing(isEditing: boolean, nonEdit: boolean): boolean {
            return !nonEdit && isEditing;
        }

        private _computeHasError(validationError: string): boolean {
            return !StringEx.isNullOrEmpty(validationError);
        }
    }
}