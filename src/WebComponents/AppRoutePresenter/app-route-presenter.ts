namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            currentRoute: {
                type: Object,
                readOnly: true,
                notify: true
            },
            notFound: {
                type: Boolean,
                value: false
            }
        }
    })
    export class AppRoutePresenter extends WebComponent {
        private _nodeObserver: PolymerDomChangeObserver;
        private _path: string;
        private _pathListener: Common.ISubjectDisposer;
        private _routeMap: { [key: string]: AppRoute } = {};
        private _routeUpdater: Promise<any> = Promise.resolve();
        readonly currentRoute: AppRoute; private _setCurrentRoute: (route: AppRoute) => void;
        notFound: boolean;

        attached() {
            super.attached();

            this._nodeObserver = Polymer.dom(this).observeNodes(this._nodesChanged.bind(this));
        }

        detached() {
            super.detached();

            if (this._nodeObserver) {
                Polymer.dom(this).unobserveNodes(this._nodeObserver);
                this._nodeObserver = null;
            }

            if (this._pathListener) {
                this._pathListener();
                this._pathListener = null;
            }
        }

        private _nodesChanged(info: PolymerDomChangedInfo) {
            info.addedNodes.filter(node => node instanceof Vidyano.WebComponents.AppRoute).forEach((appRoute: Vidyano.WebComponents.AppRoute) => {
                this._addRoute(appRoute, appRoute.route);
                if (appRoute.routeAlt)
                    this._addRoute(appRoute, appRoute.routeAlt);
            });

            if (this._pathListener)
                this._pathListener();

            this._pathListener = Vidyano.ServiceBus.subscribe("path-changed", (sender, message, details) => {
                if (sender === this)
                    return;

                const oldPath = this._path;
                this._pathChanged(this._path = details.path, oldPath);
            }, true);
        }

        private _addRoute(appRoute: AppRoute, route: string) {
            route = App.removeRootPath(route);
            if (this._routeMap[route])
                return;

            this._routeMap[route] = appRoute;
            Vidyano.Path.map(Path.routes.rootPath + route).to(() => {
                Vidyano.ServiceBus.send(this, "path-changed", { path: Vidyano.WebComponents.App.removeRootPath(Vidyano.Path.routes.current) });
            });
        }

        private async _pathChanged(path: string, oldPath: string) {
            await this.app.initializing;

            this._routeUpdater = this._routeUpdater.then(async () => {
                const initial: Vidyano.PersistentObject = this.service["_initial"];
                if (initial != null)
                    await (<AppServiceHooks>this.service.hooks).onInitial(initial);

                if (path !== this._path)
                    return;

                const mappedPathRoute = path != null || this.app.barebone ? Vidyano.Path.match(Path.routes.rootPath + path, true) : null;
                const newRoute = mappedPathRoute ? this._routeMap[App.removeRootPath(mappedPathRoute.path)] : null;

                if (!this.service.isSignedIn && (!newRoute || !newRoute.allowSignedOut)) {
                    this.app.redirectToSignIn();
                    return;
                }

                if (this.currentRoute) {
                    if (this.currentRoute === newRoute && this.currentRoute.matchesParameters(mappedPathRoute.params))
                        return;

                    if (!await this.currentRoute.deactivate(newRoute))
                        return;
                }

                Array.from(Polymer.dom(this.root).querySelectorAll("[dialog]")).forEach((dialog: Vidyano.WebComponents.Dialog) => dialog.close());

                const redirect = await (<AppServiceHooks>this.app.service.hooks).onAppRouteChanging(newRoute, this.currentRoute);
                if (redirect) {
                    this._setCurrentRoute(null);
                    this.async(() => this.app.changePath(redirect));

                    return;
                }

                if (!!newRoute)
                    await newRoute.activate(mappedPathRoute.params);

                this._setCurrentRoute(newRoute);
                this.notFound = !!path && !this.currentRoute;
            });
        }
    }
}