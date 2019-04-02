namespace Vidyano.WebComponents {
    @WebComponent.register({
        listeners: {
            "app-route-activate": "_activate"
        }
    })
    export class SignOut extends WebComponent {
        private async _activate(e: CustomEvent) {
            e.preventDefault();

            const signInUsingDefaultCredentials = !this.service.isUsingDefaultCredentials && !!this.service.defaultUserName;
            await this.service.signOut();

            let path: string;
            if (!signInUsingDefaultCredentials)
                path = decodeURIComponent((<AppRoute>this.parentNode).parameters.returnUrl || "SignIn");
            else {
                await this.service.signInUsingDefaultCredentials();
                path = "";
            }

            this.app.changePath(path, true);
        }
    }
}