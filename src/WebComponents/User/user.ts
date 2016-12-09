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
        readonly service: Vidyano.Service; private _setService: (service: Vidyano.Service) => void;
        readonly isSignedIn: boolean; private _setIsSignedIn: (val: boolean) => void;
        readonly canFeedback: boolean; private _setCanFeedback: (val: boolean) => void;
        readonly canUserSettings: boolean; private _setCanUserSettings: (val: boolean) => void;
        readonly canProfile: boolean; private _setCanProfile: (val: boolean) => void;
        readonly userName: string; private _setUserName: (val: string) => void;

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

        async feedback() {
            const po = await this.service.getPersistentObject(null, this.service.application.feedbackId);
            const commentAttr = po.getAttribute("Comment");
            const commentOptions = ["Browser: " + navigator.userAgent, "Vidyano Client: " + Vidyano.version];
            const location = window.location.toString();
            if (!location.contains("FromAction/"))
                commentOptions.push("Url: " + location);
            commentAttr.options = commentOptions;
            commentAttr.isValueChanged = true;

            this.service.hooks.onOpen(po, false, true);
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
            this._setCanFeedback(isSignedIn && !!this.service.application.feedbackId && this.service.application.feedbackId !== "00000000-0000-0000-0000-000000000000");
            this._setCanUserSettings(isSignedIn && !!this.service.application.userSettingsId && this.service.application.userSettingsId !== "00000000-0000-0000-0000-000000000000");
            this._setCanProfile(isSignedIn && this.service.application.canProfile);
        }
    }
}