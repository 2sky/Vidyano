module Vidyano.WebComponents {
    export class TemplatePresenter extends WebComponent {
        private _domBindTemplate: any;

        constructor(private _sourceTemplate: any, public dataContextName?: string, public dataContext?: any) {
            super();
        }

        private _render(dataContextName: string, dataContext: any) {
            if (!this._domBindTemplate) {
                this._domBindTemplate = (<any>document).createElement("template", "dom-bind");
                this._domBindTemplate[dataContextName] = dataContext;

                var fragmentClone = <HTMLElement>this._sourceTemplate.content;
                var html = "";
                Enumerable.from(fragmentClone.children).forEach(child => {
                    html += (<HTMLElement>child).outerHTML;
                });

                this._domBindTemplate.innerHTML = html;

                Polymer.dom(this).appendChild(this._domBindTemplate);
            }
            else
                this._domBindTemplate[dataContextName] = dataContext;
        }
    }

    WebComponent.register(TemplatePresenter, WebComponents, "vi", {
        properties: {
            dataContextName: String,
            dataContext: Object
        },
        observers: [
            "_render(dataContextName, dataContext)"
        ]
    });
}