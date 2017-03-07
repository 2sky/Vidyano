/// <reference path="../Typings/es6-shim/es6-shim.d.ts" />
/// <reference path="../Typings/linq/linq.d.ts" />
/// <reference path="../Typings/PromiseQueue/promise-queue.d.ts" />
/// <reference path="../Typings/Vidyano.Common/vidyano.common.d.ts" />
declare namespace Vidyano {
    class CultureInfo {
        name: string;
        numberFormat: ICultureInfoNumberFormat;
        dateFormat: ICultureInfoDateFormat;
        static currentCulture: CultureInfo;
        static invariantCulture: CultureInfo;
        static cultures: linqjs.Dictionary<string, CultureInfo>;
        constructor(name: string, numberFormat: ICultureInfoNumberFormat, dateFormat: ICultureInfoDateFormat);
    }
    interface ICultureInfoNumberFormat {
        naNSymbol: string;
        negativeSign: string;
        positiveSign: string;
        negativeInfinityText: string;
        positiveInfinityText: string;
        percentSymbol: string;
        percentGroupSizes: Array<number>;
        percentDecimalDigits: number;
        percentDecimalSeparator: string;
        percentGroupSeparator: string;
        percentPositivePattern: string;
        percentNegativePattern: string;
        currencySymbol: string;
        currencyGroupSizes: Array<number>;
        currencyDecimalDigits: number;
        currencyDecimalSeparator: string;
        currencyGroupSeparator: string;
        currencyNegativePattern: string;
        currencyPositivePattern: string;
        numberGroupSizes: Array<number>;
        numberDecimalDigits: number;
        numberDecimalSeparator: string;
        numberGroupSeparator: string;
    }
    interface ICultureInfoDateFormat {
        amDesignator: string;
        pmDesignator: string;
        dateSeparator: string;
        timeSeparator: string;
        gmtDateTimePattern: string;
        universalDateTimePattern: string;
        sortableDateTimePattern: string;
        dateTimePattern: string;
        longDatePattern: string;
        shortDatePattern: string;
        longTimePattern: string;
        shortTimePattern: string;
        yearMonthPattern: string;
        firstDayOfWeek: number;
        dayNames: Array<string>;
        shortDayNames: Array<string>;
        minimizedDayNames: Array<string>;
        monthNames: Array<string>;
        shortMonthNames: Array<string>;
    }
}
declare namespace Vidyano {
    namespace Common {
        interface ISubjectNotifier<TSource, TDetail> {
            notify: (source: TSource, detail?: TDetail) => void;
        }
        class PropertyChangedArgs {
            propertyName: string;
            newValue: any;
            oldValue: any;
            constructor(propertyName: string, newValue: any, oldValue: any);
        }
        interface ISubjectDisposer {
            (): void;
        }
        class Subject<TSource, TDetail> {
            private _observers;
            constructor(notifier: ISubjectNotifier<TSource, TDetail>);
            attach(observer: ISubjectObserver<TSource, TDetail>): ISubjectDisposer;
            private _detach(observerId);
        }
        interface ISubjectObserver<TSource, TDetail> {
            (sender: TSource, detail: TDetail): void;
        }
        class Observable<T> {
            private _propertyChangedNotifier;
            propertyChanged: Vidyano.Common.Subject<T, Vidyano.Common.PropertyChangedArgs>;
            constructor();
            protected notifyPropertyChanged(propertyName: string, newValue: any, oldValue?: any): void;
        }
        interface IPropertyChangedObserver<T> extends ISubjectObserver<T, Vidyano.Common.PropertyChangedArgs> {
        }
    }
}
declare namespace Vidyano {
    namespace Common {
        interface IKeyValuePair {
            key: any;
            value: string;
        }
    }
}
declare namespace Vidyano {
    class ServiceObject extends Vidyano.Common.Observable<ServiceObject> {
        service: Service;
        constructor(service: Service);
        copyProperties(propertyNames: Array<string>, includeNullValues?: boolean, result?: any): any;
    }
}
declare namespace Vidyano {
    class ServiceObjectWithActions extends ServiceObject {
        private _actionNames;
        private _queue;
        private _isBusy;
        private _notification;
        private _notificationType;
        private _notificationDuration;
        actions: Action[];
        constructor(service: Service, _actionNames?: string[]);
        readonly isBusy: boolean;
        private _setIsBusy(val);
        readonly notification: string;
        readonly notificationType: NotificationType;
        readonly notificationDuration: number;
        setNotification(notification?: string, type?: NotificationType, duration?: number): void;
        queueWork<T>(work: () => Promise<T>, blockActions?: boolean): Promise<T>;
        protected _initializeActions(): void;
        private _blockActions(block);
    }
}
declare namespace Vidyano {
    class ActionDefinition {
        private _name;
        private _displayName;
        private _isPinned;
        private _refreshQueryOnCompleted;
        private _keepSelectionOnRefresh;
        private _offset;
        private _iconData;
        private _reverseIconData;
        private _confirmation;
        private _options;
        private _selectionRule;
        private _showedOn;
        constructor(service: Service, item: QueryResultItem);
        readonly name: string;
        readonly displayName: string;
        readonly isPinned: boolean;
        readonly refreshQueryOnCompleted: boolean;
        readonly keepSelectionOnRefresh: boolean;
        readonly offset: number;
        readonly iconData: string;
        readonly reverseIconData: string;
        readonly confirmation: string;
        readonly options: Array<string>;
        readonly selectionRule: (count: number) => boolean;
        readonly showedOn: string[];
    }
}
declare namespace Vidyano {
    interface IActionExecuteOptions {
        menuOption?: number;
        parameters?: any;
        selectedItems?: QueryResultItem[];
        skipOpen?: boolean;
        noConfirmation?: boolean;
        throwExceptions?: boolean;
    }
    interface ISelectedItemsActionArgs {
        name: string;
        isVisible: boolean;
        canExecute: boolean;
        options: string[];
    }
    class Action extends ServiceObject {
        service: Service;
        definition: ActionDefinition;
        owner: ServiceObjectWithActions;
        private _targetType;
        private _query;
        private _parent;
        private _isVisible;
        private _canExecute;
        private _block;
        private _parameters;
        private _offset;
        protected _isPinned: boolean;
        private _options;
        selectionRule: (count: number) => boolean;
        displayName: string;
        dependentActions: any[];
        constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        readonly parent: PersistentObject;
        readonly query: Query;
        offset: number;
        readonly name: string;
        canExecute: boolean;
        block: boolean;
        isVisible: boolean;
        readonly isPinned: boolean;
        readonly options: string[];
        private _setOptions(options);
        execute(options?: IActionExecuteOptions): Promise<PersistentObject>;
        protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        _getParameters(parameters: any, option: any): any;
        _onParentIsEditingChanged(isEditing: boolean): void;
        _onParentIsDirtyChanged(isDirty: boolean): void;
        private _setNotification(notification?, notificationType?, notificationDuration?);
        static get(service: Service, name: string, owner: ServiceObjectWithActions): Action;
        static addActions(service: Service, owner: ServiceObjectWithActions, actions: Action[], actionNames: string[]): void;
    }
}
declare namespace Vidyano {
    let cookiePrefix: string;
    function cookie(key: string, value?: any, options?: {
        force?: boolean;
        raw?: boolean;
        path?: string;
        domain?: string;
        secure?: boolean;
        expires?: number | Date;
    }): string;
}
declare namespace Vidyano {
    class ExecuteActionArgs {
        private service;
        persistentObject: PersistentObject;
        query: Query;
        selectedItems: Array<QueryResultItem>;
        parameters: any;
        private _action;
        action: string;
        isHandled: boolean;
        result: PersistentObject;
        constructor(service: Service, action: string, persistentObject: PersistentObject, query: Query, selectedItems: Array<QueryResultItem>, parameters: any);
        executeServiceRequest(): Promise<PersistentObject>;
    }
}
declare namespace Vidyano {
    class NoInternetMessage {
        private language;
        title: string;
        message: string;
        tryAgain: string;
        static messages: linqjs.Dictionary<string, NoInternetMessage>;
        constructor(language: string, title: string, message: string, tryAgain: string);
    }
}
declare namespace Vidyano {
    class PersistentObjectAttribute extends ServiceObject {
        parent: PersistentObject;
        private _isSystem;
        private _lastParsedValue;
        private _cachedValue;
        private _serviceValue;
        private _serviceOptions;
        private _displayValueSource;
        private _displayValue;
        private _validationError;
        private _tab;
        private _tabKey;
        private _group;
        private _groupKey;
        private _isRequired;
        private _isReadOnly;
        private _isValueChanged;
        protected _shouldRefresh: boolean;
        private _refreshValue;
        id: string;
        name: string;
        label: string;
        options: string[] | Common.IKeyValuePair[];
        offset: number;
        type: string;
        toolTip: string;
        rules: string;
        visibility: string;
        typeHints: any;
        editTemplateKey: string;
        templateKey: string;
        disableSort: boolean;
        triggersRefresh: boolean;
        column: number;
        columnSpan: number;
        constructor(service: Service, attr: any, parent: PersistentObject);
        readonly groupKey: string;
        group: PersistentObjectAttributeGroup;
        readonly tabKey: string;
        tab: PersistentObjectAttributeTab;
        readonly isSystem: boolean;
        readonly isVisible: boolean;
        private _setIsVisible(visibility);
        validationError: string;
        readonly isRequired: boolean;
        private _setIsRequired(isRequired);
        readonly isReadOnly: boolean;
        private _setIsReadOnly(isReadOnly);
        readonly displayValue: string;
        readonly shouldRefresh: boolean;
        value: any;
        setValue(val: any, allowRefresh?: boolean): Promise<any>;
        isValueChanged: boolean;
        getTypeHint(name: string, defaultValue?: string, typeHints?: any, ignoreCasing?: boolean): string;
        getRegisteredInput(): HTMLInputElement;
        registerInput(input: HTMLInputElement): void;
        clearRegisteredInput(): void;
        _toServiceObject(): any;
        _refreshFromResult(resultAttr: PersistentObjectAttribute, resultWins: boolean): boolean;
        _triggerAttributeRefresh(immediate?: boolean): Promise<any>;
        protected _setOptions(options: string[]): void;
    }
}
declare namespace Vidyano {
    class PersistentObjectAttributeAsDetail extends PersistentObjectAttribute {
        parent: PersistentObject;
        private _objects;
        details: Query;
        lookupAttribute: string;
        constructor(service: Service, attr: any, parent: PersistentObject);
        readonly objects: Vidyano.PersistentObject[];
        private _setObjects(objects);
        newObject(): Promise<PersistentObject>;
        _refreshFromResult(resultAttr: PersistentObjectAttribute, resultWins: boolean): boolean;
        _toServiceObject(): any;
        onChanged(allowRefresh: boolean): Promise<any>;
    }
}
declare namespace Vidyano {
    class PersistentObjectAttributeGroup extends Vidyano.Common.Observable<PersistentObjectAttributeGroup> {
        service: Service;
        key: string;
        parent: PersistentObject;
        private _attributes;
        label: string;
        index: number;
        constructor(service: Service, key: string, _attributes: PersistentObjectAttribute[], parent: PersistentObject);
        attributes: PersistentObjectAttribute[];
    }
}
declare namespace Vidyano {
    class PersistentObjectAttributeWithReference extends PersistentObjectAttribute {
        parent: PersistentObject;
        lookup: Query;
        objectId: string;
        displayAttribute: string;
        canAddNewReference: boolean;
        selectInPlace: boolean;
        constructor(service: Service, attr: any, parent: PersistentObject);
        addNewReference(): Promise<void>;
        changeReference(selectedItems: QueryResultItem[] | string[]): Promise<boolean>;
        getPersistentObject(): Promise<Vidyano.PersistentObject>;
        _refreshFromResult(resultAttr: PersistentObjectAttribute, resultWins: boolean): boolean;
    }
}
declare namespace Vidyano {
    class PersistentObjectTab extends Common.Observable<PersistentObjectTab> {
        service: Service;
        name: string;
        label: string;
        target: ServiceObjectWithActions;
        parent: PersistentObject;
        private _isVisible;
        tabGroupIndex: number;
        constructor(service: Service, name: string, label: string, target: ServiceObjectWithActions, parent?: PersistentObject, _isVisible?: boolean);
        isVisible: boolean;
    }
    class PersistentObjectAttributeTab extends PersistentObjectTab {
        private _groups;
        key: string;
        id: string;
        private _layout;
        columnCount: number;
        private _attributes;
        constructor(service: Service, _groups: PersistentObjectAttributeGroup[], key: string, id: string, name: string, _layout: any, po: PersistentObject, columnCount: number, isVisible: boolean);
        readonly layout: any;
        private _setLayout(layout);
        readonly attributes: PersistentObjectAttribute[];
        groups: PersistentObjectAttributeGroup[];
        saveLayout(layout: any): Promise<any>;
        private _updateAttributes();
    }
    class PersistentObjectQueryTab extends PersistentObjectTab {
        query: Query;
        constructor(service: Service, query: Query);
    }
}
declare namespace Vidyano {
    enum PersistentObjectLayoutMode {
        FullPage = 0,
        MasterDetail = 1,
    }
    class PersistentObject extends ServiceObjectWithActions {
        private _isSystem;
        private _lastResult;
        private _lastUpdated;
        private _lastResultBackup;
        private securityToken;
        private _isEditing;
        private _isDirty;
        private _inputs;
        private _id;
        private _type;
        private _breadcrumb;
        private _isDeleted;
        private _tabs;
        private _isFrozen;
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
        parent: PersistentObject;
        ownerDetailAttribute: PersistentObjectAttributeAsDetail;
        ownerAttributeWithReference: PersistentObjectAttributeWithReference;
        ownerPersistentObject: PersistentObject;
        ownerQuery: Query;
        bulkObjectIds: string[];
        queriesToRefresh: Array<string>;
        attributes: PersistentObjectAttribute[];
        queries: Query[];
        constructor(service: Service, po: any);
        private _createPersistentObjectAttribute(attr);
        readonly id: string;
        readonly isSystem: boolean;
        readonly type: string;
        readonly isBulkEdit: boolean;
        tabs: PersistentObjectTab[];
        readonly isEditing: boolean;
        private setIsEditing(value);
        readonly breadcrumb: string;
        private _setBreadcrumb(breadcrumb);
        readonly isDirty: boolean;
        private _setIsDirty(value, force?);
        isDeleted: boolean;
        readonly isFrozen: boolean;
        freeze(): void;
        unfreeze(): void;
        getAttribute(name: string): PersistentObjectAttribute;
        getAttributeValue(name: string): any;
        setAttributeValue(name: string, value: any, allowRefresh?: boolean): Promise<any>;
        readonly lastUpdated: Date;
        private _setLastUpdated(lastUpdated);
        getQuery(name: string): Query;
        beginEdit(): void;
        cancelEdit(): void;
        save(waitForOwnerQuery?: boolean): Promise<boolean>;
        getRegisteredInputs(): linqjs.Enumerable<linqjs.KeyValuePair<string, HTMLInputElement>>;
        hasRegisteredInput(attributeName: string): boolean;
        registerInput(attributeName: string, input: HTMLInputElement): void;
        clearRegisteredInputs(attributeName?: string): void;
        toServiceObject(skipParent?: boolean): any;
        refreshFromResult(result: PersistentObject, resultWins?: boolean): void;
        triggerDirty(): boolean;
        _triggerAttributeRefresh(attr: PersistentObjectAttribute, immediate?: boolean): Promise<boolean>;
        _prepareAttributesForRefresh(sender: PersistentObjectAttribute): void;
    }
}
declare namespace Vidyano {
    class Application extends PersistentObject {
        private _userId;
        private _friendlyUserName;
        private _feedbackId;
        private _userSettingsId;
        private _globalSearchId;
        private _analyticsKey;
        private _userSettings;
        private _canProfile;
        private _hasManagement;
        private _session;
        private _routes;
        private _poRe;
        private _queryRe;
        programUnits: ProgramUnit[];
        constructor(service: Service, po: any);
        readonly userId: string;
        readonly friendlyUserName: string;
        readonly feedbackId: string;
        readonly userSettingsId: string;
        readonly globalSearchId: string;
        readonly analyticsKey: string;
        readonly userSettings: any;
        readonly canProfile: boolean;
        readonly hasManagement: boolean;
        readonly session: Vidyano.PersistentObject;
        readonly routes: IRoutes;
        readonly poRe: RegExp;
        readonly queryRe: RegExp;
        saveUserSettings(): Promise<any>;
        _updateSession(session: any): void;
    }
    interface IRoutes {
        programUnits: {
            [name: string]: string;
        };
        persistentObjects: {
            [type: string]: string;
        };
        queries: {
            [type: string]: string;
        };
    }
}
declare namespace Vidyano {
    class ProgramUnitItem extends ServiceObject {
        path: string;
        id: string;
        title: string;
        name: string;
        constructor(service: Service, unitItem: any, path?: string);
    }
    class ProgramUnitItemGroup extends ProgramUnitItem {
        items: ProgramUnitItem[];
        constructor(service: Service, unitItem: any, items: ProgramUnitItem[]);
    }
    class ProgramUnitItemQuery extends ProgramUnitItem {
        queryId: string;
        constructor(service: Service, routes: IRoutes, unitItem: any, parent: ProgramUnit);
        private static _getPath(routes, id);
    }
    class ProgramUnitItemPersistentObject extends ProgramUnitItem {
        persistentObjectId: string;
        persistentObjectObjectId: string;
        constructor(service: Service, routes: IRoutes, unitItem: any, parent: ProgramUnit);
        private static _getPath(routes, id, objectId);
    }
    class ProgramUnitItemUrl extends ProgramUnitItem {
        constructor(service: Service, unitItem: any);
    }
}
declare namespace Vidyano {
    class ProgramUnit extends ProgramUnitItem {
        private _id;
        offset: number;
        openFirst: boolean;
        items: ProgramUnitItem[];
        constructor(service: Service, routes: IRoutes, unit: any);
        private _createItem(routes, itemData);
    }
}
declare namespace Vidyano {
    class QueryChart extends Vidyano.Common.Observable<QueryChart> {
        private _query;
        private _label;
        private _name;
        private _options;
        private _type;
        constructor(_query: Vidyano.Query, _label: string, _name: string, _options: any, _type: string);
        readonly query: Vidyano.Query;
        readonly label: string;
        readonly name: string;
        readonly options: any;
        readonly type: string;
        execute(parameters?: any): Promise<any>;
    }
}
declare namespace Vidyano {
    interface IQueryColumnDistincts {
        matching: string[];
        remaining: string[];
        isDirty: boolean;
        hasMore: boolean;
    }
    class QueryColumn extends ServiceObject {
        query: Query;
        private displayAttribute;
        private _id;
        private _sortDirection;
        private _canSort;
        private _canFilter;
        private _canListDistincts;
        private _name;
        private _type;
        private _label;
        private _distincts;
        private _selectedDistincts;
        private _selectedDistinctsInversed;
        private _total;
        offset: number;
        isPinned: boolean;
        isHidden: boolean;
        width: string;
        typeHints: any;
        constructor(service: Service, col: any, query: Query);
        readonly id: string;
        readonly name: string;
        readonly type: string;
        readonly label: string;
        readonly canFilter: boolean;
        readonly canSort: boolean;
        readonly canListDistincts: boolean;
        readonly isSorting: boolean;
        readonly sortDirection: SortDirection;
        selectedDistincts: linqjs.Enumerable<string>;
        selectedDistinctsInversed: boolean;
        distincts: IQueryColumnDistincts;
        readonly total: QueryResultItemValue;
        private _setTotal(total);
        private _setSortDirection(direction);
        _toServiceObject(): any;
        getTypeHint(name: string, defaultValue?: string, typeHints?: any, ignoreCasing?: boolean): string;
        refreshDistincts(): Promise<IQueryColumnDistincts>;
        sort(direction: SortDirection, multiSort?: boolean): Promise<QueryResultItem[]>;
        private _queryPropertyChanged(sender, args);
    }
}
declare namespace Vidyano {
    class QueryFilters extends Vidyano.Common.Observable<QueryFilters> {
        private _query;
        private _filtersPO;
        private _filters;
        private _currentFilter;
        private _filtersAsDetail;
        private _skipSearch;
        constructor(_query: Query, _filtersPO: Vidyano.PersistentObject);
        readonly filters: QueryFilter[];
        private _setFilters(filters);
        readonly detailsAttribute: PersistentObjectAttributeAsDetail;
        currentFilter: QueryFilter;
        private _computeFilters(setDefaultFilter?);
        private _computeFilterData();
        getFilter(name: string): QueryFilter;
        createNew(): Promise<QueryFilter>;
        save(filter?: QueryFilter): Promise<QueryFilter>;
        delete(name: string | QueryFilter): Promise<any>;
    }
    class QueryFilter extends Vidyano.Common.Observable<QueryFilter> {
        persistentObject: PersistentObject;
        constructor(persistentObject: PersistentObject);
        readonly name: string;
        readonly isLocked: boolean;
        readonly isDefault: boolean;
    }
}
declare namespace Vidyano {
    class QueryResultItemValue extends ServiceObject {
        private _item;
        private _value;
        private _valueParsed;
        key: string;
        value: string;
        typeHints: any;
        persistentObjectId: string;
        objectId: string;
        constructor(service: Service, _item: QueryResultItem, value: any);
        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        getValue(): any;
        _toServiceObject(): any;
    }
}
declare namespace Vidyano {
    class QueryResultItem extends ServiceObject {
        query: Query;
        private _isSelected;
        private _ignoreSelect;
        id: string;
        rawValues: linqjs.Enumerable<QueryResultItemValue>;
        typeHints: any;
        private _fullValuesByName;
        private _values;
        constructor(service: Service, item: any, query: Query, _isSelected: boolean);
        readonly values: {
            [key: string]: any;
        };
        isSelected: boolean;
        readonly ignoreSelect: boolean;
        getValue(key: string): any;
        getFullValue(key: string): QueryResultItemValue;
        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        getPersistentObject(throwExceptions?: boolean): Promise<PersistentObject>;
        _toServiceObject(): any;
    }
}
declare namespace Vidyano {
    enum SortDirection {
        None = 0,
        Ascending = 1,
        Descending = 2,
    }
    interface ISortOption {
        column: QueryColumn;
        direction: SortDirection;
    }
    interface IQuerySelectAll {
        isAvailable: boolean;
        allSelected: boolean;
        inverse: boolean;
    }
    class Query extends ServiceObjectWithActions {
        parent: PersistentObject;
        maxSelectedItems: number;
        private _lastResult;
        private _asLookup;
        private _isSelectionModifying;
        private _totalItems;
        private _labelWithTotalItems;
        private _sortOptions;
        private _queriedPages;
        private _filters;
        private _canFilter;
        private _canRead;
        private _canReorder;
        private _charts;
        private _defaultChartName;
        private _currentChart;
        private _lastUpdated;
        private _totalItem;
        private _isSystem;
        private _isFiltering;
        private _columnObservers;
        persistentObject: PersistentObject;
        columns: QueryColumn[];
        id: string;
        name: string;
        autoQuery: boolean;
        isHidden: boolean;
        hasSearched: boolean;
        label: string;
        singularLabel: string;
        offset: number;
        textSearch: string;
        pageSize: number;
        skip: number;
        top: number;
        items: QueryResultItem[];
        groupingInfo: {
            groupedBy: string;
            type: string;
            groups: {
                name: string;
                start: number;
                count: number;
                end: number;
            }[];
        };
        selectAll: IQuerySelectAll;
        constructor(service: Service, query: any, parent?: PersistentObject, asLookup?: boolean, maxSelectedItems?: number);
        readonly isSystem: boolean;
        readonly filters: QueryFilters;
        readonly canFilter: boolean;
        private _setCanFilter(val);
        readonly canRead: boolean;
        readonly canReorder: boolean;
        readonly charts: linqjs.Enumerable<QueryChart>;
        private _setCharts(charts);
        currentChart: QueryChart;
        defaultChartName: string;
        readonly lastUpdated: Date;
        private _setLastUpdated(date?);
        selectedItems: QueryResultItem[];
        private _selectAllPropertyChanged(selectAll, args);
        selectRange(from: number, to: number): boolean;
        readonly asLookup: boolean;
        readonly totalItems: number;
        readonly labelWithTotalItems: string;
        sortOptions: ISortOption[];
        readonly totalItem: QueryResultItem;
        private _setTotalItem(item);
        reorder(before: QueryResultItem, item: QueryResultItem, after: QueryResultItem): Promise<QueryResultItem[]>;
        private _setSortOptionsFromService(options);
        private _setTotalItems(items);
        readonly isFiltering: boolean;
        private _updateIsFiltering();
        _toServiceObject(): any;
        _setResult(result: any): void;
        getColumn(name: string): QueryColumn;
        getItemsInMemory(start: number, length: number): QueryResultItem[];
        getItems(start: number, length?: number, skipQueue?: boolean): Promise<QueryResultItem[]>;
        search(delay?: number): Promise<QueryResultItem[]>;
        search(options: {
            delay?: number;
            throwExceptions?: boolean;
        }): Promise<QueryResultItem[]>;
        clone(asLookup?: boolean): Query;
        private _updateColumns(_columns?);
        private _queryColumnPropertyChanged(sender, args);
        private _updateItems(items, reset?);
        _notifyItemSelectionChanged(item: QueryResultItem): void;
        private _updateSelectAll(item?, selectedItems?);
        static FromJsonData(service: Service, data: IJsonQueryData): Query;
    }
    interface IJsonQueryData {
        id?: string;
        name?: string;
        label?: string;
        singularLabel?: string;
        items: {
            id: string | number;
            breadcrumb?: string;
            typeHints?: {
                [name: string]: string;
            };
            values: {
                key: string;
                value: string;
                typeHints?: {
                    [name: string]: string;
                };
            }[];
        }[];
        columns: {
            name: string;
            label: string;
            type: string;
            width?: string;
            typeHints?: {
                [name: string]: string;
            };
        }[];
    }
}
declare namespace Vidyano {
    class ServiceHooks {
        private _service;
        readonly service: Vidyano.Service;
        createData(data: any): void;
        trackEvent(name: string, option: string, owner: ServiceObjectWithActions): void;
        onInitialize(clientData: IServiceClientData): Promise<IServiceClientData>;
        onSessionExpired(): boolean;
        onActionConfirmation(action: Action, option: number): Promise<boolean>;
        onAction(args: ExecuteActionArgs): Promise<PersistentObject>;
        onOpen(obj: ServiceObject, replaceCurrent?: boolean, fromAction?: boolean): void;
        onClose(obj: ServiceObject): void;
        onConstructPersistentObject(service: Service, po: any): PersistentObject;
        onConstructPersistentObjectAttributeTab(service: Service, groups: linqjs.Enumerable<PersistentObjectAttributeGroup>, key: string, id: string, name: string, layout: any, parent: PersistentObject, columnCount: number, isVisible: boolean): PersistentObjectAttributeTab;
        onConstructPersistentObjectQueryTab(service: Service, query: Query): PersistentObjectQueryTab;
        onConstructPersistentObjectAttributeGroup(service: Service, key: string, attributes: linqjs.Enumerable<PersistentObjectAttribute>, parent: PersistentObject): PersistentObjectAttributeGroup;
        onConstructPersistentObjectAttribute(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttribute;
        onConstructPersistentObjectAttributeWithReference(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeWithReference;
        onConstructPersistentObjectAttributeAsDetail(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeAsDetail;
        onConstructQuery(service: Service, query: any, parent?: PersistentObject, asLookup?: boolean, maxSelectedItems?: number): Query;
        onConstructQueryResultItem(service: Service, item: any, query: Query, isSelected?: boolean): QueryResultItem;
        onConstructQueryResultItemValue(service: Service, item: QueryResultItem, value: any): QueryResultItemValue;
        onConstructQueryColumn(service: Service, col: any, query: Query): QueryColumn;
        onConstructAction(service: Service, action: Action): Action;
        onSortPersistentObjectTabs(parent: Vidyano.PersistentObject, attributeTabs: Vidyano.PersistentObjectAttributeTab[], queryTabs: Vidyano.PersistentObjectQueryTab[]): Vidyano.PersistentObjectTab[];
        onMessageDialog(title: string, message: string, rich: boolean, ...actions: string[]): Promise<number>;
        onShowNotification(notification: string, type: NotificationType, duration: number): void;
        onSelectReference(query: Vidyano.Query): Promise<QueryResultItem[]>;
        onNavigate(path: string, replaceCurrent?: boolean): void;
        onClientOperation(operation: ClientOperations.IClientOperation): void;
        onSelectedItemsActions(query: Query, selectedItems: QueryResultItem[], action: ISelectedItemsActionArgs): void;
        onRefreshFromResult(po: PersistentObject): void;
        onUpdateAvailable(): void;
        onRetryAction(retry: IRetryAction): Promise<string>;
    }
}
declare namespace Vidyano {
    let version: string;
    class Service extends Vidyano.Common.Observable<Service> {
        serviceUri: string;
        hooks: ServiceHooks;
        private _forceUser;
        private static _getMs;
        private static _base64KeyStr;
        private static _token;
        private _lastAuthTokenUpdate;
        private _isUsingDefaultCredentials;
        private _clientData;
        private _language;
        private _languages;
        private _windowsAuthentication;
        private _providers;
        private _isSignedIn;
        private _application;
        private _profile;
        private _profiledRequests;
        private _queuedClientOperations;
        staySignedIn: boolean;
        icons: linqjs.Dictionary<string, string>;
        actionDefinitions: linqjs.Dictionary<string, ActionDefinition>;
        environment: string;
        environmentVersion: string;
        constructor(serviceUri: string, hooks?: ServiceHooks, _forceUser?: string);
        static token: string;
        private _createUri(method);
        private _createData(method, data?);
        private _getMs();
        private _postJSON(url, data);
        private _postJSONProcess(data, result, requestMethod, createdRequest, requestStart, elapsedMs);
        private _getJSON(url);
        private static _decodeBase64(input);
        private static _getServiceTimeString;
        _getStream(obj: PersistentObject, action?: string, parent?: PersistentObject, query?: Query, selectedItems?: Array<QueryResultItem>, parameters?: any): void;
        readonly queuedClientOperations: ClientOperations.IClientOperation[];
        readonly application: Application;
        private _setApplication(application);
        language: ILanguage;
        requestedLanguage: string;
        readonly isSignedIn: boolean;
        private _setIsSignedIn(val);
        readonly languages: ILanguage[];
        readonly windowsAuthentication: boolean;
        readonly providers: {
            [name: string]: IProviderParameters;
        };
        readonly isUsingDefaultCredentials: boolean;
        private _setIsUsingDefaultCredentials(val);
        readonly userName: string;
        private _setUserName(val);
        readonly defaultUserName: string;
        private authToken;
        profile: boolean;
        readonly profiledRequests: IServiceRequest[];
        private _setProfiledRequests(requests);
        getTranslatedMessage(key: string, ...params: string[]): string;
        initialize(skipDefaultCredentialLogin?: boolean): Promise<Application>;
        signInExternal(providerName: string): void;
        signInUsingCredentials(userName: string, password: string, code?: string): Promise<Application>;
        signInUsingDefaultCredentials(): Promise<Application>;
        signOut(skipAcs?: boolean): Promise<boolean>;
        private _getApplication(data?);
        getQuery(id: string, asLookup?: boolean): Promise<Query>;
        getPersistentObject(parent: PersistentObject, id: string, objectId?: string): Promise<PersistentObject>;
        executeQuery(parent: PersistentObject, query: Query, asLookup?: boolean, throwExceptions?: boolean): Promise<any>;
        executeAction(action: string, parent: PersistentObject, query: Query, selectedItems: Array<QueryResultItem>, parameters?: any, skipHooks?: boolean): Promise<PersistentObject>;
        getReport(token: string, {filter, orderBy, top, skip, hideIds, hideType}?: IReportOptions): Promise<any[]>;
        static getDate: (yearString: string, monthString: string, dayString: string, hourString: string, minuteString: string, secondString: string, msString: string) => Date;
        static fromServiceString(value: string, typeName: string): any;
        static toServiceString(value: any, typeName: string): string;
        static numericTypes: string[];
        static isNumericType(type: string): boolean;
        static dateTimeTypes: string[];
        static isDateTimeType(type: string): boolean;
    }
    enum NotificationType {
        Error = 0,
        Notice = 1,
        OK = 2,
        Warning = 3,
    }
    interface IProviderParameters {
        label: string;
        description: string;
        requestUri: string;
        signOutUri: string;
        redirectUri: string;
    }
    interface ILanguage {
        culture: string;
        name: string;
        isDefault: boolean;
        messages: {
            [key: string]: string;
        };
    }
    interface IReportOptions {
        filter?: string;
        orderBy?: string;
        top?: number;
        skip?: number;
        hideIds?: boolean;
        hideType?: boolean;
    }
    interface IRetryAction {
        title: string;
        message: string;
        options: string[];
        persistentObject?: PersistentObject;
    }
    interface IServiceClientData {
        defaultUser: string;
        exception: string;
        languages: {
            [code: string]: {
                name: string;
                isDefault: boolean;
                messages: {
                    [key: string]: string;
                };
            };
        };
        providers: {
            [name: string]: {
                parameters: IProviderParameters;
            };
        };
    }
    interface IServiceRequest {
        when: Date;
        profiler: IServiceRequestProfiler;
        transport: number;
        method: string;
        request: any;
        response: any;
    }
    interface IServiceRequestProfiler {
        taskId: number;
        elapsedMilliseconds: number;
        entries: IServiceRequestProfilerEntry[];
        sql: IServiceRequestProfilerSQL[];
        exceptions: {
            id: string;
            message: string;
        }[];
    }
    interface IServiceRequestProfilerEntry {
        entries: IServiceRequestProfilerEntry[];
        methodName: string;
        sql: string[];
        started: number;
        elapsedMilliseconds: number;
        hasNPlusOne?: boolean;
        exception: string;
        arguments: any[];
    }
    interface IServiceRequestProfilerSQL {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        recordsAffected: number;
        taskId: number;
        type: string;
        parameters: IServiceRequestProfilerSQLParameter[];
    }
    interface IServiceRequestProfilerSQLParameter {
        name: string;
        type: string;
        value: string;
    }
    interface IServiceClientData {
        defaultUser: string;
        exception: string;
        languages: {
            [code: string]: {
                name: string;
                isDefault: boolean;
                messages: {
                    [key: string]: string;
                };
            };
        };
        providers: {
            [name: string]: {
                parameters: IProviderParameters;
            };
        };
    }
    interface IServiceRequest {
        when: Date;
        profiler: IServiceRequestProfiler;
        transport: number;
        method: string;
        request: any;
        response: any;
    }
    interface IServiceRequestProfiler {
        taskId: number;
        elapsedMilliseconds: number;
        entries: IServiceRequestProfilerEntry[];
        sql: IServiceRequestProfilerSQL[];
        exceptions: {
            id: string;
            message: string;
        }[];
    }
    interface IServiceRequestProfilerEntry {
        entries: IServiceRequestProfilerEntry[];
        methodName: string;
        sql: string[];
        started: number;
        elapsedMilliseconds: number;
        hasNPlusOne?: boolean;
        exception: string;
        arguments: any[];
    }
    interface IServiceRequestProfilerSQL {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        recordsAffected: number;
        taskId: number;
        type: string;
        parameters: IServiceRequestProfilerSQLParameter[];
    }
    interface IServiceRequestProfilerSQLParameter {
        name: string;
        type: string;
        value: string;
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        interface IClientOperation {
            type: string;
        }
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        interface IExecuteMethodOperation extends IClientOperation {
            name: string;
            arguments: any[];
        }
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        interface IOpenOperation extends IClientOperation {
            persistentObject: any;
            replace?: boolean;
        }
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        interface IRefreshOperation extends IClientOperation {
            delay?: number;
            queryId?: string;
            fullTypeName?: string;
            objectId?: string;
        }
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        function navigate(hooks: ServiceHooks, path: string, replaceCurrent?: boolean): void;
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        function openUrl(hooks: ServiceHooks, url: string): void;
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        function reloadPage(): void;
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        function showMessageBox(hooks: ServiceHooks, title: string, message: string, rich?: boolean, delay?: number): void;
    }
}
declare namespace Vidyano {
    namespace Actions {
        class CancelEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onParentIsEditingChanged(isEditing: boolean): void;
            _onParentIsDirtyChanged(isDirty: boolean): void;
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class CancelSave extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class Edit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onParentIsEditingChanged(isEditing: boolean): void;
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class EndEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onParentIsEditingChanged(isEditing: boolean): void;
            _onParentIsDirtyChanged(isDirty: boolean): void;
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class ExportToCsv extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class ExportToExcel extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class Filter extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class RefreshQuery extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<any>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class Save extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class ShowHelp extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            protected _onExecute({menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions}: IActionExecuteOptions): Promise<PersistentObject>;
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class viConfigurePO extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class viConfigureQuery extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        }
    }
}
declare namespace Vidyano {
    namespace Actions {
        class viSearch extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        }
    }
}
declare namespace Vidyano {
    namespace ClientOperations {
        function refreshForUpdate(hooks: ServiceHooks, path: string, replaceCurrent?: boolean): void;
    }
}
