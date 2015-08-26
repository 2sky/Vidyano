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
        var ProgramUnitConfig = (function (_super) {
            __extends(ProgramUnitConfig, _super);
            function ProgramUnitConfig() {
                _super.apply(this, arguments);
            }
            ProgramUnitConfig.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._setTemplate(Polymer.dom(this).querySelector("template"));
            };
            return ProgramUnitConfig;
        })(WebComponents.WebComponent);
        WebComponents.ProgramUnitConfig = ProgramUnitConfig;
        WebComponents.WebComponent.register(ProgramUnitConfig, WebComponents, "vi", {
            properties: {
                name: String,
                template: {
                    type: Object,
                    readOnly: true
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
