var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var TemplatePresenter = (function (_super) {
            __extends(TemplatePresenter, _super);
            function TemplatePresenter(_sourceTemplate, dataContextName, dataContext) {
                _super.call(this);
                this._sourceTemplate = _sourceTemplate;
                this.dataContextName = dataContextName;
                this.dataContext = dataContext;
            }
            TemplatePresenter.prototype._render = function (dataContextName, dataContext) {
                if (!this._domBindTemplate) {
                    this._domBindTemplate = document.createElement("template", "dom-bind");
                    this._domBindTemplate[dataContextName] = dataContext;
                    var fragmentClone = this._sourceTemplate.content;
                    var html = "";
                    Enumerable.from(fragmentClone.children).forEach(function (child) {
                        html += child.outerHTML;
                    });
                    this._domBindTemplate.innerHTML = html;
                    var container = document.createElement("div");
                    container.appendChild(this._domBindTemplate);
                    Polymer.dom(this).appendChild(container);
                }
                else
                    this._domBindTemplate[dataContextName] = dataContext;
            };
            return TemplatePresenter;
        })(WebComponents.WebComponent);
        WebComponents.TemplatePresenter = TemplatePresenter;
        WebComponents.WebComponent.register(TemplatePresenter, WebComponents, "vi", {
            properties: {
                dataContextName: String,
                dataContext: Object
            },
            observers: [
                "_render(dataContextName, dataContext)"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
