namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register
    export class AppRoutePresenter extends WebComponent {
        attached() {
            super.attached();

            this.fire("app-route-presenter-attached", null);
        }
    }
}