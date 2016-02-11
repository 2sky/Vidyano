module Vidyano.WebComponents {
    export abstract class TemplateConfig extends WebComponent {
        template: PolymerTemplate;

        private _setTemplate: (template: PolymerTemplate) => void;

        attached() {
            super.attached();

            this._setTemplate(<PolymerTemplate>Polymer.dom(this).querySelector("template[is='dom-template']"));
        }

        static register(info?: WebComponentRegistrationInfo): (obj: any) => void {
            info.properties = info.properties || {};
            info.properties["template"] = {
                type: Object,
                readOnly: true
            };

            return WebComponent.register(info);
        }
    }
}