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
        var AttachedNotifier = (function (_super) {
            __extends(AttachedNotifier, _super);
            function AttachedNotifier() {
                _super.apply(this, arguments);
            }
            AttachedNotifier.prototype.attached = function () {
                _super.prototype.attached.call(this);
                if (this._wasAttached && this.oneTime)
                    return;
                this.fire("attached", { id: this.asElement.id }, {
                    node: this.asElement,
                    bubbles: false
                });
                this._wasAttached = true;
            };
            return AttachedNotifier;
        })(WebComponents.WebComponent);
        WebComponents.AttachedNotifier = AttachedNotifier;
        WebComponents.WebComponent.register(AttachedNotifier, WebComponents, "vi", {
            properties: {
                oneTime: {
                    type: Boolean,
                    reflectToAttribute: true
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
