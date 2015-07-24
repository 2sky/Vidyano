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
        var Spinner = (function (_super) {
            __extends(Spinner, _super);
            function Spinner() {
                _super.apply(this, arguments);
            }
            return Spinner;
        })(WebComponents.WebComponent);
        WebComponents.Spinner = Spinner;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.Spinner, Vidyano.WebComponents);
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
