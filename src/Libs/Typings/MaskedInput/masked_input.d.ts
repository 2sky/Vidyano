interface MaskedInputOptions {
    /*
     * text input node to apply the mask on.
     */
    elm: HTMLInputElement;

    /*
     * Format for the mask.
     */
    format: string;

    /*
     * Chars allowed to be typed.
     */
    allowed?: string;

    /*
     * Function to call for additional validation on a
     * given character at an index. Sends arguments character, index.
     * The index starts at 1 for the first character.
     */
    allowedfx?: (char: string, index: number) => boolean;

    /*
     * String of char(s) used as separators in mask.
     */
    sep?: string;

    /*
     * String of chars in mask that can be typed on.
     */
    typeon?: string;

    /*
     * Function to run when the format is filled in.
     */
    onfilled?: () => void;

    /*
     * Function to run when user types a unallowed key.
     */
    onbadkey?: () => void;

    /*
     * Used with onbadkey. Indicates how long (in ms)
     * to lock text input for onbadkey function to run.
     */
    badkeywait?: number;

    /*
     * Whether to preserve existing text in
     * field during init.
     */
    preserve?: boolean;
}

interface MaskedInput {
    /*
        * Resets the text field so just the format is present.
        */
    resetField: () => void;

    /*
        * Set the allowed characters that can be used in the mask.
        * @param a string of characters that can be used.
        */
    setAllowed: (a: string) => void;

    /*
        * The format to be used in the mask.
        * @param f string of the format.
        */
    setFormat: (f: string) => void;

    /*
        * Set the characters to be used as separators.
        * @param s string representing the separator characters.
        */
    setSeparator: (s: string) => void;

    /*
        * Set the characters that the user will be typing over.
        * @param t string representing the characters that will be typed over.
        */
    setTypeon: (t: string) => void;

    /*
        * Sets whether the mask is active.
        */
    setEnabled: (f: string) => void;
}

interface MaskedInputStatic {
    (args: MaskedInputOptions): MaskedInput;
}

declare var MaskedInput: MaskedInputStatic;