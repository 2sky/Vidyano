module Vidyano.WebComponents {
    @WebComponent.register({
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
    export class ProgramUnitPresenter extends WebComponent {
        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;
        programUnit: Vidyano.ProgramUnit;

        private _setProgramUnit: (programUnit: Vidyano.ProgramUnit) => void;

        private _activating(e: CustomEvent, detail: { route: AppRoute; parameters: { programUnitName: string; }; }) {
            if (!detail.route.app.service || !detail.route.app.service.application)
                return;

            this._setProgramUnit(Enumerable.from(detail.route.app.service.application.programUnits).firstOrDefault(pu => pu.name == detail.parameters.programUnitName));
        }

        private _programUnitChanged(programUnit: Vidyano.ProgramUnit, oldProgramUnit: Vidyano.ProgramUnit) {
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
        }
    }
}