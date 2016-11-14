namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        listeners: {
            "app-route-activate": "_activate"
        }
    })
    export class SignOut extends WebComponent {
        private async _activate(e: CustomEvent) {
            e.preventDefault();

            const signInUsingDefaultCredentials = !this.app.service.isUsingDefaultCredentials && !!this.app.service.defaultUserName;
            await this.app.service.signOut();

            let path: string;
            if (!signInUsingDefaultCredentials)
                path = decodeURIComponent((<AppRoute>Polymer.dom(this).parentNode).parameters.returnUrl || "SignIn");
            else {
                await this.app.service.signInUsingDefaultCredentials();
                path = "";
            }

            this.app.changePath(path, true);
        }
    }
}