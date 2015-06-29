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
        var MaskedInput = (function (_super) {
            __extends(MaskedInput, _super);
            function MaskedInput() {
                _super.apply(this, arguments);
            }
            MaskedInput.prototype._initialize = function (format, separator, isAttached) {
                var _this = this;
                if (!isAttached)
                    return;
                var mi = new window["MaskedInput"]({
                    elm: this.asElement,
                    format: format,
                    separator: separator,
                    onfilled: function () {
                        var input = _this.asElement;
                        _this.fire("filled", { value: input.value });
                    }
                });
            };
            return MaskedInput;
        })(WebComponents.WebComponent);
        WebComponents.MaskedInput = MaskedInput;
        WebComponents.WebComponent.register(MaskedInput, WebComponents, "vi", {
            properties: {
                format: {
                    type: String,
                    reflectToAttribute: true
                },
                separator: {
                    type: String,
                    reflectToAttribute: true
                }
            },
            observers: [
                "_initialize(format, separator, isAttached)"
            ],
            extends: "input"
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
