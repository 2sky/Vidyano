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
                var config = this.app.configuration.getProgramUnitConfig(programUnit.name);
                if (config && config.template) {
                    if (!this._templatePresenter)
                        this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(config.template, "programUnit");
                    this._templatePresenter.dataContext = programUnit;
                    if (!this._templatePresenter.isAttached)
                        Polymer.dom(this).appendChild(this._templatePresenter);
                }
            };
            return ProgramUnitPresenter;
        })(WebComponents.WebComponent);
        WebComponents.ProgramUnitPresenter = ProgramUnitPresenter;
        WebComponents.WebComponent.register(ProgramUnitPresenter, WebComponents, "vi", {
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
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
