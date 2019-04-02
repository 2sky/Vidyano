/* tslint:disable:no-var-keyword */
/* tslint:disable:no-use-before-declare */
var marked;
marked.defaults.breaks = true;
/* tslint:enable:no-var-keyword */
/* tslint:enable:no-use-before-declare */

namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register()
    export class PersistentObjectAttributeCommonMark extends PersistentObjectAttribute {
        private _editTextAreaBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true).catch(Vidyano.noop);
        }
    }
}