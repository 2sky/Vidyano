namespace Vidyano {
    export namespace ClientOperations {
        export interface IRefreshOperation extends IClientOperation {
            delay?: number;
            queryId?: string;
            fullTypeName?: string;
            objectId?: string;
        }
    }
}