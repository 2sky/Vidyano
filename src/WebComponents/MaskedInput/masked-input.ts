module Vidyano.WebComponents {
    export class MaskedInput extends WebComponent {
        format: string;
        separator: string;

        private _initialize(format: string, separator: string, isAttached: boolean) {
            if (!isAttached)
                return;

            var mi = new window["MaskedInput"]({
                elm: this.asElement,
                format: format,
                separator: separator,
                onfilled: () => {
                    var input = <HTMLInputElement>this.asElement;
                    this.fire("filled", { value: input.value });
                }
            });
        }
    }

    WebComponent.register(MaskedInput, WebComponents, "vi", {
        properties: {
            format: {
                type: String,
                reflectToAttribute: true
            },
            separator: {
                type: String,
                reflectToAttribute: true
            }
        },
        observers: [
            "_initialize(format, separator, isAttached)"
        ],
        extends: "input"
    });
}