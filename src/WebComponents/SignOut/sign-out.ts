namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        listeners: {
            "app-route-activate": "_activate"
        }
    })
    export class SignOut extends WebComponent {
        private _activate(e: CustomEvent) {
            const signInUsingDefaultCredentials = !this.app.service.isUsingDefaultCredentials && !!this.app.service.defaultUserName;
            this.app.service.signOut().then(() => {
                if (signInUsingDefaultCredentials)
                    return this.app.service.signInUsingDefaultCredentials().then(() => "");

                return Promise.resolve(decodeURIComponent((<AppRoute>Polymer.dom(this).parentNode).parameters.returnUrl || "SignIn"));
            }).then(path => this.app.changePath(path, true));

            e.preventDefault();
        }
    }
}