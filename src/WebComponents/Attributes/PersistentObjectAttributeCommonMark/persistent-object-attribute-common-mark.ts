namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            markedElementLoaded: {
                type: Boolean,
                readOnly: true
            },
            notEditing: {
                type: Boolean,
                computed: "_computeNotEditing(markedElementLoaded, editing)"
            }
        }
    })
    export class PersistentObjectAttributeCommonMark extends PersistentObjectAttribute {
        private _setMarkedElementLoaded: (ValidityState: boolean) => void;

        constructor() {
            super();

            this.importHref(this.resolveUrl("../../../Libs/marked-element/marked-element.html"), e => {
                this._setMarkedElementLoaded(true);
            });
        }

        private _editTextAreaBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true).catch(Vidyano.noop);
        }

        private _computeNotEditing(markedElementLoaded: boolean, editing: boolean): boolean {
            return markedElementLoaded && !editing;
        }
    }
}