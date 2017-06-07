namespace Vidyano.WebComponents {
    "use strict";

    interface ISignInRouteParameters {
        returnUrl: string;
    }

    @WebComponent.register({
        properties: {
            error: {
                type: String,
                notify: true
            },
            label: String,
            image: {
                type: String,
                observer: "_imageChanged"
            }
        },
        listeners: {
            "app-route-activate": "_activate"
        }
    })
    export class SignIn extends WebComponent {
        error: string;
        image: string;

        private async _activate(e: CustomEvent, { parameters }: { parameters: ISignInRouteParameters; }) {
            const returnUrl = decodeURIComponent(parameters.returnUrl || "");

            if (this.app.service.isSignedIn) {
                this.async(() => this.app.redirectToSignOut(), 0);

                e.preventDefault();
                return;
            }

            if (this.app.service.windowsAuthentication) {
                e.preventDefault();

                await this.app.service.signInUsingCredentials("", "");
                this.app.changePath(returnUrl);

                return;
            }
            else if (this.app.service.providers && Object.keys(this.app.service.providers).length === 1 && !this.app.service.providers["Vidyano"]) {
                this.empty(this.root);

                Vidyano.cookie("returnUrl", returnUrl, { expires: 1, force: true });
                this.app.service.signInExternal(Object.keys(this.app.service.providers)[0]);
                return;
            }

            this.empty(undefined, c => c instanceof Vidyano.WebComponents.SignInProvider);

            const providers = Object.keys(this.app.service.providers);
            providers.forEach(name => {
                const provider = new WebComponents.SignInProvider(name === "Vidyano", providers.length === 1, returnUrl, this.app.service.providers[name]);
                provider.name = name;

                Polymer.dom(this).appendChild(provider);
            });
        }

        private _imageChanged() {
            this.$.image.style.backgroundImage = this.image ? "url(" + this.image + ")" : undefined;
            if (this.image)
                this.$.image.classList.add("has-image");
            else
                this.$.image.classList.remove("has-image");
        }
    }

    @WebComponent.register({
        properties: {
            label: {
                type: String,
                computed: "_computeLabel(translations)",
            },
            description: {
                type: String,
                computed: "_computeDescription(translations)",
            },
            isVidyano: {
                type: Boolean,
                readOnly: true,
                value: false,
                reflectToAttribute: true
            },
            userName: {
                type: String,
                notify: true,
                observer: "_userNameChanged"
            },
            userNameError: {
                type: Boolean,
                value: false,
                observer: "_userNameErrorChanged"
            },
            password: {
                type: String,
                notify: true
            },
            staySignedIn: {
                type: Boolean
            },
            isBusy: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: false
            },
            signingInCounter: {
                type: Number,
                value: 0
            },
            twoFactorAuthentication: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            twoFactorCode: {
                type: String,
                notify: true
            },
            hasForgot: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            hasRegister: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            register: {
                type: Object,
                readOnly: true,
                value: null
            }
        },
        listeners: {
            "tap": "_tap"
        },
        observers: [
            "_showRegisterNotification(register.notification)"
        ],
        forwardObservers: [
            "register.notification"
        ]
    })
    export class SignInProvider extends WebComponent {
        private _signInButton: HTMLButtonElement;
        private _signInButtonWidth = 0;
        private _signingInMessage: string;
        readonly isVidyano: boolean; private _setIsVidyano: (val: boolean) => void;
        readonly isBusy: boolean; private _setIsBusy: (val: boolean) => void;
        readonly twoFactorAuthentication: boolean; private _setTwoFactorAuthentication: (val: boolean) => void;
        readonly hasForgot: boolean; private _setHasForgot: (hasForgot: boolean) => void;
        readonly hasRegister: boolean; private _setHasRegister: (hasRegister: boolean) => void;
        readonly register: Vidyano.PersistentObject; private _setRegister: (register: Vidyano.PersistentObject) => void;
        name: string;
        userName: string;
        userNameError: boolean;
        password: string;
        staySignedIn: boolean;
        signingInCounter: number;
        twoFactorCode: string;

        constructor(isVidyano: boolean, private _isOnlyProvider: boolean, private _returnUrl: string, private _parameters: IProviderParameters) {
            super();

            this._setIsVidyano(isVidyano);
        }

        attached() {
            super.attached();

            if (this.isVidyano) {
                this._setHasForgot(this._parameters.forgotPassword || false);
                this._setHasRegister(!!this._parameters.registerUser && !!this._parameters.registerPersistentObjectId);

                if (this._isOnlyProvider) {
                    Polymer.dom(this.root).querySelector("template")["render"]();
                    const collapse = this.$$("#vidyano");
                    collapse["noAnimation"] = true;
                    collapse["opened"] = true;
                    setTimeout(() => this._autoFocus(), 300);
                }
            }
        }

        private _vidyanoSignInAttached() {
            this.userName = this.app.service.userName !== this.app.service.defaultUserName && this.app.service.userName !== this.app.service.registerUserName ? this.app.service.userName : "";
            this.staySignedIn = Vidyano.cookie("staySignedIn", { force: true }) === "true";
            this._autoFocus();
        }

        private _keydown(e: KeyboardEvent) {
            if (e.which === Keyboard.KeyCodes.enter && !StringEx.isNullOrEmpty(this.userName) && !StringEx.isNullOrEmpty(this.password))
                this._signIn();
        }

        private _computeLabel(): string {
            const parameters = this.app.service.providers[this.name];
            if (this.name === "Vidyano" && !parameters.label)
                return "Vidyano";

            return parameters.label;
        }

        private _computeDescription(): string {
            return this.app.service.providers[this.name].description || "";
        }

        private _tap() {
            if (!this.isVidyano) {
                Vidyano.cookie("returnUrl", this._returnUrl, { expires: 1, force: true });
                this.app.service.signInExternal(this.name);
            }
            else if (!this._isOnlyProvider) {
                const vidyanoProvider = this.$$("#vidyano");
                if (!vidyanoProvider["opened"]) {
                    vidyanoProvider["toggle"]();
                    setTimeout(() => this._autoFocus(), 300);
                }
            }
        }

        private _autoFocus() {
            if (StringEx.isNullOrEmpty(this.userName)) {
                const user = <HTMLInputElement><any>this.$$("input#user");
                user.focus();
            }
            else {
                const pass = <HTMLInputElement><any>this.$$("input#pass");
                pass.focus();
            }
        }

        private async _signIn() {
            this.userNameError = false;
            this._setIsBusy(true);

            const currentRoute = this.app.currentRoute;
            this.app.service.staySignedIn = this.staySignedIn;
            try {
                await this.app.service.signInUsingCredentials(this.userName, this.password, this.twoFactorAuthentication ? this.twoFactorCode : undefined);
                this._setTwoFactorAuthentication(false);
                this._setIsBusy(false);

                this.password = "";
                this.twoFactorCode = "";

                if (currentRoute === this.app.currentRoute) {
                    const route = this.findParent<AppRoute>(e => e instanceof Vidyano.WebComponents.AppRoute);
                    this.app.changePath(decodeURIComponent(route.parameters.returnUrl || ""));
                }
            }
            catch (e) {
                if (e === "Two-factor authentication enabled for user." || e === "Invalid code.") {
                    if (e === "Invalid code.")
                        this.app.showAlert(e, NotificationType.Error, 3000);

                    this._setTwoFactorAuthentication(true);

                    Polymer.dom(this).flush();

                    const input = <HTMLInputElement>Polymer.dom(this.root).querySelector("#twofactor");
                    input.value = "";
                    input.focus();

                    return;
                }

                this.password = "";
                this.twoFactorCode = "";

                const pass = <HTMLInputElement><any>this.$$("input#pass");
                pass.focus();

                this.app.showMessageDialog({
                    title: this.app.label || document.title,
                    message: e,
                    actions: [this.translateMessage("OK")],
                    actionTypes: ["Danger"]
                });
            }
            finally {
                this._setIsBusy(false);
            }
        }

        private async _forgotPassword() {
            if (!this.userName) {
                this.userNameError = true;
                return;
            }

            this.userNameError = false;
            this._setIsBusy(true);
            try {
                const result = await this.service.forgotPassword(this.userName);
                this.app.showAlert(result.notification, result.notificationType, result.notificationDuration);
            }
            finally {
                this._setIsBusy(false);
            }
        }

        private _userNameErrorChanged(userNameError: boolean) {
            if (userNameError)
                (<HTMLInputElement>Polymer.dom(this.root).querySelector("input#user")).focus();
        }

        private _userNameChanged() {
            this.userNameError = false;
        }

        private async _register() {
            this.userNameError = false;
            this._setIsBusy(true);

            try {
                const imports = this.app.importComponent("PersistentObjectTab", "PersistentObjectAttributePresenter", "PersistentObjectDialog");
                await this.service.signInUsingCredentials(this._parameters.registerUser, null);
                const register = await this.service.getPersistentObject(null, this._parameters.registerPersistentObjectId);
                register.beginEdit();
                await imports;

                this._setIsBusy(false);

                if (register.stateBehavior.indexOf("OpenAsDialog") >= 0) {
                    await this.app.showDialog(new PersistentObjectDialog(register, {
                        saveLabel: this.translations["RegisterSave"]
                    }));
                } else
                    this._setRegister(register);
            }
            catch (e) {
                this.app.showAlert(e, NotificationType.Error);
            }
            finally {
                this._setIsBusy(false);
            }
        }

        private async _registerSave() {
            this._setIsBusy(true);
            try {
                await this.register.save();

                this._setRegister(null);
                this.service.signOut();
            }
            finally {
                this._setIsBusy(false);
            }
        }

        private _registerCancel() {
            this._setRegister(null);
            this.service.signOut();
        }

        private _showRegisterNotification(notification: string) {
            if (!notification)
                return;

            this.app.showAlert(this.register.notification, this.register.notificationType, this.register.notificationDuration);
        }
    }
}