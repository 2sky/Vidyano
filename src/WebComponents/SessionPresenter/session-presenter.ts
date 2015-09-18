module Vidyano.WebComponents {
    @WebComponent.register({
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
    export class SessionPresenter extends WebComponent {
        private _templatePresenter: Vidyano.WebComponents.TemplatePresenter;

        private _computeApplication(isAttached: boolean): Vidyano.Application {
            return isAttached ? this.app.service.application : null;
        }

        private _computeSession(session: Vidyano.PersistentObject): Vidyano.PersistentObject {
            if (!this._templatePresenter)
                this._templatePresenter = new Vidyano.WebComponents.TemplatePresenter(<any>Polymer.dom(this).querySelector("template"), "session");

            this._templatePresenter.dataContext = session;

            if (!this._templatePresenter.isAttached)
                Polymer.dom(this).appendChild(this._templatePresenter);

            return session;
        }
    }
}