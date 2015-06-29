var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var SignIn = (function (_super) {
            __extends(SignIn, _super);
            function SignIn() {
                _super.apply(this, arguments);
            }
            SignIn.prototype._activating = function (e, detail) {
                if (detail.route.app.service.isSignedIn) {
                    detail.route.app.service.signOut();
                    detail.route.app.cacheClear();
                }
                this.empty();
                var providerNames = [];
                for (var name in detail.route.app.service.providers) {
                    providerNames.push(name);
                    var provider = new WebComponents.SignInProvider();
                    provider.name = name;
                    Polymer.dom(this).appendChild(provider);
                }
                this._setVidyanoOnly(providerNames.length == 1 && providerNames[0] == "Vidyano");
            };
            SignIn.prototype._imageChanged = function () {
                this.$["image"].style.backgroundImage = this.image ? "url(" + this.image + ")" : undefined;
                if (this.image)
                    this.$["image"].classList.add("has-image");
                else
                    this.$["image"].classList.remove("has-image");
            };
            return SignIn;
        })(WebComponents.WebComponent);
        WebComponents.SignIn = SignIn;
        var SignInProvider = (function (_super) {
            __extends(SignInProvider, _super);
            function SignInProvider() {
                _super.apply(this, arguments);
                this._signInButtonWidth = 0;
            }
            SignInProvider.prototype._vidyanoSignInAttached = function () {
                this.userName = this.app.service.userName !== this.app.service.defaultUserName ? this.app.service.userName : "";
                this._autoFocus();
            };
            SignInProvider.prototype._keydown = function (e) {
                if (e.which == WebComponents.KeyCodes.enter && !StringEx.isNullOrEmpty(this.userName) && !StringEx.isNullOrEmpty(this.password))
                    this._signIn();
            };
            SignInProvider.prototype._computeLabel = function () {
                var parameters = this.app.service.providers[this.name];
                if (this.name == "Vidyano" && !parameters.label)
                    return "Vidyano";
                return parameters.label;
            };
            SignInProvider.prototype._computeDescription = function () {
                return this.app.service.providers[this.name].description || "";
            };
            SignInProvider.prototype._computeIsVidyano = function () {
                return this.name == "Vidyano";
            };
            SignInProvider.prototype._tap = function () {
                if (!this.isVidyano)
                    this.app.service.signInExternal(this.name);
                else if (!this.expand) {
                    this._setExpand(true);
                    this._autoFocus();
                }
            };
            SignInProvider.prototype._autoFocus = function () {
                if (StringEx.isNullOrEmpty(this.userName)) {
                    var user = this.$$("input#user");
                    user.focus();
                }
                else {
                    var pass = this.$$("input#pass");
                    pass.focus();
                }
            };
            SignInProvider.prototype._signIn = function () {
                var _this = this;
                this._setSigningIn(true);
                var password = this.password;
                this.password = "";
                var currentRoute = this.app.currentRoute;
                this.app.service.signInUsingCredentials(this.userName, password).then(function () {
                    _this._setSigningIn(false);
                    if (currentRoute == _this.app.currentRoute)
                        _this.app.changePath(decodeURIComponent(currentRoute.parameters.returnUrl ? currentRoute.parameters.returnUrl : ""));
                }, function (e) {
                    _this._setSigningIn(false);
                    var pass = _this.$$("input#pass");
                    pass.focus();
                });
            };
            SignInProvider.prototype._computeSigninButtonLabel = function (signingIn, signingInCounter) {
                var _this = this;
                if (!signingIn)
                    return this.app.service.getTranslatedMessage("SignIn");
                var button = this._signInButton || (this._signInButton = this.$$("button#signIn"));
                if (!this._signingInMessage) {
                    this._signingInMessage = this.app.service.getTranslatedMessage("SigningIn").trimEnd(".").trimEnd(" ") + " ";
                    var span = document.createElement("span");
                    span.textContent = this._signingInMessage + "...";
                    button.appendChild(span);
                    button.style.width = span.offsetWidth + "px";
                    button.removeChild(span);
                }
                setTimeout(function () {
                    if (_this.signingInCounter + 1 > 3)
                        _this.signingInCounter = 1;
                    else
                        _this.signingInCounter++;
                }, 500);
                return this._signingInMessage + Array(signingInCounter + 1).join(".");
            };
            return SignInProvider;
        })(WebComponents.WebComponent);
        WebComponents.SignInProvider = SignInProvider;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.SignIn, Vidyano.WebComponents, "vi", {
            properties: {
                error: {
                    type: String,
                    notify: true
                },
                label: String,
                image: {
                    type: String,
                    observer: "_imageChanged"
                },
                vidyanoOnly: {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                }
            },
            listeners: {
                "activating": "_activating"
            }
        });
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.SignInProvider, Vidyano.WebComponents, "vi", {
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
            },
            extends: "li"
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
