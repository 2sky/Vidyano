namespace Vidyano {
    "use strict";

    export class ServiceHooks {
        private _service: Vidyano.Service;

        get service(): Vidyano.Service {
            return this._service;
        }

        createData(data: any) {
            // Noop
        }

        trackEvent(name: string, option: string, owner: ServiceObjectWithActions) {
            // Noop
        }

        onInitialize(clientData: IServiceClientData): Promise<IServiceClientData> {
            return Promise.resolve(clientData);
        }

        onSessionExpired(): boolean {
            return false;
        }

        onActionConfirmation(action: Action, option: number): Promise<boolean> {
            return Promise.resolve(true);
        }

        onAction(args: ExecuteActionArgs): Promise<PersistentObject> {
            return Promise.resolve(null);
        }

        onOpen(obj: ServiceObject, replaceCurrent: boolean = false, fromAction: boolean = false) {
            // Noop
        }

        onClose(obj: ServiceObject) {
            // Noop
        }

        onConstructPersistentObject(service: Service, po: any): PersistentObject {
            return new PersistentObject(service, po);
        }

        onConstructPersistentObjectAttributeTab(service: Service, groups: linqjs.Enumerable<PersistentObjectAttributeGroup>, key: string, id: string, name: string, layout: any, parent: PersistentObject, columnCount: number, isVisible: boolean): PersistentObjectAttributeTab {
            return new PersistentObjectAttributeTab(service, groups.toArray(), key, id, name, layout, parent, columnCount, isVisible);
        }

        onConstructPersistentObjectQueryTab(service: Service, query: Query): PersistentObjectQueryTab {
            return new PersistentObjectQueryTab(service, query);
        }

        onConstructPersistentObjectAttributeGroup(service: Service, key: string, attributes: linqjs.Enumerable<PersistentObjectAttribute>, parent: PersistentObject): PersistentObjectAttributeGroup {
            return new PersistentObjectAttributeGroup(service, key, attributes.toArray(), parent);
        }

        onConstructPersistentObjectAttribute(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttribute {
            return new PersistentObjectAttribute(service, attr, parent);
        }

        onConstructPersistentObjectAttributeWithReference(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeWithReference {
            return new PersistentObjectAttributeWithReference(service, attr, parent);
        }

        onConstructPersistentObjectAttributeAsDetail(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeAsDetail {
            return new PersistentObjectAttributeAsDetail(service, attr, parent);
        }

        onConstructQuery(service: Service, query: any, parent?: PersistentObject, asLookup: boolean = false, maxSelectedItems?: number): Query {
            return new Query(service, query, parent, asLookup, maxSelectedItems);
        }

        onConstructQueryResultItem(service: Service, item: any, query: Query, isSelected: boolean = false): QueryResultItem {
            return new QueryResultItem(service, item, query, isSelected);
        }

        onConstructQueryResultItemValue(service: Service, item: QueryResultItem, value: any): QueryResultItemValue {
            return new QueryResultItemValue(service, item, value);
        }

        onConstructQueryColumn(service: Service, col: any, query: Query): QueryColumn {
            return new QueryColumn(service, col, query);
        }

        onConstructAction(service: Service, action: Action): Action {
            return action;
        }

        onSortPersistentObjectTabs(parent: Vidyano.PersistentObject, attributeTabs: Vidyano.PersistentObjectAttributeTab[], queryTabs: Vidyano.PersistentObjectQueryTab[]): Vidyano.PersistentObjectTab[] {
            return (<PersistentObjectTab[]>attributeTabs).concat(queryTabs);
        }

        onMessageDialog(title: string, message: string, rich: boolean, ...actions: string[]): Promise<number> {
            return Promise.resolve(-1);
        }

        onShowNotification(notification: string, type: NotificationType, duration: number) {
            // Noop
        }

        onSelectReference(query: Vidyano.Query): Promise<QueryResultItem[]> {
            return Promise.resolve([]);
        }

        onNavigate(path: string, replaceCurrent: boolean = false) {
            // Noop
        }

        onClientOperation(operation: ClientOperations.IClientOperation) {
            switch (operation.type) {
                case "ExecuteMethod":
                    const executeMethod = <ClientOperations.IExecuteMethodOperation>operation;
                    const method: Function = Vidyano.ClientOperations[executeMethod.name];
                    if (typeof (method) === "function") {
                        method.apply(Vidyano.ClientOperations, [this].concat(executeMethod.arguments));
                    }
                    else if (window.console && console.error)
                        console.error("Method not found: " + executeMethod.name, executeMethod);

                    break;

                case "Open":
                    const open = <ClientOperations.IOpenOperation>operation;
                    this.onOpen(this.onConstructPersistentObject(this.service, open.persistentObject), open.replace, true);
                    break;

                default:
                    if (window.console && console.log)
                        console.log("Missing client operation type: " + operation.type, operation);
                    break;
            }
        }

        onSelectedItemsActions(query: Query, selectedItems: QueryResultItem[], action: ISelectedItemsActionArgs) {
            // Noop
        }

        onRefreshFromResult(po: PersistentObject) {
            // Noop
        }

        onUpdateAvailable() {
            // Noop
        }

        async onRetryAction(retry: IRetryAction): Promise<string> {
            if (!retry.persistentObject)
                return retry.options[await this.onMessageDialog(retry.title, retry.message, false, ...retry.options)];

            throw "RetryAction with Persistent Object is not supported.";
        }
    }
}