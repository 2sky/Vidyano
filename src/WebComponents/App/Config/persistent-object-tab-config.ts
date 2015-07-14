module Vidyano.WebComponents {
    export class PersistentObjectTabConfig extends WebComponent {
        name: string;
        type: string;
        objectId: string;
        template: any;

        private _setTemplate: (template: HTMLElement) => void;

        attached() {
            super.attached();

            this._setTemplate(<HTMLElement>Polymer.dom(this).querySelector("template"));
        }
    }

    WebComponent.register(PersistentObjectTabConfig, WebComponents, "vi", {
        properties: {
            name: String,
            type: String,
            objectId: String,
            template: {
                type: Object,
                readOnly: true
            }
        }
    });
}