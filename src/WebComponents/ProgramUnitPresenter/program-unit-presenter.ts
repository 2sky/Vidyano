namespace Vidyano.WebComponents {
    "use strict";

    interface IProgramUnitPresenterRouteParameters {
        programUnitName: string;
    }

    @WebComponent.register({
        properties: {
            programUnit: {
                type: Object,
                readOnly: true,
                observer: "_programUnitChanged"
            },
            error: {
                type: String,
                readOnly: true
            }
        },
        listeners: {
            "app-route-activate": "_activate"
        },
    })
    export class ProgramUnitPresenter extends WebComponent {
        readonly programUnit: Vidyano.ProgramUnit; private _setProgramUnit: (programUnit: Vidyano.ProgramUnit) => void;
        readonly error: string; private _setError: (error: string) => void;

        private _activate(e: CustomEvent) {
            if (!this.app.service || !this.app.service.application)
                return;

            const { parameters }: { parameters: IProgramUnitPresenterRouteParameters; } = e.detail;
            this._setProgramUnit(Enumerable.from(this.app.service.application.programUnits).firstOrDefault(pu => pu.name === parameters.programUnitName));
            if (!this.programUnit) {
                e.preventDefault();

                this._setError(this.translateMessage("NotFound"));
            }
        }

        private _programUnitChanged(programUnit: Vidyano.ProgramUnit, oldProgramUnit: Vidyano.ProgramUnit) {
            if (oldProgramUnit)
                this.empty();

            this.dispatchEvent(new CustomEvent("title-changed", { detail: { title: programUnit ? programUnit.title : null }, bubbles: true, composed: true }));

            if (!programUnit)
                return;

            const config = this.app.configuration.getProgramUnitConfig(programUnit.name);
            if (!!config && config.hasTemplate)
                this.appendChild(config.stamp(programUnit, config.as || "programUnit"));
        }
    }
}