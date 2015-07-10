module Vidyano.WebComponents {
    export class AttachedNotifier extends WebComponent {
        attached() {
            super.attached();

            this.fire("attached", { id: this.asElement.id }, {
                node: this.asElement,
                bubbles: false
            });
        }
    }


    WebComponent.register(AttachedNotifier, WebComponents, "vi", {
    });
}