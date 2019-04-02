namespace Vidyano.WebComponents {
    export type RouteInfo = {
        route: AppRoute;
        parameters: any;
    };

    @WebComponent.register({
        properties: {
            activeRoute: {
                type: Object,
                notify: true,
                readOnly: true
            },
            notFound: {
                type: Boolean,
                value: false,
                readOnly: true
            },
            path: {
                type: String,
                notify: true,
                observer: "_pathChanged"
            }
        }
    })
    export class AppRoutePresenter extends WebComponent {
        private _pathChangedTask: number;
        private _routesObserver: Polymer.FlattenedNodesObserver;
        private _routeMap: { [key: string]: AppRoute } = {};
        readonly activeRoute: RouteInfo; private _setActiveRoute: (activeRoute: RouteInfo) => void;
        readonly notFound: boolean; private _setNotFound: (notFound: boolean) => void;
        path: string;

        connectedCallback() {
            super.connectedCallback();

            this.fire("app-route-presenter-connected");

            this._routesObserver = new Polymer.FlattenedNodesObserver(this.$.routes, (info: any) => {
                info.addedNodes.filter((route: Element) => route instanceof AppRoute).forEach((appRoute: AppRoute) => {
                    const route = AppBase.removeRootPath(appRoute.route);

                    this._routeMap[route] = appRoute;

                    Vidyano.Path.map(Path.routes.rootPath + route).to(() => this.path = AppBase.removeRootPath(Vidyano.Path.routes.current));
                });
              });
        }
        disconnectedCallback() {
            super.disconnectedCallback();

            this._routesObserver.disconnect();
        }

        private async _pathChanged(path: string) {
            await this.app.initialize;

            let currentPath = this.path;
            const initial: Vidyano.PersistentObject = this.service["_initial"];
            if (initial != null)
                await (<AppServiceHooks>this.service.hooks).onInitial(initial);

            if (currentPath !== this.path)
                return;

            const mappedPathRoute = path != null ? Vidyano.Path.match(Path.routes.rootPath + path, true) : null;
            const newRoute = mappedPathRoute ? this._routeMap[AppBase.removeRootPath(mappedPathRoute.path)] : null;

            if (newRoute) {
                const routeInfo: RouteInfo = {
                    route: newRoute,
                    parameters: mappedPathRoute.params || {}
                };

                if (!this.service.isSignedIn && !newRoute.allowSignedOut) {
                    this.app.redirectToSignIn();
                    return;
                }

                if (this.activeRoute) {
                    if (this.activeRoute.route === routeInfo.route && this.activeRoute.route.matchesParameters(routeInfo.parameters))
                        return;

                    if (!await this.activeRoute.route.deactivate(routeInfo))
                        return;
                }

                Array.from(this.shadowRoot.querySelectorAll("[dialog]")).forEach((dialog: Vidyano.WebComponents.Dialog) => dialog.close());

                const redirect = await (<AppServiceHooks>this.service.hooks).onAppRouteChanging(routeInfo, this.activeRoute);
                if (redirect) {
                    this._setActiveRoute(null);
                    Polymer.Async.microTask.run(() => this.app.changePath(redirect));

                    return;
                }

                await routeInfo.route.activate(routeInfo.parameters);

                this._setActiveRoute(routeInfo);
            }
            else {
                if (this.activeRoute && !await this.activeRoute.route.deactivate(null))
                    return;

                this._setActiveRoute(null);
            }

            this._setNotFound(!!path && !this.activeRoute);
        }

        clear() {
            for (const route in this._routeMap)
                this._routeMap[route].reset();

            this._setActiveRoute(null);
        }
    }
}