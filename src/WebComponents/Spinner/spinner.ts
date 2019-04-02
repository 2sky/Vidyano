namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            color: {
                type: String,
                reflectToAttribute: true
            }
        },
        observers: [
            "_updateColor(color, isConnected)"
        ]
    })
    export class Spinner extends WebComponent {
        private static _spinnerConfig: SpinnerConfig;

        // TODO
        // static get template() {
        //     if (Spinner._spinnerConfig === undefined && window.app !== undefined)
        //         Spinner._spinnerConfig = window.app.configuration.getSpinnerConfig();

        //     if (Spinner._spinnerConfig)
        //         return Spinner._spinnerConfig.template.cloneNode(true);

        //     return Polymer.DomModule.import("vi-spinner", "template");
        // }

        private _updateColor(color: string, isConnected: boolean) {
            this.updateStyles({
                "--vi-spinner-color": color
            });
        }
    }
}