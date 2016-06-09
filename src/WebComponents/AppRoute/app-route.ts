namespace Vidyano.WebComponents {
    "use strict";

    interface IAppRouteComponentConstructor extends HTMLElement {
        new (app: App): IAppRouteComponentConstructor;
    }

    @WebComponent.register({
        properties: {
            route: {
                type: String,
                reflectToAttribute: true
            },
            component: {
                type: String,
                reflectToAttribute: true,
                observer: "_componentChanged"
            },
            active: {
                type: Boolean,
                readOnly: true,
                observer: "_activeChanged"
            },
            path: {
                type: String,
                readOnly: true
            },
            allowSignedOut: Boolean
        },
        listeners: {
            "title-changed": "_titleChanged"
        }
    })
    export class AppRoute extends WebComponent {
        private _constructor: IAppRouteComponentConstructor;
        private _constructorChanged: boolean;
        private _parameters: { [key: string]: string } = {};
        private _documentTitleBackup: string;
        allowSignedOut: boolean;
        active: boolean;
        path: string;
        deactivator: (result: boolean) => void;

        private _setActive: (val: boolean) => void;
        private _setPath: (val: string) => void;

        constructor(public route: string, public component: string) {
            super();
        }

        attached() {
            super.attached();

            this.fire("app-route-add", { route: this.route });
        }

        activate(parameters: { [key: string]: string } = {}) {
            if (this.active && this._parameters && JSON.stringify(this._parameters) === JSON.stringify(parameters))
                return;

            this._documentTitleBackup = document.title;

            let component = <WebComponent>Polymer.dom(this).children[0];
            if (!component || this._constructorChanged) {
                this._constructorChanged = false;
                component = <WebComponent><any>new this._constructor(this.app);

                this.empty();
                Polymer.dom(this).appendChild(component);
                Polymer.dom(this).flush();
            }
            else if (component.tagName === "TEMPLATE" && component.getAttribute("is") === "dom-template") {
                const template = <PolymerTemplate><any>component;

                this.empty();
                Polymer.dom(this).appendChild(template.stamp({ app: this.app }).root);
                Polymer.dom(this).flush();
            }

            this._parameters = parameters;
            if (!component.fire || !component.fire("app-route-activate", null, { bubbles: false, cancelable: true }).defaultPrevented) {
                this._setActive(true);
                this._setPath(this.app.path);

                (<AppServiceHooks>this.app.service.hooks).trackPageView(this.app.path);
            }
        }

        deactivate(): Promise<boolean> {
            const component = <WebComponent>Polymer.dom(this).children[0];

            return new Promise(resolve => {
                this.deactivator = resolve;
                if (!component || !component.fire || !component.fire("app-route-deactivate", null, { bubbles: false, cancelable: true }).defaultPrevented)
                    resolve(true);
            }).then(result => {
                if (result) {
                    this._setActive(false);
                    document.title = this._documentTitleBackup;
                }

                return result;
            });
        }

        reset() {
            if (!this._constructor)
                return;

            const component = <WebComponent>Polymer.dom(this).children[0];
            if (component) {
                Polymer.dom(this).removeChild(component);
                Polymer.dom(this).flush();
            }
        }

        get parameters(): any {
            return this._parameters;
        }

        private _activeChanged() {
            this.toggleClass("active", this.active);
        }

        private _titleChanged(e: CustomEvent, detail: { title: string; }) {
            if (this.app.noHistory || e.defaultPrevented || Polymer.dom(e.srcElement || <Node>e.target).parentNode !== this)
                return;

            if (this._documentTitleBackup !== detail.title && !!detail.title)
                document.title = `${detail.title} · ${this._documentTitleBackup}`;
            else
                document.title = this._documentTitleBackup;

            e.stopPropagation();
        }

        private _componentChanged() {
            this._constructor = <IAppRouteComponentConstructor><any>this.component.split(".").reduce((obj: any, path: string) => obj[path], window);
            this._constructorChanged = true;
        }
    }
}