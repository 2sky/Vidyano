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
        var ProgramUnitPresenter = (function (_super) {
            __extends(ProgramUnitPresenter, _super);
            function ProgramUnitPresenter() {
                _super.apply(this, arguments);
            }
            return ProgramUnitPresenter;
        })(WebComponents.WebComponent);
        WebComponents.ProgramUnitPresenter = ProgramUnitPresenter;
        WebComponents.WebComponent.register(ProgramUnitPresenter, WebComponents, "vi");
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
