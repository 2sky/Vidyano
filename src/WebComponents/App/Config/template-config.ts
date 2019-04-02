namespace Vidyano.WebComponents {
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
        },
        hostAttributes: {
            "slot": "vi-app-config"
        }
    })
    export abstract class TemplateConfig<T> extends WebComponent {
        private __template: HTMLTemplateElement;
        readonly hasTemplate: boolean; private _setHasTemplate: (val: boolean) => void;
        as: string;
        asModel: (model: T) => any;

        constructor() {
            super();

            this.setAttribute("slot", "vi-app-config");
        }

        connectedCallback() {
            super.connectedCallback();

            this._setHasTemplate(!!(this.__template = <HTMLTemplateElement>this.querySelector("template")));
        }

        get template() {
            return this.__template;
        }

        stamp(obj: T, as: string = this.as, asModel: (model: T) => any = this.asModel): DocumentFragment {
            if (!this.hasTemplate)
                return document.createDocumentFragment();

            const model = {};
            model[as] = !!asModel ? asModel(obj) : obj;

            const templateClass = Polymer.Templatize.templatize(this.__template);
            return new templateClass(model).root;
        }
    }
}