module Vidyano.WebComponents {
    export class PersistentObjectAttributePresenter extends WebComponent {
        attribute: Vidyano.PersistentObjectAttribute;

        private _attributeChanged(newAttribute: Vidyano.PersistentObjectAttribute, isAttached: boolean) {
            if (Polymer.dom(this).children.length > 0)
                this.empty();

            if (newAttribute) {
                var config = this.app.configuration.getAttributeConfig(newAttribute);
                if (config && config.template) {
                    var template = (<any>document).createElement("template", "dom-bind");
                    template.attribute = newAttribute;

                    var fragmentClone = <HTMLElement>document.importNode(config.template.content, true);
                    while (fragmentClone.children.length > 0)
                        template.content.appendChild(fragmentClone.children[0]);
                    
                    var container = document.createElement("div");
                    container.className = "layout horizontal";
                    container.appendChild(template);

                    Polymer.dom(this).appendChild(container);

                    return;
                }

                var attributeType: string;
                if (Vidyano.Service.isNumericType(newAttribute.type))
                    attributeType = "Numeric";
                else if (Vidyano.Service.isDateTimeType(newAttribute.type))
                    attributeType = "DateTime";
                else
                    attributeType = newAttribute.type;

                var child = <WebComponents.Attributes.PersistentObjectAttribute>new (Vidyano.WebComponents.Attributes["PersistentObjectAttribute" + attributeType] || Vidyano.WebComponents.Attributes.PersistentObjectAttributeString)();
                Polymer.dom(this).appendChild(child.asElement);

                child.attribute = newAttribute;
            }
        }
    }

    WebComponent.register(PersistentObjectAttributePresenter, WebComponents, "vi", {
        properties: {
            attribute: Object,
            nolabel: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        observers: [
            "_attributeChanged(attribute, isAttached)"
        ]
    });
}