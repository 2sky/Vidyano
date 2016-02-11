module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            id: {
                type: String,
                reflectToAttribute: true
            },
            objectId: {
                type: String,
                reflectToAttribute: true
            },
            template: {
                type: Object,
                readOnly: true
            }
        }
    })
    export class PersistentObjectConfig extends WebComponent {
        id: string;
        objectId: string;
        template: any;

        private _setTemplate: (template: HTMLElement) => void;

        attached() {
            super.attached();

            this._setTemplate(<HTMLElement>Polymer.dom(this).querySelector("template"));
        }
    }
}