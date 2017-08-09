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
        private _updateColor(color: string, isAttached: boolean) {
            if (!isAttached)
                return;

            this.updateStyles({ "--vi-spinner-color": color });
        }
    }
}