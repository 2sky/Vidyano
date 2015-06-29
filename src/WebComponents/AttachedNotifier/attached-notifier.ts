module Vidyano.WebComponents {
    export class AttachedNotifier extends WebComponent {
        attached() {
            super.attached();

            this.fire("attached", { id: this.asElement.id }, this.asElement, false);
        }
    }


    WebComponent.register(AttachedNotifier, WebComponents, "vi", {
    });
}