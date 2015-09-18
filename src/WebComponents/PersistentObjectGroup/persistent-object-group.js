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
        var PersistentObjectGroup = (function (_super) {
            __extends(PersistentObjectGroup, _super);
            function PersistentObjectGroup() {
                _super.apply(this, arguments);
            }
            PersistentObjectGroup.prototype._computeLabel = function (group) {
                return group.label;
            };
            PersistentObjectGroup = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        group: Object,
                        label: {
                            type: String,
                            computed: "_computeLabel(group)"
                        }
                    }
                })
            ], PersistentObjectGroup);
            return PersistentObjectGroup;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObjectGroup = PersistentObjectGroup;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
