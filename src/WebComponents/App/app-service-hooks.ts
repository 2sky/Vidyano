namespace Vidyano.WebComponents {
    export class AppServiceHooks extends Vidyano.ServiceHooks {
        constructor(public app: App) {
            super();

            navigator.serviceWorker.addEventListener("message", event => {
                this.app.showAlert(event.data, "Notice", 3000);
            });
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

            path = Vidyano.WebComponents.App.removeRootPath(path);
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
            const persistentObjectConfigsEnum = Enumerable.from(persistentObjectConfigs);
            return persistentObjectConfigsEnum.firstOrDefault(c => (c.id === persistentObject.id || c.type === persistentObject.type || c.type === persistentObject.fullTypeName) && c.objectId === persistentObject.objectId) ||
                persistentObjectConfigsEnum.firstOrDefault(c => !c.objectId && (c.id === persistentObject.id || c.type === persistentObject.type || c.type === persistentObject.fullTypeName));
        }

        getAttributeConfig(attribute: Vidyano.PersistentObjectAttribute, attributeConfigs: PersistentObjectAttributeConfig[]): PersistentObjectAttributeConfig {
            const attributeConfigsEnum = Enumerable.from(attributeConfigs);
            return attributeConfigsEnum.firstOrDefault(c => c.parentObjectId === attribute.parent.objectId && c.parentId === attribute.parent.id && (c.name === attribute.name || c.type === attribute.type)) ||
                attributeConfigsEnum.firstOrDefault(c => c.parentId === attribute.parent.id && (c.name === attribute.name || c.type === attribute.type)) ||
                attributeConfigsEnum.firstOrDefault(c => c.name === attribute.name && c.type === attribute.type && !c.parentId) ||
                attributeConfigsEnum.firstOrDefault(c => c.name === attribute.name && !c.parentId && !c.type) ||
                attributeConfigsEnum.firstOrDefault(c => c.type === attribute.type && !c.parentId && !c.name);
        }

        getTabConfig(tab: Vidyano.PersistentObjectTab, tabConfigs: PersistentObjectTabConfig[]): PersistentObjectTabConfig {
            const tabConfigsEnum = Enumerable.from(tabConfigs);
            return tabConfigsEnum.firstOrDefault(c => c.name === tab.name && (c.type === tab.parent.type || c.type === tab.parent.fullTypeName || c.id === tab.parent.id) && c.objectId === tab.parent.objectId) ||
                tabConfigsEnum.firstOrDefault(c => c.name === tab.name && (c.type === tab.parent.type || c.type === tab.parent.fullTypeName || c.id === tab.parent.id));
        }

        getProgramUnitConfig(name: string, programUnitConfigs: ProgramUnitConfig[]): ProgramUnitConfig {
            return Enumerable.from(programUnitConfigs).firstOrDefault(c => c.name === name);
        }

        getQueryConfig(query: Vidyano.Query, queryConfigs: QueryConfig[]): QueryConfig {
            const queryConfigsEnum = Enumerable.from(queryConfigs);
            return queryConfigsEnum.firstOrDefault(c => c.id === query.id || c.name === query.name) ||
                queryConfigsEnum.firstOrDefault(c => c.type === query.persistentObject.type) ||
                queryConfigsEnum.firstOrDefault(c => !c.id && !c.name && !c.type);
        }

        getQueryChartConfig(type: string, queryChartConfigs: QueryChartConfig[]): QueryChartConfig {
            return Enumerable.from(queryChartConfigs).firstOrDefault(c => c.type === type);
        }

        onConstructApplication(application: Service.ApplicationResponse): Application {
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

        async onAppRouteChanging(newRoute: AppRoute, currentRoute: AppRoute): Promise<string> {
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
            else if (args.action === "ShowHelp") {
                // Only pass selected tab for actions on persistent objects
                if (!args.query) {
                    let cacheEntry = new PersistentObjectAppCacheEntry(args.persistentObject);
                    cacheEntry = <PersistentObjectAppCacheEntry>Enumerable.from(this.app.cacheEntries).firstOrDefault(ce => ce.isMatch(cacheEntry));

                    if (cacheEntry && cacheEntry.selectedMasterTab) {
                        if (!args.parameters)
                            args.parameters = {};

                        args.parameters["selectedMasterTab"] = cacheEntry.selectedMasterTab.name;
                    } else if (args.parameters && args.parameters["selectedMasterTab"])
                        args.parameters["selectedMasterTab"] = undefined;
                }

                return super.onAction(args);
            }
            else if (args.action === "viAudit")
                this.app.importComponent("Audit");

            return super.onAction(args);
        }

        async onOpen(obj: ServiceObject, replaceCurrent: boolean = false, fromAction: boolean = false) {
            if (obj instanceof Vidyano.PersistentObject) {
                const po = <Vidyano.PersistentObject>obj;

                if (po.stateBehavior.indexOf("AsWizard") >= 0) {
                    await this.app.importComponent("PersistentObjectWizardDialog");
                    await this.app.showDialog(new Vidyano.WebComponents.PersistentObjectWizardDialog(po));

                    return;
                }
                else if (po.stateBehavior.indexOf("OpenAsDialog") >= 0) {
                    await this.app.importComponent("PersistentObjectDialog");
                    await this.app.showDialog(new Vidyano.WebComponents.PersistentObjectDialog(po));

                    return;
                }
                else if (this.app.barebone)
                    return;

                let path: string;
                if (!fromAction) {
                    path = this.app.getUrlForPersistentObject(po.id, po.objectId);

                    const cacheEntry = new PersistentObjectAppCacheEntry(po);
                    const existing = this.app.cachePing(cacheEntry);
                    if (existing)
                        this.app.cacheRemove(existing);

                    this.app.cache(cacheEntry);
                }
                else {
                    const fromActionId = Unique.get();
                    path = this.app.getUrlForFromAction(fromActionId);

                    if (!po.isNew && po.objectId) {
                        const existingPoCacheEntry = this.app.cachePing(new PersistentObjectAppCacheEntry(po));
                        if (existingPoCacheEntry)
                            this.app.cacheRemove(existingPoCacheEntry);
                    }
                    else if (po.isBulkEdit) {
                        po.bulkObjectIds.forEach(poId => {
                            const existingPoCacheEntry = this.app.cachePing(new PersistentObjectAppCacheEntry(po.id, poId));
                            if (existingPoCacheEntry)
                                this.app.cacheRemove(existingPoCacheEntry);
                        });
                    }

                    this.app.cache(new PersistentObjectFromActionAppCacheEntry(po, fromActionId, this.app.path));
                }

                this.app.changePath(path, replaceCurrent);
            }
        }

        onClose(parent: Vidyano.ServiceObject) {
            if (parent instanceof Vidyano.PersistentObject) {
                const cacheEntry = <PersistentObjectFromActionAppCacheEntry>this.app.cachePing(new PersistentObjectFromActionAppCacheEntry(parent));
                if (cacheEntry instanceof PersistentObjectFromActionAppCacheEntry && cacheEntry.fromActionIdReturnPath) {
                    if (App.removeRootPath(this.app.getUrlForFromAction(cacheEntry.fromActionId)) === App.removeRootPath(this.app.path)) {
                        if (this.app.noHistory)
                            this.app.changePath(cacheEntry.fromActionIdReturnPath, true);
                        else
                            history.back();
                    }
                }
            }
        }

        onRedirectToSignIn(keepUrl: boolean) {
            if (keepUrl && this.app.path.startsWith("SignIn/")) {
                this.app.changePath(this.app.path);
                return;
            }

            this.app.changePath("SignIn" + (keepUrl && this.app.path ? "/" + encodeURIComponent(App.removeRootPath(this.app.path).replace(/SignIn\/?/, "")).replace(/\./g, "%2E") : ""), true);
        }

        onRedirectToSignOut(keepUrl: boolean) {
            this.app.changePath("SignOut" + (keepUrl && this.app.path ? "/" + encodeURIComponent(App.removeRootPath(decodeURIComponent(this.app.path)).replace(/SignIn\/?/, "")).replace(/\./g, "%2E") : ""), true);
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
            const currentPathWithoutRoot = Vidyano.WebComponents.App.removeRootPath(this.app.path);

            if (!currentPathWithoutRoot.startsWith(initialPath)) {
                const returnPath = currentPathWithoutRoot && !currentPathWithoutRoot.startsWith("SignIn") ? currentPathWithoutRoot : "";
                this.app.changePath(`${initialPath}/${encodeURIComponent(returnPath)}`);
            }
        }

        async onSessionExpired(): Promise<boolean> {
            if (!this.app.barebone) {
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
            this.app.changePath(Vidyano.WebComponents.App.removeRootPath(path), replaceCurrent);
        }

        onClientOperation(operation: ClientOperations.IClientOperation) {
            switch (operation.type) {
                case "Refresh":
                    const refresh = <ClientOperations.IRefreshOperation>operation;
                    if (refresh.queryId) {
                        const cacheEntry = <QueryAppCacheEntry>this.app.cachePing(new QueryAppCacheEntry(refresh.queryId));
                        if (cacheEntry && cacheEntry.query)
                            cacheEntry.query.search({ delay: refresh.delay });

                        const poCacheEntriesWithQueries = <PersistentObjectAppCacheEntry[]>this.app.cacheEntries.filter(e => e instanceof PersistentObjectAppCacheEntry && !!e.persistentObject && e.persistentObject.queries.length > 0);
                        poCacheEntriesWithQueries.forEach(poEntry => poEntry.persistentObject.queries.filter(q => q.id === refresh.queryId).forEach(q => q.search({ delay: refresh.delay })));
                    }
                    else {
                        const refreshPersistentObject = async () => {
                            const cacheEntry = <PersistentObjectAppCacheEntry>this.app.cachePing(new PersistentObjectAppCacheEntry(refresh.fullTypeName, refresh.objectId));
                            if (!cacheEntry || !cacheEntry.persistentObject)
                                return;

                            try {
                                const po = await this.app.service.getPersistentObject(cacheEntry.persistentObject.parent, cacheEntry.persistentObject.id, cacheEntry.persistentObject.objectId);
                                cacheEntry.persistentObject.refreshFromResult(po, true);
                            }
                            catch (e) {
                                cacheEntry.persistentObject.setNotification(e);
                            }
                        };

                        if (refresh.delay)
                            setTimeout(refreshPersistentObject, refresh.delay);
                        else
                            refreshPersistentObject();
                    }

                    break;

                default:
                    super.onClientOperation(operation);
                    break;
            }
        }

        async onQueryFileDrop(query: Vidyano.Query, name: string, contents: string): Promise<boolean> {
            const config = this.app.configuration.getQueryConfig(query);
            const fileDropAction = <Vidyano.Action>query.actions[config.fileDropAction];

            const po = await fileDropAction.execute({ skipOpen: true });
            return query.queueWork(async () => {
                const fileDropAttribute = po.getAttribute(config.fileDropAttribute);
                if (!fileDropAttribute)
                    return false;

                try {
                    await fileDropAttribute.setValue(`${name}|${contents}`);
                    return await po.save();
                }
                catch (e) {
                    query.setNotification(e);
                    return false;
                }
            }, true);
        }

        async onRetryAction(retry: Service.RetryAction): Promise<string> {
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