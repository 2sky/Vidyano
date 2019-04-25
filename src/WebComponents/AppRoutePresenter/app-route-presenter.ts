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

        attached() {
            super.attached();

            Vidyano.ServiceBus.send(this, "app-route-presenter:attached");
        }
    }
}