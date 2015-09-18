module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            name: String,
            template: {
                type: Object,
                readOnly: true
            }
        }
    })
    export class ProgramUnitConfig extends WebComponent {
        name: string;
        template: any;

        private _setTemplate: (template: HTMLElement) => void;

        attached() {
            super.attached();

            this._setTemplate(<HTMLElement>Polymer.dom(this).querySelector("template"));
        }
    }
}