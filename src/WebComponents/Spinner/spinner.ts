namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            color: {
                type: String,
                reflectToAttribute: true
            }
        },
        observers: [
            "_updateColor(color, isAttached)"
        ]
    })
    export class Spinner extends WebComponent {
        private spinnerConfig: SpinnerConfig;

        attached() {
            super.attached();
            
            if (typeof this.spinnerConfig === "undefined") {
                this.spinnerConfig = this.app.configuration.getSpinnerConfig();
                if (this.spinnerConfig) {
                    Polymer.dom(this.root).appendChild(this.spinnerConfig.stamp(null));
                }
                else {
                    const template = <PolymerTemplate><any>this.$.default;
                    Polymer.dom(this.root).appendChild(template.stamp(null).root);
                }
            }
        }

        private _updateColor(color: string, isAttached: boolean) {
            if (!isAttached)
                return;

            this.customStyle["--vi-spinner-color"] = color;
            this.updateStyles();
        }
    }
}