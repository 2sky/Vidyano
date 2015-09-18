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
        var QueryGridCellTemplate = (function (_super) {
            __extends(QueryGridCellTemplate, _super);
            function QueryGridCellTemplate() {
                _super.apply(this, arguments);
            }
            QueryGridCellTemplate.prototype.asDataUri = function (value) {
                if (!value)
                    return "";
                return value.asDataUri();
            };
            QueryGridCellTemplate.Load = function (source) {
                var cellTemplate = WebComponents.Resource.LoadResource(source, "VI-QUERY-GRID-CELL-TEMPLATE");
                if (!cellTemplate)
                    return null;
                return new Vidyano.WebComponents.TemplatePresenter(cellTemplate.querySelector("template"), "value");
            };
            QueryGridCellTemplate.Exists = function (name) {
                return WebComponents.Resource.Exists(name, "VI-QUERY-GRID-CELL-TEMPLATE");
            };
            QueryGridCellTemplate = __decorate([
                WebComponents.Resource.register
            ], QueryGridCellTemplate);
            return QueryGridCellTemplate;
        })(WebComponents.Resource);
        WebComponents.QueryGridCellTemplate = QueryGridCellTemplate;
        var QueryGridCellImage = (function (_super) {
            __extends(QueryGridCellImage, _super);
            function QueryGridCellImage() {
                _super.apply(this, arguments);
            }
            QueryGridCellImage.prototype._valueChanged = function (value) {
                if (!value || !value.value) {
                    if (this._image && !this._image.hasAttribute("hidden")) {
                        this._image.style.backgroundImage = "";
                        this._image.setAttribute("hidden", "");
                    }
                    return;
                }
                if (!this._image) {
                    Polymer.dom(this).appendChild(this._image = document.createElement("div"));
                    this._image.classList.add("image");
                }
                this._image.removeAttribute("hidden");
                this._image.style.backgroundImage = "url(" + value.value.asDataUri() + ")";
            };
            QueryGridCellImage = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        value: {
                            type: Object,
                            observer: "_valueChanged"
                        }
                    }
                })
            ], QueryGridCellImage);
            return QueryGridCellImage;
        })(WebComponents.WebComponent);
        WebComponents.QueryGridCellImage = QueryGridCellImage;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
