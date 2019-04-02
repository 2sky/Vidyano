/* tslint:disable:no-var-keyword */
var _gaq: any[];
/* tslint:enable:no-var-keyword */

namespace Vidyano.WebComponents {
    export class AppServiceHooksBase extends Vidyano.ServiceHooks {
        constructor(public app: AppBase) {
            super();
        }

        private _initializeGoogleAnalytics() {
            let addScript = false;
            if (typeof (_gaq) === "undefined") {
                _gaq = [];
                addScript = true;
            }

            _gaq.push(["_setAccount", this.app.service.application.analyticsKey]);
            _gaq.push(["_setDomainName", "none"]); // NOTE: Track all domains

            if (addScript) {
                const ga = document.createElement("script");
                ga.type = "text/javascript"; ga.async = true;
                ga.src = ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";

                const script = document.getElementsByTagName("script")[0];
                script.parentNode.insertBefore(ga, script);
            }
        }

        trackEvent(action: string, option: string, owner: ServiceObjectWithActions) {
            if (!this.app || !this.app.service || !this.app.service.application || !this.app.service.application.analyticsKey)
                return;

            this._initializeGoogleAnalytics();

            let page = "Unknown";
            let type = "Unknown";

            if (owner != null) {
                if (owner instanceof Vidyano.Query) {
                    page = "Query";
                    type = owner.persistentObject.type;
                }
                else if (owner instanceof Vidyano.PersistentObject) {
                    page = "PersistentObject";
                    type = owner.type;
                }
            }

            _gaq.push(["_setCustomVar", 1, "UserId", this.getTrackUserId(), 1]);
            _gaq.push(["_setCustomVar", 2, "Page", page, 2]);
            _gaq.push(["_setCustomVar", 3, "Type", type, 2]);
            _gaq.push(["_setCustomVar", 4, "Option", option, 2]);

            _gaq.push(["_trackEvent", "Action", action.split(".").pop()]);
        }

        trackPageView(path: string) {
            if (!this.app || !this.app.service || !this.app.service.application || !this.app.service.application.analyticsKey)
                return;

            path = Vidyano.WebComponents.AppBase.removeRootPath(path);
            if (!path || path.startsWith("FromAction"))
                return;

            this._initializeGoogleAnalytics();

            _gaq.push(["_setCustomVar", 1, "UserId", this.getTrackUserId(), 1]);
            _gaq.push(["_trackPageview", path]);
        }

        getTrackUserId(): string {
            return ""; // e.g. this.app.service.application.userId
        }

        getPersistentObjectConfig(persistentObject: Vidyano.PersistentObject, persistentObjectConfigs: PersistentObjectConfig[]): PersistentObjectConfig {
            return persistentObjectConfigs.find(c => (c.id === persistentObject.id || c.type === persistentObject.type || c.type === persistentObject.fullTypeName) && c.objectId === persistentObject.objectId) ||
                persistentObjectConfigs.find(c => !c.objectId && (c.id === persistentObject.id || c.type === persistentObject.type || c.type === persistentObject.fullTypeName));
        }

        getAttributeConfig(attribute: Vidyano.PersistentObjectAttribute, attributeConfigs: PersistentObjectAttributeConfig[]): PersistentObjectAttributeConfig {
            return attributeConfigs.find(c => c.parentObjectId === attribute.parent.objectId && c.parentId === attribute.parent.id && (c.name === attribute.name || c.type === attribute.type)) ||
                attributeConfigs.find(c => c.parentId === attribute.parent.id && (c.name === attribute.name || c.type === attribute.type)) ||
                attributeConfigs.find(c => c.name === attribute.name && c.type === attribute.type && !c.parentId) ||
                attributeConfigs.find(c => c.name === attribute.name && !c.parentId && !c.type) ||
                attributeConfigs.find(c => c.type === attribute.type && !c.parentId && !c.name);
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab, tabConfigs: PersistentObjectTabConfig[]): PersistentObjectTabConfig {
            return tabConfigs.find(c => c.name === tab.name && (c.type === tab.parent.type || c.type === tab.parent.fullTypeName || c.id === tab.parent.id) && c.objectId === tab.parent.objectId) ||
                tabConfigs.find(c => c.name === tab.name && (c.type === tab.parent.type || c.type === tab.parent.fullTypeName || c.id === tab.parent.id));
        }

        getProgramUnitConfig(name: string, programUnitConfigs: ProgramUnitConfig[]): ProgramUnitConfig {
            return programUnitConfigs.find(c => c.name === name);
        }

        getQueryConfig(query: Vidyano.Query, queryConfigs: QueryConfig[]): QueryConfig {
            return queryConfigs.find(c => c.id === query.id || c.name === query.name) ||
                queryConfigs.find(c => c.type === query.persistentObject.type) ||
                queryConfigs.find(c => !c.id && !c.name && !c.type);
        }

        getQueryChartConfig(type: string, queryChartConfigs: QueryChartConfig[]): QueryChartConfig {
            return queryChartConfigs.find(c => c.type === type);
        }

        onConstructApplication(application: IServiceApplication): Application {
            const app = super.onConstructApplication(application);
            this.app.sensitive = app.hasSensitive && BooleanEx.parse(Vidyano.cookie("sensitive")) !== false;

            return app;
        }

        onConstructQuery(service: Service, query: any, parent?: Vidyano.PersistentObject, asLookup: boolean = false, maxSelectedItems?: number): Vidyano.Query {
            const newQuery = super.onConstructQuery(service, query, parent, asLookup, maxSelectedItems);

            const queryConfig = this.app.configuration.getQueryConfig(newQuery);
            if (queryConfig) {
                if (queryConfig.defaultChart)
                    newQuery.defaultChartName = queryConfig.defaultChart;

                if (queryConfig.selectAll)
                    newQuery.selectAll.isAvailable = true;
            }

            return newQuery;
        }

        async onActionConfirmation(action: Action, option: number): Promise<boolean> {
            const result = await this.app.showMessageDialog({
                title: action.displayName,
                titleIcon: "Action_" + action.name,
                message: this.service.getTranslatedMessage(action.definition.confirmation, option >= 0 ? action.options[option] : undefined),
                actions: [action.displayName, this.service.getTranslatedMessage("Cancel")],
                actionTypes: action.name === "Delete" ? ["Danger"] : []
            });

            return result === 0;
        }

        async onAppRouteChanging(newRoute: RouteInfo, currentRoute: RouteInfo): Promise<string> {
            return Promise.resolve(null);
        }

        async onAction(args: ExecuteActionArgs): Promise<Vidyano.PersistentObject> {
            if (args.action === "AddReference") {
                args.isHandled = true;

                const query = args.query.clone(true);
                query.search();

                await this.app.importComponent("SelectReferenceDialog");
                const result = await this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(query));
                if (result && result.length > 0) {
                    args.selectedItems = result;

                    return await args.executeServiceRequest();
                }
                else
                    return null;
            }

            return super.onAction(args);
        }

        onRedirectToSignIn(keepUrl: boolean) {
            if (keepUrl && this.app.path.startsWith("SignIn/")) {
                this.app.changePath(this.app.path);
                return;
            }

            this.app.changePath("SignIn" + (keepUrl && this.app.path ? "/" + encodeURIComponent(AppBase.removeRootPath(this.app.path).replace(/SignIn\/?/, "")).replace(/\./g, "%2E") : ""), true);
        }

        onRedirectToSignOut(keepUrl: boolean) {
            this.app.changePath("SignOut" + (keepUrl && this.app.path ? "/" + encodeURIComponent(AppBase.removeRootPath(decodeURIComponent(this.app.path)).replace(/SignIn\/?/, "")).replace(/\./g, "%2E") : ""), true);
        }

        onMessageDialog(title: string, message: string, rich: boolean, ...actions: string[]): Promise<number> {
            return this.app.showMessageDialog({ title: title, message: message, rich: rich, actions: actions });
        }

        onShowNotification(notification: string, type: NotificationType, duration: number) {
            if (!duration || !notification)
                return;

            if (typeof notification === "object")
                notification = notification["message"];

            this.app.showAlert(notification, type, duration);
        }

        async onSelectReference(query: Vidyano.Query): Promise<QueryResultItem[]> {
            if (!query.hasSearched)
                query.search();

            await this.app.importComponent("SelectReferenceDialog");
            return this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(query, false, false, true));
        }

        async onInitial(initial: Vidyano.PersistentObject) {
            const initialPath = `SignIn/${initial.type}`;
            const currentPathWithoutRoot = Vidyano.WebComponents.AppBase.removeRootPath(this.app.path);

            if (!currentPathWithoutRoot.startsWith(initialPath)) {
                const returnPath = currentPathWithoutRoot && !currentPathWithoutRoot.startsWith("SignIn") ? currentPathWithoutRoot : "";
                this.app.changePath(`${initialPath}/${encodeURIComponent(returnPath)}`);
            }
        }

        async onSessionExpired(): Promise<boolean> {
            if (!(this.app instanceof App)) {
                this.app.redirectToSignIn();
                return false;
            }

            await this.app.service.signOut(true);
            return true;
        }

        onUpdateAvailable() {
            super.onUpdateAvailable();

            this.app.fire("app-update-available", null);
        }

        onNavigate(path: string, replaceCurrent: boolean = false) {
            this.app.changePath(Vidyano.WebComponents.AppBase.removeRootPath(path), replaceCurrent);
        }

        async onRetryAction(retry: IRetryAction): Promise<string> {
            if (retry.persistentObject) {
                await this.app.importComponent("RetryActionDialog");
                return this.app.showDialog(new Vidyano.WebComponents.RetryActionDialog(retry));
            }

            return retry.options[await this.app.showMessageDialog({
                title: retry.title,
                message: retry.message,
                actions: retry.options,
                noClose: retry.cancelOption == null,
                defaultAction: retry.defaultOption,
                cancelAction: retry.cancelOption
            })];
        }
    }
}