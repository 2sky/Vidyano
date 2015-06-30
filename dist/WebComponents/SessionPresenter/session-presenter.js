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
        var SessionPresenter = (function (_super) {
            __extends(SessionPresenter, _super);
            function SessionPresenter() {
                _super.apply(this, arguments);
            }
            SessionPresenter.prototype._computeApplication = function (isAttached) {
                return isAttached ? this.app.service.application : null;
            };
            SessionPresenter.prototype._computeSession = function (session) {
                if (!this._sessionSourceTemplate)
                    this._sessionSourceTemplate = Polymer.dom(this).querySelector("template");
                this._sessionSourceTemplate.session = session;
                return session;
            };
            return SessionPresenter;
        })(WebComponents.WebComponent);
        WebComponents.SessionPresenter = SessionPresenter;
        WebComponents.WebComponent.register(SessionPresenter, WebComponents, "vi", {
            properties: {
                session: {
                    type: Object,
                    computed: "_computeSession(application.session, isAttached)"
                },
                application: {
                    type: Object,
                    computed: "_computeApplication(isAttached)"
                }
            },
            forwardObservers: [
                "application.session"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
