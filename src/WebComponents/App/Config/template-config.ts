namespace Vidyano.WebComponents {
    "use strict";

    export abstract class TemplateConfig<T> extends WebComponent {
        private _template: PolymerTemplate;
        hasTemplate: boolean;
        as: string;
        asModel: (model: T) => any;

        private _setHasTemplate: (val: boolean) => void;

        attached() {
            super.attached();

            this._template = <PolymerTemplate>Polymer.dom(this).querySelector("template[is='dom-template']");
            this._setHasTemplate(!!this._template);

            if (!this.app)
                debugger;
        }

        stamp(obj: T, as: string = this.as, asModel: (model: T) => any = this.asModel): DocumentFragment {
            if (!this.hasTemplate)
                return document.createDocumentFragment();

            const model = {};
            model[as] = !!asModel ? asModel(obj) : obj;

            return this._template.stamp(model).root;
        }

        static register(info?: IWebComponentRegistrationInfo): (obj: any) => void {
            info.properties = info.properties || {};
            info.properties["hasTemplate"] = {
                type: Boolean,
                readOnly: true
            };
            info.properties["as"] = {
                type: String,
                reflectToAttribute: true
            };

            return WebComponent.register(info);
        }
    }
}