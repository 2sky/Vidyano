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
        var Style = (function (_super) {
            __extends(Style, _super);
            function Style() {
                _super.apply(this, arguments);
                this._uniqueId = Unique.get();
                this._styles = {};
            }
            Style.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this.asElement.parentElement.setAttribute("style-scope-id", this._uniqueId);
            };
            Style.prototype.detached = function () {
                if (this._styleElement) {
                    document.head.removeChild(this._styleElement);
                    this._styleElement = undefined;
                }
                this.asElement.parentElement.removeAttribute("style-scope-id");
                _super.prototype.detached.call(this);
            };
            Style.prototype.setStyle = function (name) {
                var _this = this;
                var css = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    css[_i - 1] = arguments[_i];
                }
                var cssBody = "";
                css.forEach(function (c) {
                    cssBody += _this.key + '[style-scope-id="' + _this._uniqueId + '"] ' + c + (css.length > 0 ? "\n" : "");
                });
                if (!this._styleElement)
                    this._styleElement = document.head.appendChild(document.createElement("style"));
                var node = this._styles[name] || (this._styles[name] = this._styleElement.appendChild(document.createTextNode("")));
                node.textContent = cssBody;
            };
            return Style;
        })(Vidyano.WebComponents.WebComponent);
        WebComponents.Style = Style;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Style, Vidyano.WebComponents, "vi", {
            properties: {
                key: String
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
