// Contains the interfaces that define the service communication objects

namespace Vidyano.Service {
    export type KeyValue<T> = { [key: string]: T; };
    export type KeyValueString = KeyValue<string>;
    export type NotificationType = "" | "OK" | "Notice" | "Warning" | "Error";
    export type SortDirection = "" | "ASC" | "DESC";

    export type Request = {
        userName?: string;
        authToken?: string;
        clientVersion?: string;
        environment: "Web" | "Web,ServiceWorker";
        environmentVersion: string;
    };

    export type Response = {
        authToken?: string;
        exception?: string;
    };

    export type GetApplicationRequest = {
        password?: string;
    } & Request;

    export type GetQueryRequest = {
        id: string;
    } & Request;

    export type GetQueryResponse = {
        query: Query;
    } & Response;

    export type GetPersistentObjectRequest = {
        persistentObjectTypeId: string;
        objectId?: string;
        isNew?: boolean;
        parent?: PersistentObject;
    } & Request;

    export type GetPersistentObjectResponse = {
        result: PersistentObject;
    } & Response;

    export type ExecuteActionParameters = { [key: string]: string; }

    export type ExecuteActionRequest = {
        action: string;
        parameters: ExecuteActionParameters;
    } & Request;

    export type ExecuteActionRefreshParameters = {
// ReSharper disable once InconsistentNaming
        RefreshedPersistentObjectAttributeId: string;
    } & ExecuteActionParameters;

    export type ExecuteQueryActionRequest = {
        parent: PersistentObject;
        query: Query;
        selectedItems: QueryResultItem[];
    } & ExecuteActionRequest;

    export type ExecuteQueryFilterActionRequest = {
        query: Query;
    } & ExecuteActionRequest;

    export type ExecutePersistentObjectActionRequest = {
        parent: PersistentObject;
    } & ExecuteActionRequest;

    export type ExecuteActionResponse = {
        result: PersistentObject;
    } & Response;

    export type ExecuteQueryRequest = {
        query: Query;
        parent: PersistentObject;
    } & Request;

    export type ExecuteQueryResponse = {
        result: QueryResult;
    } & Response;

    export type ProviderParameters = {
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

    export type ClientData = {
        defaultUser: string;
        exception: string;
        languages: Languages;
        providers: { [name: string]: { parameters: ProviderParameters } };
        windowsAuthentication: boolean;
    };

    export type Languages = {
        [culture: string]: Language;
    };

    export type Language = {
        name: string;
        isDefault: boolean;
        messages: KeyValueString;
    };

    export type ApplicationResponse = {
        application: PersistentObject;
        userCultureInfo: string;
        userLanguage: string;
        userName: string;
        hasSensitive: boolean;
    } & Response;

    export type PersistentObject = {
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

    export type PersistentObjectAttribute = {
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

    export type PersistentObjectAttributeWithReference = {
        displayAttribute: string;
        lookup: Query;
        objectId: string;
    } & PersistentObjectAttribute;

    export type PersistentObjectTab = {
        columnCount: number;
        id: string;
        name: string;
    };

    export type Query = {
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

    export type QueryColumn = {
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

    export type QueryResult = {
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

    export type QueryResultItem = {
        id: string;
        values: QueryResultItemValue[];
        typeHints?: KeyValueString;
    };

    export type QueryResultItemValue = {
        key: string;
        value: string;
        objectId?: string;
        typeHints?: KeyValueString;
    };

    export type QueryGroupingInfo = {
        groupedBy: string;
        groups?: QueryResultItemGroup[];
    }

    export type QueryResultItemGroup = {
        name: string;
        count: number;
    };

    export type QueryChart = {
        label: string;
        name: string;
        type: string;
        options: any;
    };

    export type RetryAction = {
        cancelOption?: number;
        defaultOption?: number;
        message: string;
        options: string[];
        persistentObject?: PersistentObject;
        title: string;
    };

    export type ProfilerRequest = {
        method: string;
        profiler: Profiler;
        request: any;
        response: any;
        transport: number;
        when: Date;
    };

    export type Profiler = {
        elapsedMilliseconds: number;
        entries: ProfilerEntry[];
        exceptions: {
            id: string;
            message: string;
        }[];
        sql: ProfilerSql[];
        taskId: number;
    }

    export type ProfilerEntry = {
        arguments: any[];
        elapsedMilliseconds: number;
        entries: ProfilerEntry[];
        exception: string;
        hasNPlusOne?: boolean;
        methodName: string;
        sql: string[];
        started: number;
    };

    export type ProfilerSql = {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        parameters: ProfilerSqlParameter[];
        recordsAffected: number;
        taskId: number;
        type: string;
    };

    export type ProfilerSqlParameter = {
        name: string;
        type: string;
        value: string;
    };
}