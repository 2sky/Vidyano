module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            dataContextName: String,
            dataContext: Object
        },
        observers: [
            "_render(dataContextName, dataContext)"
        ]
    })
    export class TemplatePresenter extends WebComponent {
        private _domBindTemplate: any;

        constructor(private _sourceTemplate: any, public dataContextName?: string, public dataContext?: any) {
            super();
        }

        private _render(dataContextName: string, dataContext: any) {
            if (!this._domBindTemplate) {
                this._domBindTemplate = (<any>document).createElement("template", "dom-bind");
                this._domBindTemplate[dataContextName] = dataContext;

                this._domBindTemplate.innerHTML = this._sourceTemplate.innerHTML;

                Polymer.dom(this).appendChild(this._domBindTemplate);
            }
            else
                this._domBindTemplate[dataContextName] = dataContext;
        }
    }
}