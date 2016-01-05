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
            "app-route-activate": "_activate"
        },
    })
    export class ProgramUnitPresenter extends WebComponent {
        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;
        programUnit: Vidyano.ProgramUnit;

        private _setProgramUnit: (programUnit: Vidyano.ProgramUnit) => void;

        private _activate(e: CustomEvent) {
            const route = <AppRoute>Polymer.dom(this).parentNode;
            if (!route.app.service || !route.app.service.application)
                return;

            this._setProgramUnit(Enumerable.from(route.app.service.application.programUnits).firstOrDefault(pu => pu.name == route.parameters.programUnitName));
            if (!this.programUnit) {
                e.preventDefault();

                this.app.redirectToNotFound();
            }
        }

        private _programUnitChanged(programUnit: Vidyano.ProgramUnit, oldProgramUnit: Vidyano.ProgramUnit) {
            if (oldProgramUnit)
                this.empty();

            this.fire("title-changed", { title: programUnit ? programUnit.title : null }, { bubbles: true });

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