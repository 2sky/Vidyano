module Vidyano.WebComponents {
    export class AttachedNotifier extends WebComponent {
        private _wasAttached;
        oneTime: boolean;

        attached() {
            super.attached();

            if (this._wasAttached && this.oneTime)
                return;

            this.fire("attached", { id: this.asElement.id }, {
                node: this.asElement,
                bubbles: false
            });

            this._wasAttached = true;
        }
    }


    WebComponent.register(AttachedNotifier, WebComponents, "vi", {
        properties: {
            oneTime: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    });
}