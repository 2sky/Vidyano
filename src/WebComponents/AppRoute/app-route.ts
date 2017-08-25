namespace Vidyano.WebComponents {
    "use strict";

    interface IAppRouteComponentConstructor extends HTMLElement {
        new (): IAppRouteComponentConstructor;
    }

    export interface IAppRouteActivatedArgs {
        route: Vidyano.WebComponents.AppRoute;
        parameters: { [key: string]: string };
    }

    @WebComponent.register({
        properties: {
            route: {
                type: String,
                reflectToAttribute: true
            },
            component: {
                type: String,
                reflectToAttribute: true
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
            allowSignedOut: Boolean,
            preserveContent: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        listeners: {
            "title-changed": "_titleChanged"
        }
    })
    export class AppRoute extends WebComponent {
        private _constructor: IAppRouteComponentConstructor;
        private _constructorComponent: string;
        private _constructorChanged: boolean;
        private _hasChildren: boolean;
        private _parameters: { [key: string]: string } = {};
        private _documentTitleBackup: string;
        readonly active: boolean; private _setActive: (val: boolean) => void;
        readonly path: string; private _setPath: (val: string) => void;
        allowSignedOut: boolean;
        deactivator: (result: boolean) => void;
        preserveContent: boolean;

        constructor(public route: string, public component: string) {
            super();
        }

        matchesParameters(parameters: { [key: string]: string } = {}): boolean {
            return this._parameters && JSON.stringify(this._parameters) === JSON.stringify(parameters);
        }

        async activate(parameters: { [key: string]: string } = {}): Promise<any> {
            if (this.active && this.matchesParameters(parameters))
                return;

            this._documentTitleBackup = document.title;
            this._parameters = parameters;

            this._setActive(true);

            if (this.preserveContent && Array.from(this.children).length > 0)
                this._activate(<WebComponent>this.children[0]);
            else {
                this._clearChildren();
                if (this.component) {
                    if (this._constructorComponent !== this.component) {
                        this._constructor = this._constructorFromComponent(this.component);
                        if (!this._constructor) {
                            if (!this._constructor && this.component.startsWith("Vidyano.WebComponents.")) {
                                const component = this.component;

                                await this.app.importComponent(this.component.replace(/^(Vidyano.WebComponents.)/, ""));
                                if (this.component !== component || (this._parameters && JSON.stringify(this._parameters) !== JSON.stringify(parameters)))
                                    return;

                                this._constructor = this._constructorFromComponent(this.component);
                                if (this._constructor) {
                                    this._constructorComponent = this.component;
                                    this._distributeNewComponent();
                                }
                            }
                        }
                        else {
                            this._constructorComponent = this.component;
                            this._distributeNewComponent();
                        }
                    }
                    else
                        this._distributeNewComponent();
                }
                else {
                    const template = this.querySelector("dom-template");
                    if (template) {
                        // TODO
                        debugger;
                    //    Polymer.dom(this).appendChild(template.stamp({ app: this.app }).root);
                    //    Polymer.dom(this).flush();

                    //    this._hasChildren = true;
                    }
                    else {
                        const firstChild = <WebComponent>this.children[0];
                        if (firstChild)
                            this._activate(firstChild);
                    }
                }
            }

            this._setPath(this.app.path);

            (<AppServiceHooks>this.app.service.hooks).trackPageView(this.app.path);
        }

        private _constructorFromComponent(component: string): IAppRouteComponentConstructor {
            return <IAppRouteComponentConstructor><any>this.component.split(".").reduce((obj: any, path: string) => obj[path], window);
        }

        private _distributeNewComponent() {
            if (!this._constructor || this._constructorComponent !== this.component)
                return;

            this._clearChildren();

            const componentInstance = <WebComponent><any>new this._constructor();
            this.appendChild(componentInstance);
            Polymer.flush();

            this._hasChildren = true;

            this._activate(componentInstance);
        }

        private _activate(target: WebComponent) {
            target.dispatchEvent(new CustomEvent("app-route-activate", { detail: { route: this, parameters: this._parameters }, bubbles: true, composed: true }));
        }

        private _clearChildren() {
            if (!this._hasChildren)
                return;

            Array.from(this.children).filter(c => c.tagName !== "TEMPLATE" && c.getAttribute("is") !== "dom-template").forEach(c => this.removeChild(c));
            this._hasChildren = false;
        }

        deactivate(nextRoute?: AppRoute): Promise<boolean> {
            const component = <WebComponent>this.children[0];
            return new Promise<boolean>(resolve => {
                this.deactivator = resolve;
                if (!component || !(component instanceof WebComponent) || component.dispatchEvent(new CustomEvent("app-route-deactivate", { bubbles: false, cancelable: true, composed: true })))
                    resolve(true);
            }).then(result => {
                if (result) {
                    if (!this.preserveContent || nextRoute !== this)
                        this._setActive(false);

                    document.title = this._documentTitleBackup;
                }

                return result;
            });
        }

        reset() {
            this._setActive(false);

            if (!this._constructor)
                return;

            this._clearChildren();
        }

        get parameters(): any {
            return this._parameters;
        }

        private _activeChanged() {
            this.classList.toggle("active", this.active);

            if (this.activate)
                dispatchEvent(new CustomEvent("app-route-activated"));
            else
                dispatchEvent(new CustomEvent("app-route-deactivated"));
        }

        private _titleChanged(e: CustomEvent) {
            if (!this.active || this.app.noHistory || e.defaultPrevented || (e.srcElement || <Node>e.target).parentNode !== this)
                return;

            const { title }: { title: string } = e.detail;
            if (this._documentTitleBackup !== title && !!title)
                document.title = `${title} · ${this._documentTitleBackup}`;
            else
                document.title = this._documentTitleBackup;

            e.stopPropagation();
        }
    }
}