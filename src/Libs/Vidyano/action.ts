namespace Vidyano {
    "use strict";

    export interface IActionExecuteOptions {
        menuOption?: number;
        parameters?: any;
        selectedItems?: QueryResultItem[];
        skipOpen?: boolean;
        noConfirmation?: boolean;
        throwExceptions?: boolean;
    }

    export interface ISelectedItemsActionArgs {
        name: string;
        isVisible: boolean;
        canExecute: boolean;
        options: string[];
    }

    export class Action extends ServiceObject {
        private _targetType: string;
        private _query: Query;
        private _parent: PersistentObject;
        private _isVisible: boolean = true;
        private _canExecute: boolean;
        private _block: boolean;
        private _parameters: any = {};
        private _offset: number;
        protected _isPinned: boolean;
        private _options: string[] = [];
        selectionRule: (count: number) => boolean;
        displayName: string;
        dependentActions = [];

        constructor(public service: Service, public definition: ActionDefinition, public owner: ServiceObjectWithActions) {
            super(service);

            this.displayName = definition.displayName;
            this.selectionRule = definition.selectionRule;
            this._isPinned = definition.isPinned;

            if (owner instanceof Query) {
                this._targetType = "Query";
                this._query = <Query>owner;
                this._parent = this.query.parent;
                if (definition.name === "New" && this.query.persistentObject != null && !StringEx.isNullOrEmpty(this.query.persistentObject.newOptions))
                    this._setOptions(this.query.persistentObject.newOptions.split(";"));

                this.query.propertyChanged.attach((source, detail) => {
                    if (detail.propertyName === "selectedItems") {
                        let options: string[];

                        if (definition.name === "New" && this.query.persistentObject != null && !StringEx.isNullOrEmpty(this.query.persistentObject.newOptions))
                            options = this.query.persistentObject.newOptions.split(";");
                        else
                            options = definition.options.slice();

                        const args: ISelectedItemsActionArgs = {
                            name: this.name,
                            isVisible: this.isVisible,
                            canExecute: this.selectionRule(detail.newValue ? detail.newValue.length : 0),
                            options: options
                        };
                        this.service.hooks.onSelectedItemsActions(this._query, detail.newValue, args);

                        this.canExecute = args.canExecute;
                        this._setOptions(args.options);
                    }
                });

                this.canExecute = this.selectionRule(0);
            }
            else if (owner instanceof PersistentObject) {
                this._targetType = "PersistentObject";
                this._parent = <PersistentObject>owner;
                this.canExecute = true;
            }
            else
                throw "Invalid owner-type.";

            if (definition.options.length > 0)
                this._options = definition.options.slice();
        }

        get parent(): PersistentObject {
            return this._parent;
        }

        get query(): Query {
            return this._query;
        }

        get offset(): number {
            return this._offset;
        }

        set offset(value: number) {
            this._offset = value;
        }

        get name(): string {
            return this.definition.name;
        }

        get canExecute(): boolean {
            return this._canExecute && !this._block;
        }

        set canExecute(val: boolean) {
            if (this._canExecute === val)
                return;

            this._canExecute = val;
            this.notifyPropertyChanged("canExecute", val, !val);
        }

        set block(block: boolean) {
            this._block = block;
            this.notifyPropertyChanged("canExecute", this._block = block, this._canExecute);
        }

        get isVisible(): boolean {
            return this._isVisible;
        }

        set isVisible(val: boolean) {
            if (this._isVisible === val)
                return;

            this._isVisible = val;
            this.notifyPropertyChanged("isVisible", val, !val);
        }

        get isPinned(): boolean {
            return this._isPinned;
        }

        get options(): string[] {
            return this._options;
        }

        private _setOptions(options: string[]) {
            if (this._options === options)
                return;

            const oldOptions = this._options;
            this.notifyPropertyChanged("options", this._options = options, oldOptions);
        }

        async execute(options: IActionExecuteOptions = {}): Promise<PersistentObject> {
            if (!this.canExecute && !(options.selectedItems != null && this.selectionRule(options.selectedItems.length)))
                return null;

            try {
                return await this._onExecute(options);
            }
            catch (e) {
                if (options.throwExceptions)
                    throw e;
                else
                    this.owner.setNotification(e);
            }
        }

        protected async _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
            if (this.definition.confirmation && (!noConfirmation) && !await this.service.hooks.onActionConfirmation(this, menuOption))
                return null;

            return this.owner.queueWork(async () => {
                parameters = this._getParameters(parameters, menuOption);

                if (selectedItems == null && this.query) {
                    if (this.query.selectAll.allSelected) {
                        if (!this.query.selectAll.inverse)
                            selectedItems = [];
                        else
                            selectedItems = this.query.items.filter(i => !i.isSelected);
                    }
                    else
                        selectedItems = this.query.selectedItems;

                    selectedItems = selectedItems.filter(i => !i.ignoreSelect);
                }

                let po = await this.service.executeAction(this._targetType + "." + this.definition.name, this.parent, this.query, selectedItems, parameters);
                if (po) {
                    if (po.fullTypeName === "Vidyano.Notification") {
                        if (po.objectId != null && JSON.parse(po.objectId).dialog) {
                            this._setNotification();
                            this.service.hooks.onMessageDialog(NotificationType[po.notificationType], po.notification, false, this.service.hooks.service.getTranslatedMessage("OK"));
                        }
                        else {
                            if (this.query && this.definition.refreshQueryOnCompleted)
                            /* tslint:disable:no-var-keyword */ var notificationPO = po; /* tslint:enable:no-var-keyword */
                            else
                                this._setNotification(po.notification, po.notificationType, po.notificationDuration);
                        }

                        po = null;
                    } else if (po.fullTypeName === "Vidyano.RegisteredStream") {
                        this.service._getStream(po);
                    } else if (po.fullTypeName === "Vidyano.AddReference") {
                        const query = po.queries[0];
                        query.parent = this.parent;

                        const selectedItems = await this.service.hooks.onSelectReference(query);
                        if (selectedItems && selectedItems.length > 0) {
                            try {
                                await this.service.executeAction("Query.AddReference", this.parent, query, selectedItems, { AddAction: this.name }, true);
                            }
                            catch (e) {
                                this.query.setNotification(e);
                            }

                            this.query.search();
                        }
                    } else if (this.parent != null && (po.fullTypeName === this.parent.fullTypeName || po.isNew === this.parent.isNew) && po.id === this.parent.id && po.objectId === this.parent.objectId) {
                        this.parent.refreshFromResult(po);
                    } else {
                        po.ownerQuery = this.query;
                        po.ownerPersistentObject = this.parent;

                        if (!skipOpen)
                            this.service.hooks.onOpen(po, false, true);
                    }
                }

                if (this.query != null && this.definition.refreshQueryOnCompleted) {
                    // NOTE: Don't wait for search to complete
                    const selectedIds = this.definition.keepSelectionOnRefresh ? this.query.selectedItems.map(i => i.id) : null;
                    this.query.search().then(items => {
                        if (notificationPO && !this.query.notification)
                            this._setNotification(notificationPO.notification, notificationPO.notificationType, notificationPO.notificationDuration);

                        if (selectedIds != null && selectedIds.length > 0) {
                            const itemsEnum = Enumerable.from(items);
                            const newSelectionItems = selectedIds.map(id => itemsEnum.firstOrDefault(i => i.id === id)).filter(i => i != null);
                            if (newSelectionItems.length === selectedIds.length)
                                this.query.selectedItems = newSelectionItems;
                        }
                    });
                }

                return po;
            });
        }

        _getParameters(parameters, option) {
            if (parameters == null)
                parameters = {};
            if (this._parameters != null)
                parameters = Vidyano.extend({}, this._parameters, parameters);
            if (this.options != null && this.options.length > 0 && option >= 0) {
                parameters["MenuOption"] = option;
                parameters["MenuLabel"] = this.options[option];
            }
            else if (option != null)
                parameters["MenuOption"] = option;
            return parameters;
        }

        _onParentIsEditingChanged(isEditing: boolean) {
            // Noop
        }

        _onParentIsDirtyChanged(isDirty: boolean) {
            // Noop
        }

        private _setNotification(notification: string = null, notificationType: NotificationType = NotificationType.Error, notificationDuration?: number) {
            (this.query || this.parent).setNotification(notification, notificationType, notificationDuration);
        }

        static get(service: Service, name: string, owner: ServiceObjectWithActions): Action {
            const definition = service.actionDefinitions.get(name);
            if (definition != null) {
                const hook = Actions[name];
                return service.hooks.onConstructAction(service, hook != null ? new hook(service, definition, owner) : new Action(service, definition, owner));
            }
            else
                return null;
        }

        static addActions(service: Service, owner: ServiceObjectWithActions, actions: Action[], actionNames: string[]) {
            if (actionNames == null || actionNames.length === 0)
                return;

            actionNames.forEach(actionName => {
                const action = Action.get(service, actionName, owner);
                action.offset = actions.length;
                actions.push(action);

                Action.addActions(service, owner, actions, action.dependentActions);
            });
        }
    }
}