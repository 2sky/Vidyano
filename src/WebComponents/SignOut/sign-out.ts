namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        listeners: {
            "app-route-activate": "_activate"
        }
    })
    export class SignOut extends WebComponent {
        private _activate(e: CustomEvent) {
            const returnUrl = !this.app.service.defaultUserName || this.app.service.isUsingDefaultCredentials ? decodeURIComponent((<AppRoute>Polymer.dom(this).parentNode).parameters.returnUrl || "SignIn") : "";

            this.app.service.signOut();
            this.async(() => this.app.changePath(returnUrl, true));

            e.preventDefault();
        }
    }
}