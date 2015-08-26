module Vidyano.WebComponents {
    export class ProgramUnitConfig extends WebComponent {
        name: string;
        template: any;

        private _setTemplate: (template: HTMLElement) => void;

        attached() {
            super.attached();

            this._setTemplate(<HTMLElement>Polymer.dom(this).querySelector("template"));
        }
    }

    WebComponent.register(ProgramUnitConfig, WebComponents, "vi", {
        properties: {
            name: String,
            template: {
                type: Object,
                readOnly: true
            }
        }
    });
}