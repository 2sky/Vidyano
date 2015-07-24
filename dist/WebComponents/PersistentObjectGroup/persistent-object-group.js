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
        var PersistentObjectGroup = (function (_super) {
            __extends(PersistentObjectGroup, _super);
            function PersistentObjectGroup() {
                _super.apply(this, arguments);
            }
            PersistentObjectGroup.prototype._computeLabel = function (group) {
                return group.label;
            };
            return PersistentObjectGroup;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectGroup = PersistentObjectGroup;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.PersistentObjectGroup, Vidyano.WebComponents, "vi", {
            properties: {
                group: Object,
                label: {
                    type: String,
                    computed: "_computeLabel(group)"
                }
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
