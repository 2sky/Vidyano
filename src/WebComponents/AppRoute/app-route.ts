module Vidyano.WebComponents {
    var hashBang: string = "#!/";

    interface AppRouteComponentConstructor extends HTMLElement {
        new (): AppRouteComponentConstructor;
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
            }
        }
    })
    export class AppRoute extends WebComponent {
        private _constructor: AppRouteComponentConstructor;
        private _constructorChanged: boolean;
        private _parameters: { [key: string]: string } = {};
        active: boolean;

        private _setActive: (val: boolean) => void;

        constructor(public route: string, public component: string) {
            super();
        }

        attached() {
            super.attached();

            this.fire("app-route-add", { route: this.route, component: this.component });
        }

        activate(parameters: { [key: string]: string } = {}): boolean {
            if (this.active && this._parameters && JSON.stringify(this._parameters) === JSON.stringify(parameters))
                return false;

            var component = <WebComponent><any>Polymer.dom(this).children[0];
            if (!component || this._constructorChanged) {
                this._constructorChanged = false;

                this.empty();
                component = <WebComponent><any>new this._constructor();
                Polymer.dom(this).appendChild(component);
            }

            (<any>component)._setApp(this.app);
            if (component.fire("activating", { route: this, parameters: this._parameters = parameters }, { bubbles: false, cancelable: true }).defaultPrevented)
                return false;

            this._setActive(true);
            component.fire("activated", { route: this }, { bubbles: false, cancelable: false });

            return true;
        }

        deactivate() {
            this._setActive(false);
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