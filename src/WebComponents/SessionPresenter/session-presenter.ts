module Vidyano.WebComponents {
    export class SessionPresenter extends WebComponent {
        private _sessionSourceTemplate: any;

        private _computeApplication(isAttached: boolean): Vidyano.Application {
            return isAttached ? this.app.service.application : null;
        }

        private _computeSession(session: Vidyano.PersistentObject): Vidyano.PersistentObject {
            if (!this._sessionSourceTemplate)
                this._sessionSourceTemplate = <any>Polymer.dom(this).querySelector("template");

            this._sessionSourceTemplate.session = session;
            return session;
        }
    }

    WebComponent.register(SessionPresenter, WebComponents, "vi", {
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
}