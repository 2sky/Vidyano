module Vidyano.WebComponents {
    export class User extends WebComponent {
        private _observeDisposers: ObserveChainDisposer[] = [];
        private service: Vidyano.Service;

        private _setService: (service: Vidyano.Service) => void;

        attached() {
            super.attached();

            // Set local service property because vi-app is not observable
            this._setService(this.app.service);
        }

        signIn() {
            this.app.changePath("SignIn");
        }

        signOut() {
            this.app.redirectToSignIn(false);
        }

        private _computeIsSignedIn(isSignedIn: boolean, isUsingDefaultCredentials: boolean): boolean {
            return isSignedIn && !isUsingDefaultCredentials;
        }
    }

    WebComponent.register(User, WebComponents, "vi", {
        properties: {
            isSignedIn: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeIsSignedIn(service.isSignedIn, service.isUsingDefaultCredentials)"
            },
            userName: {
                type: String,
                computed: "_forwardComputed(service.userName)"
            },
            service: {
                type: Object,
                readOnly: true
            }
        },
        forwardObservers: [
            "_signedInChanged(service.isSignedIn)",
            "_signedInChanged(service.isUsingDefaultCredentials)",
            "_userNameChanged(service.userName)",
        ]
    });
}