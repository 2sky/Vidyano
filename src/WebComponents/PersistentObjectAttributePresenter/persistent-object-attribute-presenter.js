var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var PersistentObjectAttributePresenter = (function (_super) {
            __extends(PersistentObjectAttributePresenter, _super);
            function PersistentObjectAttributePresenter() {
                _super.apply(this, arguments);
            }
            PersistentObjectAttributePresenter.prototype._attributeChanged = function (newAttribute, isAttached) {
                if (Polymer.dom(this).children.length > 0)
                    this.empty();
                if (newAttribute) {
                    var config = this.app.configuration.getAttributeConfig(newAttribute);
                    if (config && config.template) {
                        var template = document.createElement("template", "dom-bind");
                        template.attribute = newAttribute;
                        var fragmentClone = document.importNode(config.template.content, true);
                        while (fragmentClone.children.length > 0)
                            template.content.appendChild(fragmentClone.children[0]);
                        var container = document.createElement("div");
                        container.className = "layout horizontal";
                        container.appendChild(template);
                        Polymer.dom(this).appendChild(container);
                        return;
                    }
                    var attributeType;
                    if (Vidyano.Service.isNumericType(newAttribute.type))
                        attributeType = "Numeric";
                    else if (Vidyano.Service.isDateTimeType(newAttribute.type))
                        attributeType = "DateTime";
                    else
                        attributeType = newAttribute.type;
                    var child = new (Vidyano.WebComponents.Attributes["PersistentObjectAttribute" + attributeType] || Vidyano.WebComponents.Attributes.PersistentObjectAttributeString)();
                    Polymer.dom(this).appendChild(child.asElement);
                    child.attribute = newAttribute;
                }
            };
            return PersistentObjectAttributePresenter;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectAttributePresenter = PersistentObjectAttributePresenter;
        WebComponents.WebComponent.register(PersistentObjectAttributePresenter, WebComponents, "vi", {
            properties: {
                attribute: Object,
                noLabel: {
                    type: Boolean,
                    reflectToAttribute: true
                }
            },
            observers: [
                "_attributeChanged(attribute, isAttached)"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
