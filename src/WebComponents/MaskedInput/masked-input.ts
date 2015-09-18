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
            }
        },
        observers: [
            "_initialize(format, separator, isAttached)"
        ]
    })
    export class MaskedInput extends WebComponent {
        format: string;
        separator: string;

        private _initialize(format: string, separator: string, isAttached: boolean) {
            if (!isAttached)
                return;

            var mi = new window["MaskedInput"]({
                elm: this,
                format: format,
                separator: separator,
                onfilled: () => {
                    this.fire("filled", { value: (<HTMLInputElement><any>this).value });
                }
            });
        }
    }
}