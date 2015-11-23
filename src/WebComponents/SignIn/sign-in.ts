module Vidyano.WebComponents {
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
            "activating": "_activating"
        }
    })
    export class SignIn extends WebComponent {
        error: string;
        image: string;

        private _activating(e: CustomEvent, detail: { route: AppRoute }) {
            var app = detail.route.app;

            if (app.service.isSignedIn) {
                app.service.signOut();
                app.cacheClear();
            }

            if (app.service.windowsAuthentication) {
                app.service.signInUsingCredentials("", "").then(() => {
                    app.changePath(decodeURIComponent(detail.route.parameters.returnUrl ? detail.route.parameters.returnUrl : ""));
                });
                return;
            }

            this.empty();

            for (var name in app.service.providers) {
                const provider = new WebComponents.SignInProvider();
                provider.name = name;

                Polymer.dom(this).appendChild(provider);
            }
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
        extends: "li",
        properties: {
            label: {
                type: String,
                computed: "_computeLabel(isAttached)",
            },
            description: {
                type: String,
                computed: "_computeDescription(isAttached)",
            },
            isVidyano: {
                type: Boolean,
                computed: "_computeIsVidyano(isAttached)",
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
            expand: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
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
                computed: "_computeSigninButtonLabel(signingIn, signingInCounter, isAttached)"
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
        name: string;
        userName: string;
        password: string;
        staySignedIn: boolean;
        isVidyano: boolean;
        expand: boolean;
        signingIn: boolean;
        signingInCounter: number;

        private _setExpand: (val: boolean) => void;
        private _setSigningIn: (val: boolean) => void;

        private _vidyanoSignInAttached() {
            this.userName = this.app.service.userName !== this.app.service.defaultUserName ? this.app.service.userName : "";
            this.staySignedIn = Vidyano.cookie("staySignedIn", { force: true }) == "true";
            this._autoFocus();
        }

        private _keydown(e: KeyboardEvent) {
            if (e.which == Keyboard.KeyCodes.enter && !StringEx.isNullOrEmpty(this.userName) && !StringEx.isNullOrEmpty(this.password))
                this._signIn();
        }

        private _computeLabel(): string {
            var parameters = this.app.service.providers[this.name];
            if (this.name == "Vidyano" && !parameters.label)
                return "Vidyano";

            return parameters.label;
        }

        private _computeDescription(): string {
            return this.app.service.providers[this.name].description || "";
        }

        private _computeIsVidyano(): boolean {
            return this.name == "Vidyano";
        }

        private _tap() {
            if (!this.isVidyano)
                this.app.service.signInExternal(this.name);
            else if (!this.expand) {
                this._setExpand(true);
                this._autoFocus();
            }
        }

        private _autoFocus() {
            if (StringEx.isNullOrEmpty(this.userName)) {
                var user = <HTMLInputElement><any>this.$$("input#user");
                user.focus();
            }
            else {
                var pass = <HTMLInputElement><any>this.$$("input#pass");
                pass.focus();
            }
        }

        private _signIn() {
            this._setSigningIn(true);

            var password = this.password;
            this.password = "";

            var currentRoute = this.app.currentRoute;
            this.app.service.staySignedIn = this.staySignedIn;
            this.app.service.signInUsingCredentials(this.userName, password).then(() => {
                this._setSigningIn(false);

                if (currentRoute == this.app.currentRoute)
                    this.app.changePath(decodeURIComponent(currentRoute.parameters.returnUrl ? currentRoute.parameters.returnUrl : ""));
            }, e => {
                    this._setSigningIn(false);

                    var pass = <HTMLInputElement><any>this.$$("input#pass");
                    pass.focus();
                });
        }

        private _computeSigninButtonLabel(signingIn: boolean, signingInCounter: number): string {
            if (!signingIn)
                return this.app.service.getTranslatedMessage("SignIn");

            var button = this._signInButton || (this._signInButton = <HTMLButtonElement><any>this.$$("button#signIn"));
            if (!this._signingInMessage) {
                this._signingInMessage = this.app.service.getTranslatedMessage("SigningIn").trimEnd(".").trimEnd(" ") + " ";
                var span = document.createElement("span");
                span.textContent = this._signingInMessage + "...";
                button.appendChild(span);
                button.style.width = span.offsetWidth + "px";
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