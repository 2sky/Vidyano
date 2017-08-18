type CM = CodeMirror.EditorFromTextArea;
const CMFromTextArea = CodeMirror.fromTextArea;

namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            size: Object,
            value: {
                type: String,
                notify: true,
                observer: "_valueChanged",
                value: null
            },
            mode: {
                type: String,
                reflectToAttribute: true
            },
            lineNumbers: {
                type: Boolean,
                reflectToAttribute: true,
                value: true
            },
            smartIndent: {
                type: Boolean,
                reflectToAttribute: true,
                value: true
            },
            initialized: {
                type: Boolean,
                computed: "_initialize(mode, isConnected)"
            },
            readOnly: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            }
        },
        observers: [
            "_refresh(size, initialized)",
            "_modeChanged(mode, initialized)",
            "_lineNumbersChanged(lineNumbers, initialized)",
            "_smartIndentChanged(smartIndent, initialized)",
            "_readOnlyChanged(readOnly, initialized)"
        ]
    })
    export class CodeMirror extends WebComponents.WebComponent {
        private _codeMirror: CM;
        private _codeMirrorValueChangedHandler: (codeMirror: CM) => void;
        initialized: boolean;
        readOnly: boolean;
        value: string;

        private _initialize(mode: string, isConnected: boolean): boolean {
            if (!mode || !isConnected) {
                if (this._codeMirrorValueChangedHandler) {
                    this._codeMirror.off("change", this._codeMirrorValueChangedHandler);
                    this._codeMirrorValueChangedHandler = null;
                }

                return false;
            }

            if (!this._codeMirror) {
                const textArea = <HTMLTextAreaElement>this.$.target;
                this._codeMirror = CMFromTextArea(textArea, {
                    value: textArea.value = this.value
                });
            }

            if (!this._codeMirrorValueChangedHandler) {
                this._codeMirror.on("change", this._codeMirrorValueChangedHandler = this._codeMirrorValueChanged.bind(this));
            }

            return true;
        }

        private _refresh(size: ISize, initialized: boolean) {
            if (!initialized)
                return;

            this._codeMirror.refresh();
            this._codeMirror.setSize(size.width, size.height);
        }

        private _codeMirrorValueChanged() {
            const value = this._codeMirror.getValue();
            if (value !== this.value && !this.readOnly)
                this.value = value;
        }

        private _valueChanged(newValue: string) {
            if (!this.initialized)
                return;

            const cmValue = this._codeMirror.getValue();
            if (cmValue !== newValue) {
                if (this.readOnly)
                    this._codeMirror.setOption("readOnly", false);

                this._codeMirror.setValue(newValue);

                if (this.readOnly)
                    this._codeMirror.setOption("readOnly", true);
            }
        }

        private _modeChanged(mode: string, initialized: boolean) {
            if (!initialized)
                return;

            this._codeMirror.setOption("mode", mode ? mode.toLowerCase() : mode);
        }

        private _lineNumbersChanged(lineNumbers: boolean, initialized: boolean) {
            if (!initialized)
                return;

            this._codeMirror.setOption("lineNumbers", lineNumbers);
        }

        private _smartIndentChanged(smartIndent: boolean, initialized: boolean) {
            if (!initialized)
                return;

            this._codeMirror.setOption("smartIndent", smartIndent);
        }

        private _readOnlyChanged(readOnly: boolean, initialized: boolean) {
            if (!initialized)
                return;

            this._codeMirror.setOption("readOnly", readOnly);
        }
    }
}