namespace Vidyano.WebComponents {
    "use strict";

    declare type Step = "username" | "password" | "twofactor" | "register" | "initial";

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
            logo: {
                type: String,
                value: ""
            },
            label: {
                type: String,
                value: null
            },
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
        readonly returnUrl: string; private _setReturnUrl: (returnUrl: string) => void;
        readonly isBusy: boolean; private _setIsBusy: (val: boolean) => void;
        readonly hasVidyano: boolean; private _setHasVidyano: (hasVidyano: boolean) => void;
        readonly hasOther: boolean; private _setHasOther: (hasOther: boolean) => void;
        readonly hasForgot: boolean; private _setHasForgot: (hasForgot: boolean) => void;
        readonly hasRegister: boolean; private _setHasRegister: (hasRegister: boolean) => void;
        readonly register: Vidyano.PersistentObject; private _setRegister: (register: Vidyano.PersistentObject) => void;
        readonly initial: Vidyano.PersistentObject; private _setInitial: (initial: Vidyano.PersistentObject) => void;
        readonly description: string; private _setDescription: (description: string) => void;
        private readonly notification: INotification; private _setNotification: (notification: INotification) => void;
        private step: Step;
        userName: string;
        password: string;
        staySignedIn: boolean;
        twoFactorCode: string;

        private async _activate(e: CustomEvent, { parameters }: { parameters: ISignInRouteParameters; }) {
            if (parameters.stateOrReturnUrl) {
                if (/^(register)$/i.test(parameters.stateOrReturnUrl)) {
                    this._setReturnUrl(decodeURIComponent(parameters.returnUrl || ""));

                    this._setNotification(null);
                    this._setIsBusy(true);
                    try {
                        this.app.importComponent("PersistentObjectTabPresenter");

                        const registerService = new Service(this.app.service.serviceUri, this.service.hooks, true);
                        await registerService.initialize(true);

                        registerService.staySignedIn = false;
                        await registerService.signInUsingCredentials(this.app.service.providers.Vidyano.registerUser, "");
                        const register = await registerService.getPersistentObject(null, this.app.service.providers.Vidyano.registerPersistentObjectId, undefined, true);

                        register.beginEdit();
                        register.stateBehavior = "StayInEdit";

                        this._setRegister(register);
                        this.step = "register";
                    }
                    catch (error) {
                        this._error(error);
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

                        initial.beginEdit();
                        initial.stateBehavior = "StayInEdit";

                        this._setInitial(initial);
                        this.step = "initial";

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
                this.app.changePath(this.returnUrl);

                return;
            }
            else if (this.app.service.providers && Object.keys(this.app.service.providers).length === 1 && !this.app.service.providers.Vidyano) {
                this._authenticateExternal(Object.keys(this.app.service.providers)[0]);
                return;
            }

            if (!this.service.isSignedIn) {
                if (this.userName && this.service.providers.Vidyano.getCredentialType) {
                    this._setIsBusy(true);
                    this.step = "username";

                    try {
                        const credentialType = await this.service.postJSON("authenticate/GetCredentialType", {
                            userName: this.userName
                        });

                        if (credentialType.redirectUri) {
                            setTimeout(() => {
                                Vidyano.cookie("returnUrl", this.returnUrl, { expires: 1, force: true });
                                document.location.assign(credentialType.redirectUri);
                            }, 500);
                            return;
                        }

                        this._setIsBusy(false);
                    }
                    catch (error) {
                        this._error(error);
                        this._setIsBusy(false);
                    }
                }

                this.step = this.hasVidyano && this.userName ? "password" : "username";
            }
        }

        private _deactivate() {
            this.password = this.twoFactorCode = "";
        }

        private _back() {
            if (this.step === "password") {
                this.userName = "";
                this.step = "username";
            }
            else if (this.step === "twofactor") {
                this.password = this.twoFactorCode = "";
                this.step = "password";
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

        private _stepChanged(step: Step, oldStep: Step) {
            if (oldStep)
                (Polymer.dom(this.root).querySelector(`section.${oldStep}`) as HTMLElement).classList.remove("active");

            (Polymer.dom(this.root).querySelector(`section.${step}`) as HTMLElement).classList.add("active");

            Polymer.dom(this).flush();
            this._focusElement(step as string);
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
                    type: "Error"
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
                    type: "Error"
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
                            setTimeout(() => {
                                Vidyano.cookie("returnUrl", this.returnUrl, { expires: 1, force: true });
                                document.location.assign(credentialType.redirectUri);
                            }, 500);
                            return;
                        }
                    }

                    this.step = "password";
                }
                else if (this.step === "password") {
                    try {
                        await this.app.service.signInUsingCredentials(this.userName, this.password, this.staySignedIn);
                        this.app.changePath(decodeURIComponent(this.returnUrl || ""));
                    }
                    catch (e) {
                        if (e === "Two-factor authentication enabled for user.")
                            this.step = "twofactor";
                        else
                            throw e;
                    }
                }
                else if (this.step === "twofactor") {
                    await this.app.service.signInUsingCredentials(this.userName, this.password, this.twoFactorCode, this.staySignedIn);
                    this.app.changePath(decodeURIComponent(this.returnUrl || ""));
                }

                this._setIsBusy(false);
            }
            catch (error) {
                this._error(error);
                this._setIsBusy(false);
            }
        }

        private _authenticateExternal(e: TapEvent | string) {
            const key = typeof e === "string" ? e : e.model.provider.key;

            this._setIsBusy(true);
            setTimeout(() => {
                Vidyano.cookie("returnUrl", this.returnUrl, { expires: 1, force: true });
                this.app.service.signInExternal(key);
            }, 500);
        }

        private async _forgot() {
            this._setIsBusy(true);

            try {
                const result = await this.service.forgotPassword(this.userName);
                this._setNotification({
                    text: result.notification,
                    type: result.notificationType
                });

                this._focusElement(this.$.password);
            }
            catch (error) {
                this._error(error);
            }
            finally {
                this._setIsBusy(false);
            }
        }

        private _computeSaveInitialLabel(po: Vidyano.PersistentObject): string {
            if (!po)
                return null;

            let label: string;
            const endEdit = po.getAction("EndEdit") || po.getAction("Save");
            if (endEdit)
                label = endEdit.displayName;

            return label || this.translateMessage("Save");
        }

        private _error(error: string) {
            this._setNotification(error ? {
                text: error,
                type: "Error"
            } : null);
        }

        private _providers(providers: { [name: string]: Service.ProviderParameters }): { name: string; parameters: Service.ProviderParameters; }[] {
            return Object.keys(providers).filter(key => key !== "Vidyano").map(key => {
                return {
                    key: key,
                    name: key.toLowerCase(),
                    parameters: this.service.providers[key]
                };
            });
        }

        private _tabInnerSizeChanged(e: CustomEvent, detail: { size: ISize; }) {
            e.stopPropagation();

            if (!detail.size.height)
                return;

            const tabPresenter = <PersistentObjectTabPresenter>e.currentTarget;
            tabPresenter.style.height = `${detail.size.height}px`;
        }
    }
}