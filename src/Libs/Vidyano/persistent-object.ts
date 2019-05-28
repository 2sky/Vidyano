namespace Vidyano {
    "use strict";

    export enum PersistentObjectLayoutMode {
        FullPage,
        MasterDetail
    }

    export class PersistentObject extends ServiceObjectWithActions {
        private _isSystem: boolean;
        private _lastResult: any;
        private _lastUpdated: Date;
        private _lastResultBackup: any;
        private securityToken: string;
        private _isEditing: boolean = false;
        private _isDirty: boolean = false;
        private _inputs: linqjs.Dictionary<string, HTMLInputElement> = Enumerable.empty<string>().toDictionary(i => i, i => null);
        private _id: string;
        private _type: string;
        private _breadcrumb: string;
        private _isDeleted: boolean;
        private _tabs: PersistentObjectTab[];
        private _isFrozen: boolean = false;
        readonly isBreadcrumbSensitive: boolean;

        fullTypeName: string;
        label: string;
        objectId: string;
        isHidden: boolean;
        isNew: boolean;
        isReadOnly: boolean;
        queryLayoutMode: PersistentObjectLayoutMode;
        newOptions: string;
        ignoreCheckRules: boolean;
        stateBehavior: string;
        dialogSaveAction: Action;
        parent: PersistentObject;
        ownerDetailAttribute: PersistentObjectAttributeAsDetail;
        ownerAttributeWithReference: PersistentObjectAttributeWithReference;
        ownerPersistentObject: PersistentObject;
        ownerQuery: Query;
        bulkObjectIds: string[];
        queriesToRefresh: Array<string> = [];
        attributes: PersistentObjectAttribute[];
        queries: Query[];

        constructor(service: Service, po: Service.PersistentObject);
        constructor(service: Service, po: any) {
            super(service, (po._actionNames || po.actions || []).map(a => a === "Edit" && po.isNew ? "Save" : a), po.actionLabels);

            this._id = po.id;
            this._isSystem = !!po.isSystem;
            this._type = po.type;
            this.label = po.label;
            this.fullTypeName = po.fullTypeName;
            this.queryLayoutMode = po.queryLayoutMode === "FullPage" ? PersistentObjectLayoutMode.FullPage : PersistentObjectLayoutMode.MasterDetail;
            this.objectId = po.objectId;
            this._breadcrumb = po.breadcrumb;
            this.isBreadcrumbSensitive = po.isBreadcrumbSensitive;
            this.setNotification(po.notification, po.notificationType, po.notificationDuration, true);
            this.isNew = !!po.isNew;
            this.newOptions = po.newOptions;
            this.isReadOnly = !!po.isReadOnly;
            this.isHidden = !!po.isHidden;
            this._isDeleted = !!po.isDeleted;
            this.ignoreCheckRules = !!po.ignoreCheckRules;
            this.stateBehavior = po.stateBehavior || "None";
            this.setIsEditing(false);
            this.securityToken = po.securityToken;
            this.bulkObjectIds = po.bulkObjectIds;
            this.queriesToRefresh = po.queriesToRefresh || [];
            this.parent = po.parent != null ? service.hooks.onConstructPersistentObject(service, po.parent) : null;

            this.attributes = po.attributes ? Enumerable.from<PersistentObjectAttribute>(po.attributes).select(attr => this._createPersistentObjectAttribute(attr)).toArray() : [];
            this.attributes.forEach(attr => this.attributes[attr.name] = attr);

            this.queries = po.queries ? Enumerable.from<Query>(po.queries).select(query => service.hooks.onConstructQuery(service, query, this)).orderBy(q => q.offset).toArray() : [];
            this.queries.forEach(query => this.queries[query.name] = query);

            const visibility = this.isNew ? "New" : "Read";
            const attributeTabs = po.tabs ? Enumerable.from<PersistentObjectTab>(Enumerable.from(this.attributes).where(attr => attr.visibility === "Always" || attr.visibility.contains(visibility)).orderBy(attr => attr.offset).groupBy(attr => attr.tabKey, attr => attr).select(attributesByTab => {
                const groups = attributesByTab.orderBy(attr => attr.offset).groupBy(attr => attr.groupKey, attr => attr).select(attributesByGroup => {
                    const newGroup = this.service.hooks.onConstructPersistentObjectAttributeGroup(service, attributesByGroup.key(), attributesByGroup, this);
                    attributesByGroup.forEach(attr => attr.group = newGroup);

                    return newGroup;
                }).memoize();
                groups.toArray().forEach((g, n) => g.index = n);

                const serviceTab = po.tabs[attributesByTab.key()] || {};
                const newTab = this.service.hooks.onConstructPersistentObjectAttributeTab(service, groups, attributesByTab.key(), serviceTab.id, serviceTab.name, serviceTab.layout, this, serviceTab.columnCount, !this.isHidden);
                attributesByTab.forEach(attr => attr.tab = newTab);

                return newTab;
            })).toArray() : [];
            this._tabs = this.service.hooks.onSortPersistentObjectTabs(this, <PersistentObjectAttributeTab[]>attributeTabs, Enumerable.from(this.queries).select(q => this.service.hooks.onConstructPersistentObjectQueryTab(this.service, q)).toArray());

            if (this._tabs.length === 0)
                this._tabs = [this.service.hooks.onConstructPersistentObjectAttributeTab(service, Enumerable.empty<PersistentObjectAttributeGroup>(), "", "", "", null, this, 0, true)];

            this._lastResult = po;

            if (this.isNew || this.stateBehavior === "OpenInEdit" || this.stateBehavior.indexOf("OpenInEdit") >= 0 || this.stateBehavior === "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                this.beginEdit();

            this._initializeActions();
            this.dialogSaveAction = po.dialogSaveAction ? this.getAction(po.dialogSaveAction) : (this.getAction("EndEdit") || this.getAction("Save"));

            this.service.hooks.onRefreshFromResult(this);
            this._setLastUpdated(new Date());
        }

        private _createPersistentObjectAttribute(attr: PersistentObjectAttribute): PersistentObjectAttribute {
            if ((<PersistentObjectAttributeWithReference>attr).displayAttribute || (<PersistentObjectAttributeWithReference>attr).objectId)
                return this.service.hooks.onConstructPersistentObjectAttributeWithReference(this.service, attr, this);

            if ((<PersistentObjectAttributeAsDetail>attr).objects || (<PersistentObjectAttributeAsDetail>attr).details)
                return this.service.hooks.onConstructPersistentObjectAttributeAsDetail(this.service, attr, this);

            return this.service.hooks.onConstructPersistentObjectAttribute(this.service, attr, this);
        }

        get id(): string {
            return this._id;
        }

        get isSystem(): boolean {
            return this._isSystem;
        }

        get type(): string {
            return this._type;
        }

        get isBulkEdit(): boolean {
            return this.bulkObjectIds && this.bulkObjectIds.length > 0;
        }

        get tabs(): PersistentObjectTab[] {
            return this._tabs;
        }

        set tabs(tabs: PersistentObjectTab[]) {
            const oldTabs = this._tabs;
            this.notifyPropertyChanged("tabs", this._tabs = tabs, oldTabs);
        }

        get isEditing(): boolean {
            return this._isEditing;
        }

        private setIsEditing(value: boolean) {
            this._isEditing = value;
            this.actions.forEach(action => action._onParentIsEditingChanged(value));
            this.notifyPropertyChanged("isEditing", value, !value);
        }

        get breadcrumb(): string {
            return this._breadcrumb;
        }
        private _setBreadcrumb(breadcrumb: string) {
            const oldBreadcrumb = this._breadcrumb;
            if (oldBreadcrumb !== breadcrumb)
                this.notifyPropertyChanged("breadcrumb", this._breadcrumb = breadcrumb, oldBreadcrumb);
        }

        get isDirty(): boolean {
            return this._isDirty;
        }

        private _setIsDirty(value: boolean, force?: boolean) {
            if (value && (!this.isEditing && !force))
                throw "Cannot flag persistent object as dirty when not in edit mode.";

            const oldIsDirty = this._isDirty;
            if (oldIsDirty !== value) {
                this.notifyPropertyChanged("isDirty", this._isDirty = value, oldIsDirty);
                this.actions.forEach(action => action._onParentIsDirtyChanged(value));

                if (this.ownerDetailAttribute && value)
                    this.ownerDetailAttribute.onChanged(false);
            }
        }

        get isDeleted(): boolean {
            return this._isDeleted;
        }

        set isDeleted(isDeleted: boolean) {
            const oldIsDeleted = this._isDeleted;
            if (oldIsDeleted !== isDeleted)
                this.notifyPropertyChanged("isDeleted", this._isDeleted = isDeleted, oldIsDeleted);
        }

        get isFrozen(): boolean {
            return this._isFrozen;
        }

        freeze() {
            if (this._isFrozen)
                return;

            this.notifyPropertyChanged("isFrozen", this._isFrozen = true, false);
        }

        unfreeze() {
            if (!this._isFrozen)
                return;

            this.notifyPropertyChanged("isFrozen", this._isFrozen = false, true);
        }

        getAttribute(name: string): PersistentObjectAttribute {
            return this.attributes[name];
        }

        getAttributeValue(name: string): any {
            const attr = this.attributes[name];
            return attr != null ? attr.value : null;
        }

        setAttributeValue(name: string, value: any, allowRefresh?: boolean): Promise<any> {
            const attr = <Vidyano.PersistentObjectAttribute>this.attributes[name];
            if (!attr)
                return Promise.reject("Attribute does not exist.");

            return attr.setValue(value, allowRefresh);
        }

        get lastUpdated(): Date {
            return this._lastUpdated;
        }

        private _setLastUpdated(lastUpdated: Date) {
            const oldLastUpdated = this._lastUpdated;
            this.notifyPropertyChanged("lastUpdated", this._lastUpdated = lastUpdated, oldLastUpdated);
        }

        getQuery(name: string): Query {
            return this.queries[name];
        }

        beginEdit() {
            if (!this.isEditing) {
                this._lastResultBackup = this._lastResult;

                this.setIsEditing(true);
            }
        }

        cancelEdit() {
            if (this.isEditing) {
                this.setIsEditing(false);
                this._setIsDirty(false);

                const backup = this._lastResultBackup;
                this._lastResultBackup = null;
                this.refreshFromResult(backup, true);

                if (!!this.notification)
                    this.setNotification();

                if (this.stateBehavior === "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                    this.beginEdit();
            }
        }

        save(waitForOwnerQuery?: boolean): Promise<boolean> {
            return this.queueWork(async () => {
                if (this.isEditing) {
                    const attributesToRefresh = this.attributes.filter(attr => attr.shouldRefresh);
                    for (let i = 0; i < attributesToRefresh.length; i++)
                        await attributesToRefresh[i]._triggerAttributeRefresh(true);

                    const po = await this.service.executeAction("PersistentObject.Save", this, null, null, null);
                    if (!po)
                        return false;

                    const wasNew = this.isNew;
                    this.refreshFromResult(po, true);

                    if (StringEx.isNullOrWhiteSpace(this.notification) || this.notificationType !== "Error") {
                        this._setIsDirty(false);

                        if (!wasNew) {
                            this.setIsEditing(false);
                            if (this.stateBehavior === "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                                this.beginEdit();
                        }

                        if (this.ownerAttributeWithReference) {
                            if (this.ownerAttributeWithReference.objectId !== this.objectId) {
                                let parent = this.ownerAttributeWithReference.parent;
                                if (parent.ownerDetailAttribute != null)
                                    parent = parent.ownerDetailAttribute.parent;

                                parent.beginEdit();
                                this.ownerAttributeWithReference.changeReference([po.objectId]);
                            }
                            else if (this.ownerAttributeWithReference.value !== this.breadcrumb)
                                this.ownerAttributeWithReference.value = this.breadcrumb;
                        }
                        else if (this.ownerQuery)
                            this.ownerQuery.search({ keepSelection: this.isBulkEdit });
                    }
                    else if (!StringEx.isNullOrWhiteSpace(this.notification))
                        throw this.notification;
                }

                return true;
            });
        }

        getRegisteredInputs(): linqjs.Enumerable<linqjs.KeyValuePair<string, HTMLInputElement>> {
            return this._inputs.toEnumerable().memoize();
        }

        hasRegisteredInput(attributeName: string): boolean {
            return !!this._inputs.contains(attributeName);
        }

        registerInput(attributeName: string, input: HTMLInputElement) {
            this._inputs.add(attributeName, input);
        }

        clearRegisteredInputs(attributeName?: string) {
            if (attributeName)
                this._inputs.remove(attributeName);
            else
                this._inputs.clear();
        }

        toServiceObject(skipParent: boolean = false): any {
            const result = this.copyProperties(["id", "type", "objectId", "isNew", "isHidden", "bulkObjectIds", "securityToken", "isSystem"]);

            if (this.ownerQuery)
                result.ownerQueryId = this.ownerQuery.id;

            if (this.parent && !skipParent)
                result.parent = this.parent.toServiceObject();
            if (this.attributes)
                result.attributes = Enumerable.from(this.attributes).select(attr => attr._toServiceObject()).toArray();

            return result;
        }

        refreshFromResult(result: PersistentObject, resultWins: boolean = false) {
            if (result instanceof PersistentObject)
                result = result._lastResult;

            const changedAttributes: PersistentObjectAttribute[] = [];
            let isDirty = false;

            if (!this.isEditing && result.attributes.some(a => a.isValueChanged))
                this.beginEdit();

            this._lastResult = result;

            this.attributes.removeAll(attr => {
                if (!result.attributes.some(serviceAttr => serviceAttr.id === attr.id)) {
                    delete this.attributes[attr.name];
                    attr.parent = null;
                    changedAttributes.push(attr);

                    return true;
                }

                return false;
            });

            this.attributes.forEach(attr => {
                let serviceAttr = Enumerable.from(result.attributes).firstOrDefault(serviceAttr => serviceAttr.id === attr.id);
                if (serviceAttr) {
                    if (!(serviceAttr instanceof PersistentObjectAttribute))
                        serviceAttr = this._createPersistentObjectAttribute(serviceAttr);

                    if (attr._refreshFromResult(serviceAttr, resultWins))
                        changedAttributes.push(attr);
                }

                if (attr.isValueChanged)
                    isDirty = true;
            });

            result.attributes.forEach(serviceAttr => {
                if (!this.attributes.some(a => a.id === serviceAttr.id)) {
                    const attr = this._createPersistentObjectAttribute(serviceAttr);
                    this.attributes.push(attr);
                    attr.parent = this;

                    changedAttributes.push(attr);

                    if (attr.isValueChanged)
                        isDirty = true;
                }
            });

            if (changedAttributes.length > 0)
                this.refreshTabsAndGroups(...changedAttributes);

            this.setNotification(result.notification, result.notificationType, result.notificationDuration);
            this._setIsDirty(isDirty, true);

            this.objectId = result.objectId;
            if (this.isNew)
                this.isNew = result.isNew;

            this.securityToken = result.securityToken;
            if (result.breadcrumb)
                this._setBreadcrumb(result.breadcrumb);

            if (result.queriesToRefresh) {
                result.queriesToRefresh.forEach(async id => {
                    const query = Enumerable.from(this.queries).firstOrDefault(q => q.id === id || q.name === id);
                    if (query && (query.hasSearched || query.notification || query.totalItems != null))
                        await query.search();
                });
            }

            this.service.hooks.onRefreshFromResult(this);
            this._setLastUpdated(new Date());
        }

        refreshTabsAndGroups(...changedAttributes: PersistentObjectAttribute[]) {
            const tabGroupsChanged = new Set<PersistentObjectAttributeTab>();
            const tabGroupAttributesChanged = new Set<PersistentObjectAttributeGroup>();
            let tabsRemoved = false;
            let tabsAdded = false;
            changedAttributes.forEach(attr => {
                let tab = <PersistentObjectAttributeTab>Enumerable.from(this.tabs).firstOrDefault(t => t instanceof PersistentObjectAttributeTab && t.key === attr.tabKey);
                if (!tab) {
                    if (!attr.isVisible)
                        return;

                    const groups = [this.service.hooks.onConstructPersistentObjectAttributeGroup(this.service, attr.groupKey, Enumerable.from([attr]), this)];
                    groups[0].index = 0;

                    const serviceTab = this._lastResult.tabs[attr.tabKey];
                    attr.tab = tab = this.service.hooks.onConstructPersistentObjectAttributeTab(this.service, Enumerable.from(groups), attr.tabKey, serviceTab.id, serviceTab.name, serviceTab.layout, this, serviceTab.columnCount, !this.isHidden);
                    this.tabs.push(tab);
                    tabsAdded = true;
                    return;
                }

                let group = Enumerable.from(tab.groups).firstOrDefault(g => g.key === attr.groupKey);
                if (!group && attr.isVisible) {
                    group = this.service.hooks.onConstructPersistentObjectAttributeGroup(this.service, attr.groupKey, Enumerable.from([attr]), this);
                    tab.groups.push(group);
                    tab.groups.sort((g1, g2) => Enumerable.from(g1.attributes).min(a => a.offset) - Enumerable.from(g2.attributes).min(a => a.offset));
                    tab.groups.forEach((g, n) => g.index = n);

                    tabGroupsChanged.add(tab);
                }
                else if (attr.isVisible && attr.parent) {
                    if (group.attributes.indexOf(attr) < 0) {
                        group.attributes.push(attr);
                        tabGroupAttributesChanged.add(group);

                        tab.attributes.push(attr);

                        tab.attributes[attr.name] = group.attributes[attr.name] = attr;
                        group.attributes.sort((x, y) => x.offset - y.offset);
                    }
                }
                else if (group) {
                    group.attributes.remove(attr);
                    delete group.attributes[attr.name];

                    tab.attributes.remove(attr);
                    delete tab.attributes[attr.name];

                    if (group.attributes.length === 0) {
                        tab.groups.remove(group);
                        tabGroupsChanged.add(tab);

                        if (tab.groups.length === 0) {
                            this.tabs.remove(tab);
                            tabsRemoved = true;
                            return;
                        }
                        else
                            tab.groups.forEach((g, n) => g.index = n);
                    }
                    else
                        tabGroupAttributesChanged.add(group);
                }
            });

            if (tabsAdded) {
                const attrTabs = <PersistentObjectAttributeTab[]>this.tabs.filter(t => t instanceof PersistentObjectAttributeTab);
                attrTabs.sort((t1, t2) => Enumerable.from(t1.groups).selectMany(g => g.attributes).min(a => a.offset) - Enumerable.from(t2.groups).selectMany(g => g.attributes).min(a => a.offset));

                const queryTabs = <PersistentObjectQueryTab[]>this.tabs.filter(t => t instanceof PersistentObjectQueryTab);
                queryTabs.sort((q1, q2) => q1.query.offset - q2.query.offset);

                this.tabs = this.service.hooks.onSortPersistentObjectTabs(this, attrTabs, queryTabs);
            }
            else if (tabsRemoved)
                this.tabs = this.tabs.slice();

            if (tabGroupsChanged.size > 0)
                tabGroupsChanged.forEach(tab => tab.groups = tab.groups.slice());

            if (tabGroupAttributesChanged.size > 0) {
                tabGroupAttributesChanged.forEach(group => {
                    group.attributes = group.attributes.slice();
                });
            }
        }

        triggerDirty(): boolean {
            if (this.isEditing)
                this._setIsDirty(true);

            return this.isDirty;
        }

        _triggerAttributeRefresh(attr: PersistentObjectAttribute, immediate?: boolean): Promise<boolean> {
            const work = async () => {
                this._prepareAttributesForRefresh(attr);
                const result = await this.service.executeAction("PersistentObject.Refresh", this, null, null, { RefreshedPersistentObjectAttributeId: attr.id });
                if (this.isEditing)
                    this.refreshFromResult(result);

                return true;
            };

            let result: Promise<boolean>;
            if (!immediate)
                result = this.queueWork(work, false);
            else
                result = work();

            if (this.ownerDetailAttribute && this.ownerDetailAttribute.triggersRefresh) {
                return result.then(async res => {
                    await this.ownerDetailAttribute._triggerAttributeRefresh(immediate);
                    return res;
                });
            }

            return result;
        }

        _prepareAttributesForRefresh(sender: PersistentObjectAttribute) {
            Enumerable.from(this.attributes).where(a => a.id !== sender.id).forEach(attr => {
                (<any>attr)._refreshServiceValue = (<any>attr)._serviceValue;
                if (attr instanceof PersistentObjectAttributeWithReference) {
                    const attrWithRef = <any>attr;
                    attrWithRef._refreshObjectId = attrWithRef.objectId;
                }
            });
        }
    }
}