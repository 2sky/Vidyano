module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            isSignedIn: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            userName: {
                type: String,
                readOnly: true
            },
            service: {
                type: Object,
                readOnly: true
            },
            canFeedback: {
                type: Boolean,
                readOnly: true
            },
            canUserSettings: {
                type: Boolean,
                readOnly: true
            },
            collapsed: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        forwardObservers: [
            "_signedInChanged(service.isSignedIn)",
            "_signedInChanged(service.isUsingDefaultCredentials)"
        ]
    })
    export class User extends WebComponent {
        private service: Vidyano.Service;
        isSignedIn: boolean;
        collapsed: boolean;

        private _setService: (service: Vidyano.Service) => void;
        private _setIsSignedIn: (val: boolean) => void;
        private _setCanFeedback: (val: boolean) => void;
        private _setCanUserSettings: (val: boolean) => void;
        private _setUserName: (val: string) => void;

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

        feedback() {
            this.service.getPersistentObject(null, this.service.application.feedbackId).then(po => {
                var commentAttr = po.getAttribute("Comment");
                commentAttr.options = ["Url: " + window.location, "Browser: " + navigator.userAgent];
                commentAttr.isValueChanged = true;

                this.service.hooks.onOpen(po, false, true);
            });
        }

        userSettings() {
            this.app.changePath((this.app.programUnit ? this.app.programUnit.name + "/" : "") + "PersistentObject." + this.service.application.userSettingsId + "/" + this.service.application.userId);
        }

        private _signedInChanged() {
            var isSignedIn = this.service.isSignedIn && !this.service.isUsingDefaultCredentials;
            this._setIsSignedIn(isSignedIn);
            this._setUserName(isSignedIn ? this.service.userName : null);
            this._setCanFeedback(isSignedIn && !!this.service.application.feedbackId);
            this._setCanUserSettings(isSignedIn && !!this.service.application.userSettingsId);
        }
    }
}