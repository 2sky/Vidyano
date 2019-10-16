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

        private _activate(e: CustomEvent, { parameters }: { parameters: IProgramUnitPresenterRouteParameters; }) {
            if (!this.app.service || !this.app.service.application)
                return;

            this._setProgramUnit(this.app.service.application.programUnits.find(pu => pu.nameKebab === parameters.programUnitName || pu.name === parameters.programUnitName));
            if (!this.programUnit) {
                e.preventDefault();

                this._setError(this.translateMessage("NotFound"));
            }
        }

        private _programUnitChanged(programUnit: Vidyano.ProgramUnit, oldProgramUnit: Vidyano.ProgramUnit) {
            if (oldProgramUnit)
                this.empty();

            this.fire("title-changed", { title: programUnit ? programUnit.title : null }, { bubbles: true });

            if (!programUnit)
                return;

            const config = this.app.configuration.getProgramUnitConfig(programUnit.name);
            if (!!config && config.hasTemplate)
                Polymer.dom(this).appendChild(config.stamp(programUnit, config.as || "programUnit"));
        }
    }
}