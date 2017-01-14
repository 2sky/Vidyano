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
                const provider = new WebComponents.SignInProvider(name === "Vidyano", providers.length === 1, returnUrl);
                provider.name = name;

                Polymer.dom(this).appendChild(provider);
            });
        }

        private _imageChanged() {
            this.$["image"].style.backgroundImage = this.image ? "url(" + this.image + ")" : undefined;
            if (this.image)
                this.$["image"].classList.add("has-image");
            else
                this.$["image"].classList.remove("has-image");
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
                notify: true
            },
            password: {
                type: String,
                notify: true
            },
            staySignedIn: {
                type: Boolean
            },
            signingIn: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true,
                value: false
            },
            signingInCounter: {
                type: Number,
                value: 0
            },
            signInLabel: {
                type: String,
                computed: "_computeSigninButtonLabel(signingIn, signingInCounter, app)"
            },
            twoFactorAuthentication: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            twoFactorCode: {
                type: String,
                notify: true
            }
        },
        listeners: {
            "tap": "_tap"
        }
    })
    export class SignInProvider extends WebComponent {
        private _signInButton: HTMLButtonElement;
        private _signInButtonWidth = 0;
        private _signingInMessage: string;
        readonly isVidyano: boolean; private _setIsVidyano: (val: boolean) => void;
        readonly signingIn: boolean; private _setSigningIn: (val: boolean) => void;
        readonly twoFactorAuthentication: boolean; private _setTwoFactorAuthentication: (val: boolean) => void;
        name: string;
        userName: string;
        password: string;
        staySignedIn: boolean;
        signingInCounter: number;
        twoFactorCode: string;


        constructor(isVidyano: boolean, private _isOnlyProvider: boolean, private _returnUrl: string) {
            super();

            this._setIsVidyano(isVidyano);
        }

        attached() {
            super.attached();

            if (this.isVidyano && this._isOnlyProvider) {
                Polymer.dom(this.root).querySelector("template")["render"]();
                const collapse = this.$$("#vidyano");
                collapse["noAnimation"] = true;
                collapse["opened"] = true;
                setTimeout(() => this._autoFocus(), 300);
            }
        }

        private _vidyanoSignInAttached() {
            this.userName = this.app.service.userName !== this.app.service.defaultUserName ? this.app.service.userName : "";
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
            this._setSigningIn(true);

            const currentRoute = this.app.currentRoute;
            this.app.service.staySignedIn = this.staySignedIn;
            try {
                await this.app.service.signInUsingCredentials(this.userName, this.password, this.twoFactorAuthentication ? this.twoFactorCode : undefined);
                this._setTwoFactorAuthentication(false);
                this._setSigningIn(false);

                this.password = "";
                this.twoFactorCode = "";

                if (currentRoute === this.app.currentRoute) {
                    const route = this.findParent<AppRoute>(e => e instanceof Vidyano.WebComponents.AppRoute);
                    this.app.changePath(decodeURIComponent(route.parameters.returnUrl || ""));
                }
            }
            catch (e) {
                this._setSigningIn(false);

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
        }

        private _computeSigninButtonLabel(signingIn: boolean, signingInCounter: number, app: Vidyano.WebComponents.App): string {
            if (!signingIn)
                return app.service.getTranslatedMessage("SignIn");

            const button = this._signInButton || (this._signInButton = <HTMLButtonElement><any>this.$$("button#signIn"));
            if (!this._signingInMessage) {
                this._signingInMessage = this.app.service.getTranslatedMessage("SigningIn").trimEnd(".").trimEnd(" ") + " ";
                const span = document.createElement("span");
                span.textContent = this._signingInMessage + "...";
                button.appendChild(span);
                button.style.width = `${span.offsetWidth + 6}px`;
                button.removeChild(span);
            }

            setTimeout(() => {
                if (this.signingInCounter + 1 > 3)
                    this.signingInCounter = 1;
                else
                    this.signingInCounter++;
            }, 500);

            return this._signingInMessage + Array(signingInCounter + 1).join(".");
        }
    }
}