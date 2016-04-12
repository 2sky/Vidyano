namespace Vidyano.WebComponents {
    "use strict";

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
            canProfile: {
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
        private _setCanProfile: (val: boolean) => void;
        private _setUserName: (val: string) => void;

        attached() {
            super.attached();

            // Set local service property because vi-app is not observable
            this._setService(this.app.service);
        }

        signIn() {
            this.app.redirectToSignIn();
        }

        signOut() {
            this.app.redirectToSignOut(false);
        }

        feedback() {
            this.service.getPersistentObject(null, this.service.application.feedbackId).then(po => {
                const commentAttr = po.getAttribute("Comment");
                const commentOptions = ["Browser: " + navigator.userAgent, "Vidyano Client: " + Vidyano.version];
                const location = window.location.toString();
                if (!location.contains("FromAction/"))
                    commentOptions.push("Url: " + location);
                commentAttr.options = commentOptions;
                commentAttr.isValueChanged = true;

                this.service.hooks.onOpen(po, false, true);
            });
        }

        userSettings() {
            this.app.changePath((this.app.programUnit ? this.app.programUnit.name + "/" : "") + "PersistentObject." + this.service.application.userSettingsId + "/" + this.service.application.userId);
        }

        private _showProfiler() {
            this.app.service.profile = true;
        }

        private _signedInChanged() {
            const isSignedIn = this.service.isSignedIn && !this.service.isUsingDefaultCredentials;

            this._setIsSignedIn(isSignedIn);
            this._setUserName(isSignedIn ? this.service.application.friendlyUserName : null);
            this._setCanFeedback(isSignedIn && !!this.service.application.feedbackId);
            this._setCanUserSettings(isSignedIn && !!this.service.application.userSettingsId);
            this._setCanProfile(isSignedIn && this.service.application.canProfile);
        }
    }
}