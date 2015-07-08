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
        var Button = (function (_super) {
            __extends(Button, _super);
            function Button() {
                _super.apply(this, arguments);
            }
            return Button;
        })(WebComponents.WebComponent);
        WebComponents.Button = Button;
        WebComponents.WebComponent.register(Button, WebComponents, "vi", {
            extends: "button",
            properties: {
                inverse: {
                    type: Boolean,
                    reflectToAttribute: true
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
