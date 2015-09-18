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
        var ProgramUnitPresenter = (function (_super) {
            __extends(ProgramUnitPresenter, _super);
            function ProgramUnitPresenter() {
                _super.apply(this, arguments);
            }
            ProgramUnitPresenter.prototype._activating = function (e, detail) {
                if (!detail.route.app.service || !detail.route.app.service.application)
                    return;
                this._setProgramUnit(Enumerable.from(detail.route.app.service.application.programUnits).firstOrDefault(function (pu) { return pu.name == detail.parameters.programUnitName; }));
            };
            ProgramUnitPresenter.prototype._programUnitChanged = function (programUnit, oldProgramUnit) {
                if (oldProgramUnit)
                    this.empty();
                if (!programUnit)
                    return;
                var config = this.app.configuration.getProgramUnitConfig(programUnit.name);
                if (config && config.template) {
                    if (!this._templatePresenter)
                        this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(config.template, "programUnit");
                    this._templatePresenter.dataContext = programUnit;
                    if (!this._templatePresenter.isAttached)
                        Polymer.dom(this).appendChild(this._templatePresenter);
                }
            };
            ProgramUnitPresenter = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        programUnit: {
                            type: Object,
                            readOnly: true,
                            observer: "_programUnitChanged"
                        }
                    },
                    listeners: {
                        "activating": "_activating"
                    },
                })
            ], ProgramUnitPresenter);
            return ProgramUnitPresenter;
        })(WebComponents.WebComponent);
        WebComponents.ProgramUnitPresenter = ProgramUnitPresenter;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
