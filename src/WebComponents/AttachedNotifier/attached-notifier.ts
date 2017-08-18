namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            oneTime: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    })
    export class AttachedNotifier extends WebComponent {
        private _wasConnected;
        oneTime: boolean;

        connectedCallback() {
            super.connectedCallback();

            if (this._wasConnected && this.oneTime)
                return;

            this._wasConnected = true;
            // TODO: Rename to connected
            this.dispatchEvent(new CustomEvent("attached", {
                detail: {
                    id: this.id
                },
                bubbles: false
            }));
        }
    }
}