var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
                if (!this._templatePresenter)
                    this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(Polymer.dom(this).querySelector("template"), "session");
                this._templatePresenter.dataContext = session;
                if (!this._templatePresenter.isAttached)
                    Polymer.dom(this).appendChild(this._templatePresenter);
                return session;
            };
            SessionPresenter = __decorate([
                WebComponents.WebComponent.register({
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
                })
            ], SessionPresenter);
            return SessionPresenter;
        })(WebComponents.WebComponent);
        WebComponents.SessionPresenter = SessionPresenter;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
