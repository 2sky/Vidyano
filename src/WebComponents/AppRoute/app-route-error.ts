namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            title: {
                type: String,
                readOnly: true
            },
            message: {
                type: String,
                readOnly: true
            }
        },
        listeners: {
            "app-route-activate": "_activate"
        }
    })
    export class AppRouteError extends WebComponent {
        private _setTitle: (value: string) => void;
        private _setMessage: (value: string) => void;

        private _activate(e: CustomEvent) {
            const route = <AppRoute>Polymer.dom(this).parentNode;
            const message = decodeURIComponent(route.parameters.message);

            this._setTitle(this.translations && this.translations[message + "Title"] ? this.translations[message + "Title"] : null);
            this._setMessage(this.translations && this.translations[message] ? this.translations[message] : message);
        }
    }
}