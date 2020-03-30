declare type KeyValuePair<T, U> = {
    key: T;
    value: U;
};
declare type KeyValue<T> = {
    [key: string]: T;
};
declare type NamedArray<T> = Array<T> & {
    [name: string]: T;
};
declare namespace Vidyano {
    class CultureInfo {
        name: string;
        numberFormat: ICultureInfoNumberFormat;
        dateFormat: ICultureInfoDateFormat;
        static currentCulture: CultureInfo;
        static invariantCulture: CultureInfo;
        static cultures: KeyValue<CultureInfo>;
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
    abstract class DataType {
        static isDateTimeType(type: string): boolean;
        static isNumericType(type: string): boolean;
        static isBooleanType(type: string): boolean;
        private static _getDate;
        private static _getServiceTimeString;
        static fromServiceString(value: string, type: string): any;
        static toServiceString(value: any, type: string): string;
    }
}
declare namespace Vidyano.Service {
    type KeyValue<T> = {
        [key: string]: T;
    };
    type KeyValueString = KeyValue<string>;
    type NotificationType = "" | "OK" | "Notice" | "Warning" | "Error";
    type SortDirection = "" | "ASC" | "DESC";
    type Request = {
        userName?: string;
        authToken?: string;
        clientVersion?: string;
        environment: "Web" | "Web,ServiceWorker";
        environmentVersion: string;
    };
    type Response = {
        authToken?: string;
        exception?: string;
    };
    type GetApplicationRequest = {
        password?: string;
    } & Request;
    type GetQueryRequest = {
        id: string;
    } & Request;
    type GetQueryResponse = {
        query: Query;
    } & Response;
    type GetPersistentObjectRequest = {
        persistentObjectTypeId: string;
        objectId?: string;
        isNew?: boolean;
        parent?: PersistentObject;
    } & Request;
    type GetPersistentObjectResponse = {
        result: PersistentObject;
    } & Response;
    type ExecuteActionParameters = {
        [key: string]: string;
    };
    type ExecuteActionRequest = {
        action: string;
        parameters: ExecuteActionParameters;
    } & Request;
    type ExecuteActionRefreshParameters = {
        RefreshedPersistentObjectAttributeId: string;
    } & ExecuteActionParameters;
    type ExecuteQueryActionRequest = {
        parent: PersistentObject;
        query: Query;
        selectedItems: QueryResultItem[];
    } & ExecuteActionRequest;
    type ExecuteQueryFilterActionRequest = {
        query: Query;
    } & ExecuteActionRequest;
    type ExecutePersistentObjectActionRequest = {
        parent: PersistentObject;
    } & ExecuteActionRequest;
    type ExecuteActionResponse = {
        result: PersistentObject;
    } & Response;
    type ExecuteQueryRequest = {
        query: Query;
        parent: PersistentObject;
    } & Request;
    type ExecuteQueryResponse = {
        result: QueryResult;
    } & Response;
    type ProviderParameters = {
        label: string;
        description: string;
        requestUri: string;
        signOutUri: string;
        redirectUri: string;
        registerPersistentObjectId?: string;
        registerUser?: string;
        forgotPassword?: boolean;
        getCredentialType?: boolean;
    };
    type ClientData = {
        defaultUser: string;
        exception: string;
        languages: Languages;
        providers: {
            [name: string]: {
                parameters: ProviderParameters;
            };
        };
        windowsAuthentication: boolean;
    };
    type Languages = {
        [culture: string]: Language;
    };
    type Language = {
        name: string;
        isDefault: boolean;
        messages: KeyValueString;
    };
    type ApplicationResponse = {
        application: PersistentObject;
        userCultureInfo: string;
        userLanguage: string;
        userName: string;
        hasSensitive: boolean;
    } & Response;
    type PersistentObject = {
        actions: string[];
        attributes: PersistentObjectAttribute[];
        breadcrumb?: string;
        dialogSaveAction: string;
        fullTypeName: string;
        id: string;
        isBreadcrumbSensitive: boolean;
        isNew?: boolean;
        isSystem: boolean;
        label: string;
        newOptions: string;
        notification: string;
        notificationType: NotificationType;
        notificationDuration: number;
        objectId: string;
        queries: Query[];
        queryLayoutMode: string;
        securityToken: never;
        stateBehavior: "OpenInEdit" | "StayInEdit" | "AsDialog";
        tabs: PersistentObjectTab[];
        type: string;
    };
    type PersistentObjectAttribute = {
        name: string;
        type: string;
        group: string;
        tab: string;
        label: string;
        value: string;
        isReadOnly?: boolean;
        isRequired?: boolean;
        isSensitive?: boolean;
        isValueChanged?: boolean;
        offset: number;
        rules?: string;
        visibility: string;
    };
    type PersistentObjectAttributeWithReference = {
        displayAttribute: string;
        lookup: Query;
        objectId: string;
    } & PersistentObjectAttribute;
    type PersistentObjectTab = {
        columnCount: number;
        id: string;
        name: string;
    };
    type Query = {
        actionLabels?: KeyValueString;
        actions: string[];
        allowTextSearch: boolean;
        allSelected: boolean;
        allSelectedInversed: boolean;
        autoQuery: boolean;
        canRead: boolean;
        columns: QueryColumn[];
        disableBulkEdit: boolean;
        enableSelectAll: boolean;
        filters: PersistentObject;
        groupedBy: string;
        id: string;
        label: string;
        name: string;
        notification: string;
        notificationType: NotificationType;
        notificationDuration: number;
        pageSize: number;
        persistentObject: PersistentObject;
        result: QueryResult;
        sortOptions: string;
        textSearch: string;
    };
    type QueryColumn = {
        canFilter: boolean;
        canGroupBy: boolean;
        canListDistincts: boolean;
        canSort: boolean;
        id: string;
        isHidden: boolean;
        isSensitive?: boolean;
        label: string;
        name: string;
        offset: number;
        persistentObjectId: string;
        type: string;
    };
    type QueryResult = {
        charts: QueryChart[];
        columns: QueryColumn[];
        continuation?: string;
        groupedBy?: string;
        groupingInfo?: QueryGroupingInfo;
        items: QueryResultItem[];
        notification?: string;
        notificationDuration?: number;
        notificationType?: NotificationType;
        pageSize?: number;
        sortOptions: string;
        totalItem?: QueryResultItem;
        totalItems?: number;
    };
    type QueryResultItem = {
        id: string;
        values: QueryResultItemValue[];
        typeHints?: KeyValueString;
    };
    type QueryResultItemValue = {
        key: string;
        value: string;
        objectId?: string;
        typeHints?: KeyValueString;
    };
    type QueryGroupingInfo = {
        groupedBy: string;
        groups?: QueryResultItemGroup[];
    };
    type QueryResultItemGroup = {
        name: string;
        count: number;
    };
    type QueryChart = {
        label: string;
        name: string;
        type: string;
        options: any;
    };
    type RetryAction = {
        cancelOption?: number;
        defaultOption?: number;
        message: string;
        options: string[];
        persistentObject?: PersistentObject;
        title: string;
    };
    type ProfilerRequest = {
        method: string;
        profiler: Profiler;
        request: any;
        response: any;
        transport: number;
        when: Date;
    };
    type Profiler = {
        elapsedMilliseconds: number;
        entries: ProfilerEntry[];
        exceptions: {
            id: string;
            message: string;
        }[];
        sql: ProfilerSql[];
        taskId: number;
    };
    type ProfilerEntry = {
        arguments: any[];
        elapsedMilliseconds: number;
        entries: ProfilerEntry[];
        exception: string;
        hasNPlusOne?: boolean;
        methodName: string;
        sql: string[];
        started: number;
    };
    type ProfilerSql = {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        parameters: ProfilerSqlParameter[];
        recordsAffected: number;
        taskId: number;
        type: string;
    };
    type ProfilerSqlParameter = {
        name: string;
        type: string;
        value: string;
    };
}
declare namespace Vidyano {
    export type Store = "Requests" | "Queries" | "QueryResults" | "ActionClassesById" | "Changes" | "Settings";
    export type RequestMapKey = "GetQuery" | "GetPersistentObject";
    export type StoreGetClientDataRequest = {
        id: "GetClientData";
        response: Service.ClientData;
    };
    export type StoreGetApplicationRequest = {
        id: "GetApplication";
        response: Service.ApplicationResponse;
    };
    export type StoreQuery = {
        newPersistentObject?: Service.PersistentObject;
        hasResults: "true" | "false";
    } & Service.Query;
    export type StoreQueryResultItem = {
        persistentObjectId: string;
    } & Service.QueryResultItem;
    export type StoreActionClassById = {
        id: string;
        name: string;
    };
    export type StoreChangeType = "New" | "Edit" | "Delete";
    export type StoreChange = {
        id?: string;
        ts: string;
        persistentObjectId: string;
        type: StoreChangeType;
        objectId?: string;
        data?: any;
    };
    export type StoreSetting = {
        key: string;
        value: string;
    };
    export type StoreNameMap = {
        "Requests": StoreGetClientDataRequest | StoreGetApplicationRequest;
        "Queries": StoreQuery;
        "QueryResults": StoreQueryResultItem;
        "ActionClassesById": StoreActionClassById;
        "Changes": StoreChange;
        "Settings": StoreSetting;
    };
    export type RequestsStoreNameMap = {
        "GetClientData": StoreGetClientDataRequest;
        "GetApplication": StoreGetApplicationRequest;
    };
    export interface IIndexedDBContext {
        setting(key: string, value?: string): Promise<string>;
        delete(query: ReadOnlyQuery, items: QueryResultItem[]): Promise<number>;
        getQuery(id: string): Promise<Query>;
        getQueryResults(query: ReadOnlyQuery, parent: ReadOnlyPersistentObject): Promise<QueryResultItem[]>;
        getPersistentObject(id: string, objectId?: string): Promise<PersistentObject>;
        getNewPersistentObject(query: ReadOnlyQuery): Promise<PersistentObject>;
        savePersistentObject(persistentObject: PersistentObject): Promise<PersistentObject>;
        saveChanges(): Promise<void>;
    }
    interface IndexedDBTransaction extends IIndexedDBContext {
        clear<K extends keyof StoreNameMap>(storeName: K): Promise<void>;
        exists<K extends keyof StoreNameMap>(storeName: K, key: string | string[]): Promise<boolean>;
        save<K extends keyof StoreNameMap, I extends keyof RequestsStoreNameMap>(store: "Requests", entry: RequestsStoreNameMap[I]): Promise<void>;
        save<K extends keyof StoreNameMap>(store: K, entry: StoreNameMap[K]): Promise<void>;
        saveAll<K extends keyof StoreNameMap>(storeName: K, entries: StoreNameMap[K][]): Promise<void>;
        add<K extends keyof StoreNameMap>(storeName: K, entry: StoreNameMap[K]): Promise<void>;
        addAll<K extends keyof StoreNameMap>(storeName: K, entries: StoreNameMap[K][]): Promise<void>;
        load<K extends keyof StoreNameMap, I extends keyof RequestsStoreNameMap>(store: "Requests", key: I): Promise<RequestsStoreNameMap[I]>;
        load<K extends keyof StoreNameMap>(store: K, key: string | string[]): Promise<StoreNameMap[K]>;
        loadAll<K extends keyof StoreNameMap>(storeName: K, indexName?: string, key?: any): Promise<StoreNameMap[K][]>;
        deleteAll<K extends keyof StoreNameMap>(storeName: K, condition: (item: StoreNameMap[K]) => boolean): Promise<number>;
        deleteAll<K extends keyof StoreNameMap>(storeName: K, index: string, indexKey: IDBValidKey, condition: (item: StoreNameMap[K]) => boolean): Promise<number>;
    }
    export class IndexedDB {
        private _initializing;
        private _db;
        constructor();
        get db(): idb.DB;
        createContext(): Promise<IndexedDBTransaction>;
        createContext(): Promise<IIndexedDBContext>;
        saveOffline(offline: Service.PersistentObject): Promise<void>;
        private _saveOfflineQueries;
        getActionClass(name: string): Promise<StoreActionClassById>;
        getRequest<K extends keyof RequestsStoreNameMap>(id: K): Promise<RequestsStoreNameMap[K]>;
    }
    export {};
}
declare namespace Vidyano {
    const version = "latest";
    type Fetcher<TPayload, TResult> = (payload?: TPayload) => Promise<TResult>;
    class ServiceWorker {
        private serviceUri?;
        private _verbose?;
        private _db;
        private _cacheName;
        private _clientData;
        private _application;
        constructor(serviceUri?: string, _verbose?: boolean);
        get db(): IndexedDB;
        get clientData(): Service.ClientData;
        get application(): Application;
        private get authToken();
        private set authToken(value);
        private _log;
        private _onInstall;
        private _onActivate;
        private _onFetch;
        private _createFetcher;
        private _send;
        private _getOffline;
        protected onGetClientData(): Promise<Service.ClientData>;
        protected onCacheClientData(clientData: Service.ClientData): Promise<void>;
        protected onCacheApplication(application: Service.ApplicationResponse): Promise<void>;
        protected onGetApplication(): Promise<Service.ApplicationResponse>;
        protected createRequest(data: any, request: Request): Request;
        protected createResponse(data: any, response?: Response): Response;
    }
}
declare namespace Vidyano {
    class ServiceWorkerActions {
        private static _types;
        static get<T>(name: string, db: IndexedDB): Promise<ServiceWorkerActions>;
        private _context;
        get context(): IIndexedDBContext;
        onGetPersistentObject(parent: ReadOnlyPersistentObject, id: string, objectId?: string, isNew?: boolean): Promise<PersistentObject>;
        onGetQuery(id: string): Promise<Query>;
        onExecuteQuery(query: ReadOnlyQuery, parent: ReadOnlyPersistentObject): Promise<QueryResult>;
        onTextSearch(textSearch: string, result: QueryResult): QueryResultItem[];
        onSortQueryResult(result: QueryResult): QueryResultItem[];
        onDataTypeCompare(value1: any, value2?: any, datatype?: string): number;
        protected onFilter(query: Service.Query): QueryResultItem[];
        onExecuteQueryAction(action: string, query: ReadOnlyQuery, selectedItems: QueryResultItem[], parameters: Service.ExecuteActionParameters, parent?: ReadOnlyPersistentObject): Promise<PersistentObject>;
        onExecutePersistentObjectAction(action: string, persistentObject: PersistentObject, parameters: Service.ExecuteActionParameters): Promise<PersistentObject>;
        onNew(query: ReadOnlyQuery): Promise<PersistentObject>;
        onRefresh(persistentObject: PersistentObject, parameters: Service.ExecuteActionRefreshParameters): Promise<PersistentObject>;
        onDelete(query: ReadOnlyQuery, selectedItems: QueryResultItem[]): Promise<void>;
        onCascadeDelete(item: Vidyano.QueryResultItem, query: Vidyano.ReadOnlyQuery, relatedItem: Vidyano.QueryResultItem, relatedQuery: Vidyano.ReadOnlyQuery): Promise<boolean>;
        onSave(obj: PersistentObject): Promise<PersistentObject>;
        saveNew(newObj: PersistentObject): Promise<PersistentObject>;
        saveExisting(obj: PersistentObject): Promise<PersistentObject>;
    }
}
declare namespace Vidyano {
    const vidyanoFiles: string[];
}
declare namespace Vidyano {
    class Application {
        private _serviceWorker;
        private _application;
        readonly userLanguage: string;
        readonly userName: string;
        readonly hasSensitive: boolean;
        constructor(_serviceWorker: ServiceWorker, response: Service.ApplicationResponse);
        getTranslatedMessage(key: string, ...params: string[]): string;
    }
}
declare namespace Vidyano {
    namespace Wrappers {
        type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
        type Overwrite<T, U> = Omit<T, Extract<keyof T, keyof U>> & U;
        type Wrap<ServiceType, Writable extends keyof ServiceType, WrapperType> = Overwrite<Readonly<Omit<ServiceType, Writable>> & Pick<ServiceType, Writable>, WrapperType> & WrapperType;
        abstract class Wrapper<T> {
            private __wrappedProperties__;
            protected _unwrap(writableProperties?: string[], ...children: string[]): T;
            static _wrap<T, U>(object: U, ...args: any[]): T;
            static _wrap<T, U>(objects: U[], ...args: any[]): T[];
        }
    }
}
declare namespace Vidyano {
    const PersistentObjectAttributeWritableProperties: ("label" | "offset" | "group" | "isValueChanged" | "tab" | "visibility")[];
    export type PersistentObjectAttribute = Wrappers.Wrap<Service.PersistentObjectAttribute, typeof PersistentObjectAttributeWritableProperties[number], Wrappers.PersistentObjectAttributeWrapper>;
    export type ReadOnlyPersistentObjectAttribute = Readonly<PersistentObjectAttribute>;
    const PersistentObjectAttributeWithReferenceWritableProperties: ("label" | "offset" | "group" | "isValueChanged" | "tab" | "visibility")[];
    export type PersistentObjectAttributeWithReference = Wrappers.Wrap<Service.PersistentObjectAttributeWithReference, typeof PersistentObjectAttributeWithReferenceWritableProperties[number], Wrappers.PersistentObjectAttributeWithReferenceWrapper>;
    export type ReadOnlyPersistentObjectAttributeWithReference = Readonly<PersistentObjectAttributeWithReference>;
    export namespace Wrappers {
        class PersistentObjectAttributeWrapper extends Wrapper<Service.PersistentObjectAttribute> {
            private _attr;
            private _value;
            protected constructor(_attr: Service.PersistentObjectAttribute);
            get value(): any;
            set value(value: any);
            get isReadOnly(): boolean;
            set isReadOnly(readOnly: boolean);
            get isReference(): boolean;
            protected _unwrap(writableProperties?: string[], ...children: string[]): Service.PersistentObjectAttribute;
            static _unwrap(obj: PersistentObjectAttribute): Service.PersistentObjectAttribute;
        }
        class PersistentObjectAttributeWithReferenceWrapper extends PersistentObjectAttributeWrapper {
            private _attrWithReference;
            private constructor();
            get objectId(): string;
            set objectId(objectId: string);
            get isReference(): boolean;
            protected _unwrap(): Service.PersistentObjectAttributeWithReference;
            static _unwrap(obj: PersistentObjectAttributeWithReference): Service.PersistentObjectAttributeWithReference;
        }
    }
    export {};
}
declare namespace Vidyano {
    const PersistentObjectWritableProperties: ("label" | "notification" | "notificationType" | "notificationDuration" | "actions" | "breadcrumb" | "isNew" | "stateBehavior")[];
    export type PersistentObject = Wrappers.Wrap<Service.PersistentObject, typeof PersistentObjectWritableProperties[number], Wrappers.PersistentObjectWrapper>;
    export type ReadOnlyPersistentObject = Readonly<PersistentObject>;
    export namespace Wrappers {
        class PersistentObjectWrapper extends Wrapper<Service.PersistentObject> {
            private _obj;
            private _db;
            private readonly _attributes;
            private readonly _queries;
            private constructor();
            get queries(): ReadOnlyQuery[];
            getQuery(name: string): ReadOnlyQuery;
            get attributes(): PersistentObjectAttribute[];
            getAttribute(name: string): PersistentObjectAttribute;
            protected _unwrap(): Service.PersistentObject;
            static _unwrap(obj: PersistentObject): Service.PersistentObject;
        }
    }
    export {};
}
declare namespace Vidyano {
    const QueryColumnWritableProperties: ("label" | "canSort" | "offset")[];
    export type QueryColumn = Wrappers.Wrap<Service.QueryColumn, typeof QueryColumnWritableProperties[number], Wrappers.QueryColumnWrapper>;
    export type ReadOnlyQueryColumn = Readonly<QueryColumn>;
    export namespace Wrappers {
        class QueryColumnWrapper extends Wrapper<Service.QueryColumn> {
            private _column;
            private constructor();
            static _unwrap(obj: QueryColumn): Service.QueryColumn;
        }
    }
    export {};
}
declare namespace Vidyano {
    type QueryResultItemValue = Readonly<Service.QueryResultItemValue> & Wrappers.QueryResultItemValueWrapper;
    namespace Wrappers {
        class QueryResultItemValueWrapper extends Wrapper<Service.QueryResultItemValue> {
            private _value;
            private constructor();
            static _unwrap(obj: QueryResultItemValue): Service.QueryResultItemValue;
        }
    }
}
declare namespace Vidyano {
    type QueryResultItem = Wrappers.Wrap<Service.QueryResultItem, never, Wrappers.QueryResultItemWrapper>;
    type ReadOnlyQueryResultItem = Readonly<QueryResultItem>;
    namespace Wrappers {
        class QueryResultItemWrapper extends Wrapper<Service.QueryResultItem> {
            private _item;
            private readonly _values;
            private constructor();
            get values(): QueryResultItemValue[];
            getValue(key: string): QueryResultItemValue;
            protected _unwrap(): Service.QueryResultItem;
            static _unwrap(obj: QueryResultItem): Service.QueryResultItem;
        }
    }
}
declare namespace Vidyano {
    const QueryResultWritableProperties: ("notification" | "notificationType" | "notificationDuration" | "sortOptions")[];
    export type QueryResult = Wrappers.Wrap<Service.QueryResult, typeof QueryResultWritableProperties[number], Wrappers.QueryResultWrapper>;
    export type ReadOnlyQueryResult = Readonly<QueryResult>;
    export namespace Wrappers {
        class QueryResultWrapper extends Wrapper<Service.QueryResult> {
            private _result;
            private _columns;
            private _items;
            private constructor();
            get columns(): QueryColumn[];
            set columns(columns: QueryColumn[]);
            getColumn(name: string): QueryColumn;
            get items(): QueryResultItem[];
            set items(items: QueryResultItem[]);
            getItem(id: string): QueryResultItem;
            static fromQuery(query: Query | ReadOnlyQuery): QueryResult;
            protected _unwrap(): Service.QueryResult;
            static _unwrap(obj: QueryResult): Service.QueryResult;
        }
    }
    export {};
}
declare namespace Vidyano {
    const QueryWritableProperties: ("actionLabels" | "allowTextSearch" | "label" | "enableSelectAll" | "notification" | "notificationType" | "notificationDuration" | "sortOptions" | "textSearch")[];
    export type Query = Wrappers.Wrap<Service.Query, typeof QueryWritableProperties[number], Wrappers.QueryWrapper>;
    export type ReadOnlyQuery = Readonly<Query>;
    export namespace Wrappers {
        class QueryWrapper extends Wrapper<Service.Query> {
            private _query;
            private _transaction;
            private readonly _columns;
            private readonly _persistentObject;
            private _result;
            private constructor();
            get columns(): QueryColumn[];
            get persistentObject(): ReadOnlyPersistentObject;
            get result(): QueryResult;
            protected _unwrap(): Service.Query;
            static _unwrap(obj: Query): Service.Query;
        }
    }
    export {};
}
