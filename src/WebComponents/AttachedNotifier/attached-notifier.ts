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
        private _wasAttached;
        oneTime: boolean;

        attached() {
            super.attached();

            if (this._wasAttached && this.oneTime)
                return;

            this._wasAttached = true;
            this.fire("attached", { id: this.id }, {
                onNode: this,
                bubbles: false
            });
        }
    }
}