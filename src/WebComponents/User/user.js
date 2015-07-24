var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var User = (function (_super) {
            __extends(User, _super);
            function User() {
                _super.apply(this, arguments);
                this._observeDisposers = [];
            }
            User.prototype.attached = function () {
                _super.prototype.attached.call(this);
                // Set local service property because vi-app is not observable
                this._setService(this.app.service);
            };
            User.prototype.signIn = function () {
                this.app.changePath("SignIn");
            };
            User.prototype.signOut = function () {
                this.app.redirectToSignIn(false);
            };
            User.prototype._computeIsSignedIn = function (isSignedIn, isUsingDefaultCredentials) {
                return isSignedIn && !isUsingDefaultCredentials;
            };
            return User;
        })(WebComponents.WebComponent);
        WebComponents.User = User;
        WebComponents.WebComponent.register(User, WebComponents, "vi", {
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
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
