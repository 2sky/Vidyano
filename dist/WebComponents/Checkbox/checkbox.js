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
        var Checkbox = (function (_super) {
            __extends(Checkbox, _super);
            function Checkbox() {
                _super.apply(this, arguments);
            }
            Checkbox.prototype.toggle = function () {
                if (this.disabled)
                    return;
                this.checked = !!!this.checked;
            };
            return Checkbox;
        })(WebComponents.WebComponent);
        WebComponents.Checkbox = Checkbox;
        WebComponents.WebComponent.register(Checkbox, WebComponents, "vi", {
            properties: {
                checked: {
                    type: Boolean,
                    reflectToAttribute: true,
                    notify: true
                },
                label: String,
                disabled: {
                    type: Boolean,
                    reflectToAttribute: true
                }
            },
            listeners: {
                "tap": "toggle"
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
