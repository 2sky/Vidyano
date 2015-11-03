module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            type: String,
            template: {
                type: Object,
                readOnly: true
            }
        }
    })
    export class QueryChartConfig extends WebComponent {
        type: string;
        template: any;

        private _setTemplate: (template: HTMLElement) => void;

        attached() {
            super.attached();

            this._setTemplate(<HTMLElement>Polymer.dom(this).querySelector("template"));
        }
    }
}