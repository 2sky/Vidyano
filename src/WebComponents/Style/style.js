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
        var Style = (function (_super) {
            __extends(Style, _super);
            function Style() {
                _super.apply(this, arguments);
                this._uniqueId = Unique.get();
                this._styles = {};
            }
            Style.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this.parentElement.setAttribute("style-scope-id", this._uniqueId);
            };
            Style.prototype.detached = function () {
                if (this._styleElement) {
                    document.head.removeChild(this._styleElement);
                    this._styleElement = undefined;
                }
                this.parentElement.removeAttribute("style-scope-id");
                _super.prototype.detached.call(this);
            };
            Style.prototype.getStyle = function (name) {
                return this._styles[name] ? this._styles[name].text : null;
            };
            Style.prototype.setStyle = function (name) {
                var _this = this;
                var css = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    css[_i - 1] = arguments[_i];
                }
                var cssBody = "";
                css.filter(function (c) { return !StringEx.isNullOrEmpty(c); }).forEach(function (c) {
                    cssBody += _this.key + '[style-scope-id="' + _this._uniqueId + '"] ' + c + (css.length > 0 ? "\n" : "");
                });
                console.warn("Writing global style: " + name);
                if (!this._styleElement)
                    this._styleElement = document.head.appendChild(document.createElement("style"));
                if (this._styles[name])
                    this._styles[name].node.nodeValue = this._styles[name].text = cssBody;
                else
                    this._styles[name] = {
                        node: this._styleElement.appendChild(document.createTextNode(cssBody)),
                        text: cssBody
                    };
            };
            Style = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        key: String
                    }
                })
            ], Style);
            return Style;
        })(Vidyano.WebComponents.WebComponent);
        WebComponents.Style = Style;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
