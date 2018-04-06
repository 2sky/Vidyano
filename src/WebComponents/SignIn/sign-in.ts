namespace Vidyano.WebComponents {
    "use strict";

    declare type Step = "username" | "password" | "twofactor" | "authenticating" | "register" | "initial";

    interface ISignInRouteParameters {
        stateOrReturnUrl: string;
        returnUrl: string;
    }

    interface ICredentialType {
        exception: string;
        redirectUri: string;
        usePassword: boolean;
    }

    interface INotification {
        text: string;
        type: NotificationType;
    }

    @WebComponent.register({
        properties: {
            returnUrl: {
                type: String,
                readOnly: true,
            },
            isBusy: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: false
            },
            step: {
                type: String,
                observer: "_stepChanged"
            },
            hasVidyano: {
                type: Boolean,
                readOnly: true
            },
            userName: {
                type: String,
                value: ""
            },
            password: {
                type: String,
                value: ""
            },
            staySignedIn: {
                type: Boolean
            },
            twoFactorCode: {
                type: String,
                notify: true,
                value: ""
            },
            hasOther: {
                type: Boolean,
                readOnly: true
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
            },
            initial: {
                type: Object,
                readOnly: true,
                value: null
            },
            error: {
                type: String,
                notify: true
            },
            background: {
                type: String,
                observer: "_backgroundChanged"
            },
            logo: String,
            description: {
                type: String,
                readOnly: true
            },
            notification: {
                type: Object,
                readOnly: true,
                value: null
            }
        },
        listeners: {
            "app-route-activate": "_activate",
            "app-route-deactivate": "_deactivate"
        },
        mediaQueryAttributes: true,
        forwardObservers: [
            "register.isBusy",
            "initial.isBusy"
        ]
    })
    export class SignIn extends WebComponent {
        private _isWarned: boolean;
        private _fallbackTranslations: { [key: string]: string; };
        readonly returnUrl: string; private _setReturnUrl: (returnUrl: string) => void;
        readonly isBusy: boolean; private _setIsBusy: (val: boolean) => void;
        readonly hasVidyano: boolean; private _setHasVidyano: (hasVidyano: boolean) => void;
        readonly hasOther: boolean; private _setHasOther: (hasOther: boolean) => void;
        readonly hasForgot: boolean; private _setHasForgot: (hasForgot: boolean) => void;
        readonly hasRegister: boolean; private _setHasRegister: (hasRegister: boolean) => void;
        readonly register: Vidyano.PersistentObject; private _setRegister: (register: Vidyano.PersistentObject) => void;
        readonly initial: Vidyano.PersistentObject; private _setInitial: (initial: Vidyano.PersistentObject) => void;
        readonly description: string; private _setDescription: (description: string) => void;
        readonly notification: INotification; private _setNotification: (notification: INotification) => void;
        error: string;
        background: string;
        step: Step
        userName: string;
        password: string;
        staySignedIn: boolean;
        twoFactorCode: string;

        private _translate(translations: { [key: string]: string; }, key: string, ...args: string[]): string {
            let msg = translations[key];
            if (!msg) {
                if (!this._isWarned) {
                    console.warn("It seems like you are connected to an older backend version of Vidyano. You must upgrade your backend before your sign in dialog will be fully translated.");
                    this._isWarned = true;
                }

                if (!this._fallbackTranslations) {
                    this._fallbackTranslations = {
                        "CancelSignIn": "Cancel",
                        "Default": "Default",
                        "ForgotPassword": "Forgot password?",
                        "Language": "Language",
                        "MustBeSignedIn": "You must be signed in before you can use this application.",
                        "No": "No",
                        "Or": "Or",
                        "Password": "Password",
                        "Register": "New here? Create an account",
                        "RegisterSave": "Register",
                        "RetrySignIn": "Retry",
                        "SignIn": "Sign in",
                        "SignInError": "An error occurred while signing in",
                        "SignInUsing": "Sign in using",
                        "SigningIn": "Signing in ...",
                        "StaySignedIn": "Stay signed in",
                        "EnterTwoFactorCode": "Enter two-factor code",
                        "TwoFactorCode": "Two-factor code",
                        "UserName": "User name",
                        "Yes": "Yes",
                        "SignInTo": "Sign in to {0}",
                        "Next": "Next",
                        "Previous": "Previous",
                        "EnterPassword": "Enter password",
                        "Welcome": "Welcome",
                        "NotYou": "Not you?"
                    };
                }

                msg = this._fallbackTranslations[key];
            }

            return StringEx.format(msg, ...args);
        }

        private async _activate(e: CustomEvent, { parameters }: { parameters: ISignInRouteParameters; }) {
            if (parameters.stateOrReturnUrl) {
                if (/^(register)$/i.test(parameters.stateOrReturnUrl)) {
                    this._setReturnUrl(decodeURIComponent(parameters.returnUrl || ""));
                    this.step = "register";
                    this._setNotification(null);

                    this._setIsBusy(true);
                    try {
                        this.app.importComponent("PersistentObjectTabPresenter");

                        const registerService = new Service(this.app.service.serviceUri, this.service.hooks);
                        await registerService.initialize(true);

                        registerService.staySignedIn = false;
                        await registerService.signInUsingCredentials(this.app.service.providers.Vidyano.registerUser, "");
                        const register = await registerService.getPersistentObject(null, this.app.service.providers.Vidyano.registerPersistentObjectId, undefined, true);

                        register.beginEdit();
                        register.stateBehavior = "StayInEdit";

                        this._setRegister(register);
                    }
                    catch (error) {
                        this.error = error;
                    }
                    finally {
                        this._setIsBusy(false);
                        return;
                    }
                }
                else {
                    const initial: Vidyano.PersistentObject = this.service["_initial"];
                    if (initial) {
                        this.app.importComponent("PersistentObjectTabPresenter");
                        this._setReturnUrl(decodeURIComponent(parameters.returnUrl || ""));
                        this.step = "initial";

                        initial.beginEdit();
                        initial.stateBehavior = "StayInEdit";

                        this._setInitial(initial);

                        return;
                    }
                }
            }

            this._setReturnUrl(decodeURIComponent(parameters.returnUrl || parameters.stateOrReturnUrl || ""));

            this.userName = (this.app.service.userName !== this.app.service.defaultUserName && this.app.service.userName !== this.app.service.registerUserName ? this.app.service.userName : "") || "";
            this.staySignedIn = Vidyano.cookie("staySignedIn", { force: true }) === "true";

            this._setHasVidyano(!!this.app.service.providers.Vidyano);
            this._setHasOther(Object.keys(this.app.service.providers).length > 1 || !this.hasVidyano);
            if (this.hasVidyano) {
                this._setHasForgot(this.app.service.providers.Vidyano.forgotPassword || false);
                this._setHasRegister(!!this.app.service.providers.Vidyano.registerUser && !!this.app.service.providers.Vidyano.registerPersistentObjectId);
            }

            if (this.hasVidyano)
                this._setDescription(this.app.service.providers.Vidyano.description || "");

            if (this.app.service.isSignedIn) {
                this.async(() => this.app.redirectToSignOut(), 0);

                e.preventDefault();
                return;
            }

            if (this.app.service.windowsAuthentication) {
                e.preventDefault();

                await this.app.service.signInUsingCredentials("", "");
                this.step = "authenticating";
                this.app.changePath(this.returnUrl);

                return;
            }// TODO: Check flow
            else if (this.app.service.providers && Object.keys(this.app.service.providers).length === 1 && !this.app.service.providers.Vidyano) {
                this._authenticateExternal(Object.keys(this.app.service.providers)[0]);
                return;
            }

            if (!this.service.isSignedIn)
                this.step = this.hasVidyano && this.userName ? "password" : "username";
        }

        private _deactivate() {
            this.password = this.twoFactorCode = "";
        }

        private _reset() {
            this.userName = "";
            this.step = "username";
        }

        private _stepChanged(step: Step) {
            Polymer.dom(this).flush();
            this._focus(step as string);
        }

        private _isStep(step: Step): boolean {
            return this.step === step;
        }

        private async _register() {
            if (this.step !== "register") {
                this.app.changePath("SignIn/Register", false);
                return;
            }

            try {
                await this.register.save();
                this._setNotification(this.register.notification ? {
                    text: this.register.notification,
                    type: this.register.notificationType
                } : null);

                this.userName = "";
                this.app.changePath("SignIn", true);
            }
            catch (error) {
                this._setNotification({
                    text: error,
                    type: NotificationType.Error
                });
            }
        }

        private async _finishInitial() {
            try {
                this._setIsBusy(true);

                await this.initial.save();
                this._setNotification(this.initial.notification ? {
                    text: this.initial.notification,
                    type: this.initial.notificationType
                } : null);

                this._setInitial(this.service["_initial"] = null);
                this.app.changePath(this.returnUrl || "", true);
            }
            catch (error) {
                this._setNotification({
                    text: error,
                    type: NotificationType.Error
                });
            }
            finally {
                this._setIsBusy(false);
            }
        }

        private _keydown(e: KeyboardEvent) {
            if (e.which === Keyboard.KeyCodes.enter) {
                switch (this.step) {
                    case "username": {
                        if (!StringEx.isNullOrEmpty(this.userName))
                            this._authenticate();

                        break;
                    }

                    case "password": {
                        if (!StringEx.isNullOrEmpty(this.password))
                            this._authenticate();

                        break;
                    }

                    case "twofactor": {
                        if (!StringEx.isNullOrEmpty(this.twoFactorCode))
                            this._authenticate();

                        break;
                    }
                }
            }
        }

        private _canAuthenticate(isBusy: boolean, userName: string, password: string, twoFactorCode: string): boolean {
            if (isBusy)
                return false;

            if (this.step === "username")
                return !StringEx.isNullOrEmpty(userName);

            if (this.step === "password")
                return !StringEx.isNullOrEmpty(password);

            if (this.step === "twofactor")
                return !StringEx.isNullOrEmpty(twoFactorCode);

            return false;
        }

        private async _authenticate() {
            this._setIsBusy(true);

            try {
                if (this.step === "username") {
                    if (this.service.providers.Vidyano.getCredentialType) {
                        const credentialType = await this.service.postJSON("authenticate/GetCredentialType", {
                            userName: this.userName
                        });

                        if (credentialType.redirectUri) {
                            document.location.assign(credentialType.redirectUri);
                            return;
                        }
                    }

                    this.step = "password";
                }
                else if (this.step === "password") {
                    try {
                        await this.app.service.signInUsingCredentials(this.userName, this.password);
                        this.app.changePath(decodeURIComponent(this.returnUrl || ""));
                        this.app.service.staySignedIn = this.staySignedIn;
                    }
                    catch (e) {
                        if (e === "Two-factor authentication enabled for user.")
                            this.step = "twofactor";
                        else
                            throw e;
                    }
                }
                else if (this.step === "twofactor") {
                    await this.app.service.signInUsingCredentials(this.userName, this.password, this.twoFactorCode);
                    this.app.changePath(decodeURIComponent(this.returnUrl || ""));
                    this.app.service.staySignedIn = this.staySignedIn;
                }
            }
            catch (e) {
                this.app.showAlert(e, Vidyano.NotificationType.Error);
            }
            finally {
                this._setIsBusy(false);
            }
        }

        private _authenticateExternal(e: TapEvent | string) {
            const key = typeof e === "string" ? e : e.model.provider.key;

            this._setIsBusy(true);
            setTimeout(() => {
                Vidyano.cookie("returnUrl", this.returnUrl, { expires: 1, force: true });
                this.app.service.signInExternal(key);
            }, 2000);
        }

        private _back() {
            if (this.step === "twofactor") {
                this.step = "password";
                this.password = this.twoFactorCode = "";
            }
            else if (this.step === "register") {
                this.app.changePath("SignIn" + (this.returnUrl ? `/${this.returnUrl}` : ""));
                this._setRegister(null);
            }
            else if (this.step === "initial") {
                this.app.changePath("SignOut/SignIn" + (this.returnUrl ? `/${this.returnUrl}` : ""));
                this._setInitial(this.service["_initial"] = null);
            }

            this._setNotification(null);
        }

        private _focus(element: string | HTMLInputElement, attempt: number = 0) {
            const input = typeof element === "string" ? <HTMLInputElement>this.$$(`#${element}`) : <HTMLInputElement>element;
            if (input) {
                input.focus();
                if (document.activeElement === input)
                    return;
            }

            if (attempt < 10)
                setTimeout(() => this._focus(input || element, attempt + 1), 100);
        }

        private _backgroundChanged() {
            this.$.background.style.backgroundImage = this.background ? "url(" + this.background + ")" : undefined;
            if (this.background)
                this.$.background.classList.add("has-image");
            else
                this.$.background.classList.remove("has-image");
        }

        private _providers(providers: { [name: string]: IProviderParameters }): { name: string; parameters: IProviderParameters; }[] {
            return Object.keys(providers).filter(key => key !== "Vidyano").map(key => {
                return {
                    key: key,
                    name: key.toLowerCase(),
                    parameters: this.service.providers[key]
                };
            });
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