namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.registerAbstract({
        properties: {
            hasTemplate: {
                type: Boolean,
                readOnly: true
            },
            as: {
                type: String,
                reflectToAttribute: true
            }
        }
    })
    export abstract class TemplateConfig<T> extends WebComponent {
        private _template: PolymerTemplate;
        readonly hasTemplate: boolean; private _setHasTemplate: (val: boolean) => void;
        as: string;
        asModel: (model: T) => any;

        attached() {
            super.attached();

            this._template = <PolymerTemplate>Polymer.dom(this).querySelector("template[is='dom-template']");
            this._setHasTemplate(!!this._template);
        }

        stamp(obj: T, as: string = this.as, asModel: (model: T) => any = this.asModel): DocumentFragment {
            if (!this.hasTemplate)
                return document.createDocumentFragment();

            const model = {};
            model[as] = !!asModel ? asModel(obj) : obj;

            return this._template.stamp(model).root;
        }
    }
}