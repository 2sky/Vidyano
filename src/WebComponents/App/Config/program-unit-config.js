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
        var ProgramUnitConfig = (function (_super) {
            __extends(ProgramUnitConfig, _super);
            function ProgramUnitConfig() {
                _super.apply(this, arguments);
            }
            ProgramUnitConfig.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._setTemplate(Polymer.dom(this).querySelector("template"));
            };
            ProgramUnitConfig = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        name: String,
                        template: {
                            type: Object,
                            readOnly: true
                        }
                    }
                })
            ], ProgramUnitConfig);
            return ProgramUnitConfig;
        })(WebComponents.WebComponent);
        WebComponents.ProgramUnitConfig = ProgramUnitConfig;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
