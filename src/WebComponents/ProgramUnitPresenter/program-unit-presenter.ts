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
            "activate": "_activate"
        },
    })
    export class ProgramUnitPresenter extends WebComponent {
        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;
        programUnit: Vidyano.ProgramUnit;

        private _setProgramUnit: (programUnit: Vidyano.ProgramUnit) => void;

        protected factoryImpl(app?: App) {
            if (app instanceof Vidyano.WebComponents.App)
                this._setApp(app);
        }

        private _activate(e: CustomEvent, detail: { route: AppRoute; parameters: { programUnitName: string; }; }) {
            if (!detail.route.app.service || !detail.route.app.service.application)
                return;

            this._setProgramUnit(Enumerable.from(detail.route.app.service.application.programUnits).firstOrDefault(pu => pu.name == detail.parameters.programUnitName));
            if (!this.programUnit) {
                e.preventDefault();

                this.app.redirectToNotFound();
            }
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