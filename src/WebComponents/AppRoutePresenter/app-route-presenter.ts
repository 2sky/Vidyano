namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            notFound: {
                type: Boolean,
                value: false
            }
        }
    })
    export class AppRoutePresenter extends WebComponent {
        notFound: boolean;

        connectedCallback() {
            super.connectedCallback();


            this.dispatchEvent(new CustomEvent("app-route-presenter-attached"));
        }
    }
}