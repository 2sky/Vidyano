var marked;
var _marked = marked;
marked = function marked(markdown, opts) {
    opts.breaks = true;

    return _marked(markdown, opts);
};

namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register
    export class PersistentObjectAttributeCommonMark extends PersistentObjectAttribute {
        private _editTextAreaBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true).catch(Vidyano.noop);
        }
    }
}