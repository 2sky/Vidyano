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
            }
            User.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._setService(this.app.service);
            };
            User.prototype.signIn = function () {
                this.app.changePath("SignIn");
            };
            User.prototype.signOut = function () {
                this.app.redirectToSignIn(false);
            };
            User.prototype.feedback = function () {
                var _this = this;
                this.service.getPersistentObject(null, this.service.application.feedbackId).then(function (po) {
                    var commentAttr = po.getAttribute("Comment");
                    commentAttr.options = ["Url: " + window.location, "Browser: " + navigator.userAgent];
                    commentAttr.isValueChanged = true;
                    _this.service.hooks.onOpen(po, false, true);
                });
            };
            User.prototype.userSettings = function () {
                this.app.changePath((this.app.programUnit ? this.app.programUnit.name + "/" : "") + "PersistentObject." + this.service.application.userSettingsId + "/" + this.service.application.userId);
            };
            User.prototype._signedInChanged = function () {
                var isSignedIn = this.service.isSignedIn && !this.service.isUsingDefaultCredentials;
                this._setIsSignedIn(isSignedIn);
                this._setUserName(isSignedIn ? this.service.userName : null);
                this._setCanFeedback(isSignedIn && !!this.service.application.feedbackId);
                this._setCanUserSettings(isSignedIn && !!this.service.application.userSettingsId);
            };
            return User;
        })(WebComponents.WebComponent);
        WebComponents.User = User;
        WebComponents.WebComponent.register(User, WebComponents, "vi", {
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
                }
            },
            forwardObservers: [
                "_signedInChanged(service.isSignedIn)",
                "_signedInChanged(service.isUsingDefaultCredentials)"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
