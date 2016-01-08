module Vidyano.WebComponents {
    @WebComponent.register({
        extends: "input",
        properties: {
            format: {
                type: String,
                reflectToAttribute: true
            },
            separator: {
                type: String,
                reflectToAttribute: true
            },
            readonly: {
                type: Boolean,
                reflectToAttribute: true,
                observer: "_readonlyChanged"
            }
        },
        observers: [
            "_initialize(format, separator, isAttached)"
        ]
    })
    export class MaskedInput extends WebComponent {
        private _maskedInput: {
            resetField: () => void;
            setAllowed: (val: string) => void;
            setFormat: (val: string) => void;
            setSeparator: (val: string) => void;
            setTypeon: (val: string) => void;
            setEnabled: (val: boolean) => void;
        };
        format: string;
        separator: string;
        readonly: boolean;

        private _initialize(format: string, separator: string, isAttached: boolean) {
            if (!isAttached)
                return;

            this._maskedInput = new window["MaskedInput"]({
                elm: this,
                format: format,
                separator: separator,
                onfilled: () => {
                    this.fire("filled", { value: (<HTMLInputElement><any>this).value });
                }
            });

            this._readonlyChanged();
        }

        private _readonlyChanged() {
            this.setEnabled(!this.readonly);
        }

        /**
		 * Resets the text field so just the format is present.
		 */
        resetField() {
            if (this._maskedInput)
                this._maskedInput.resetField();
        }

        /**
		 * Set the allowed characters that can be used in the mask.
		 * @param a string of characters that can be used.
		 */
        setAllowed(a: string) {
            if (this._maskedInput)
                this._maskedInput.setAllowed(a);
        }

        /**
		 * The format to be used in the mask.
		 * @param f string of the format.
		 */
        setFormat(f: string) {
            if (this._maskedInput)
                this._maskedInput.setFormat(f);
        }

        /**
		 * Set the characters to be used as separators.
		 * @param s string representing the separator characters.
		 */
        setSeparator(s: string) {
            if (this._maskedInput)
                this._maskedInput.setSeparator(s);
        }

        /**
		 * Set the characters that the user will be typing over.
		 * @param t string representing the characters that will be typed over.
		 */
        setTypeon(t: string) {
            if (this._maskedInput)
                this._maskedInput.setTypeon(t);
        }

        /**
		 * Sets whether the mask is active.
		 */
        setEnabled(val: boolean) {
            if (this._maskedInput)
                this._maskedInput.setEnabled(val);
        }
    }
}