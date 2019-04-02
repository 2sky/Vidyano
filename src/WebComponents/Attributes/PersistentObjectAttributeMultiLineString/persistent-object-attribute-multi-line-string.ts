namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            maxlength: Number,
            useCodeMirror: {
                type: Boolean,
                computed: "_computeUseCodeMirror(codeMirror, sensitive)"
            },
            codeMirror: {
                type: String,
                computed: "_computeCodeMirror(attribute)",
                value: ""
            },
            isCodeMirrorReadOnly: {
                type: Boolean,
                computed: "_computeIsCodeMirrorReadOnly(readOnly, editing)"
            }
        }
    })
    export class PersistentObjectAttributeMultiLineString extends PersistentObjectAttribute {
        maxlength: number;

        protected _attributeChanged() {
            super._attributeChanged();

            if (this.attribute) {
                const maxlength = parseInt(this.attribute.getTypeHint("MaxLength", "0"), 10);
                this.maxlength = maxlength > 0 ? maxlength : null;
            }
        }

        private _editTextAreaBlur() {
            if (this.attribute && this.attribute.isValueChanged && this.attribute.triggersRefresh)
                this.attribute.setValue(this.value = this.attribute.value, true).catch(Vidyano.noop);
        }

        private _computeCodeMirror(attribute: Vidyano.PersistentObjectAttribute): string {
            const codeMirror = attribute ? attribute.getTypeHint("language", null) : null;
            if (codeMirror)
                this.importHref(this.resolveUrl("../../CodeMirror/code-mirror.html"));

            return codeMirror;
        }

        private _computeIsCodeMirrorReadOnly(readOnly: boolean, editing: boolean): boolean {
            return readOnly || !editing;
        }

        private _computeUseCodeMirror(codeMirror: boolean, sensitive: boolean): boolean {
            return codeMirror && !sensitive;
        }
    }
}