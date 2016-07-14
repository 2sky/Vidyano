/* tslint:disable:no-var-keyword */
/* tslint:disable:no-use-before-declare */
if (!_markedWithoutSoftbreaks) {
    var marked;
    var _markedWithoutSoftbreaks = marked;
    marked = function marked(markdown, opts) {
        opts.breaks = true;

        return _markedWithoutSoftbreaks(markdown, opts);
    };
}
/* tslint:enable:no-var-keyword */
/* tslint:enable:no-use-before-declare */

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