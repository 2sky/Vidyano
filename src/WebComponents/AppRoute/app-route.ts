module Vidyano.WebComponents {
    var hashBang: string = "#!/";

    interface AppRouteComponentConstructor extends HTMLElement {
        new (app: App): AppRouteComponentConstructor;
    }

    export interface AppRouteActivateArgs {
        route: AppRoute;
        parameters: { [key: string]: string };
    }

    export interface AppRouteDeactivateArgs {
        route: AppRoute;
        newRoute: AppRoute;
        newPath: string;
        resolve: (deactivate: boolean) => void;
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
                reflectToAttribute: true,
                readOnly: true
            },
            path: {
                type: String,
                readOnly: true
            }
        }
    })
    export class AppRoute extends WebComponent {
        private _constructor: AppRouteComponentConstructor;
        private _constructorChanged: boolean;
        private _parameters: { [key: string]: string } = {};
        active: boolean;
        path: string;

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

            var component = <WebComponent>Polymer.dom(this).children[0];
            if (!component || this._constructorChanged) {
                this._constructorChanged = false;

                this.empty();
                component = <WebComponent><any>new this._constructor(this.app);
                Polymer.dom(this).appendChild(component);
                Polymer.dom(this).flush();
            }

            if (!component.fire("activate", { route: this, parameters: this._parameters = parameters }, { bubbles: false, cancelable: true }).defaultPrevented) {
                this._setActive(true);
                this._setPath(this.app.path);
            }
        }

        deactivate(newRoute?: AppRoute): Promise<boolean> {
            return new Promise(resolve => {
                var component = <WebComponent>Polymer.dom(this).children[0];
                if (!component || !component.fire("deactivate", { route: this, newRoute: newRoute, resolve: resolve, newPath: this.app.path }, { bubbles: false, cancelable: true }).defaultPrevented)
                    resolve(true);
            }).then(result => {
                if (result)
                    this._setActive(false);

                return result;
            });
        }

        get parameters(): any {
            return this._parameters;
        }

        private _componentChanged() {
            this._constructor = <AppRouteComponentConstructor><any>this.component.split(".").reduce((obj: any, path: string) => obj[path], window);
            this._constructorChanged = true;
        }
    }
}