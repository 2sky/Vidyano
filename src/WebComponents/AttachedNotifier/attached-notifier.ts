namespace Vidyano.WebComponents {
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

        connectedCallback() {
            super.connectedCallback();

            if (this._wasAttached && this.oneTime)
                return;

            this._wasAttached = true;
            this.fire("attached", { id: this.id }, {
                node: this,
                bubbles: false
            });
        }
    }
}