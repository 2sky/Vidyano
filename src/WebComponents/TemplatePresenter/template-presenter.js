var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
                    this._domBindTemplate.innerHTML = this._sourceTemplate.innerHTML;
                    Polymer.dom(this).appendChild(this._domBindTemplate);
                }
                else
                    this._domBindTemplate[dataContextName] = dataContext;
            };
            TemplatePresenter = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        dataContextName: String,
                        dataContext: Object
                    },
                    observers: [
                        "_render(dataContextName, dataContext)"
                    ]
                })
            ], TemplatePresenter);
            return TemplatePresenter;
        })(WebComponents.WebComponent);
        WebComponents.TemplatePresenter = TemplatePresenter;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
