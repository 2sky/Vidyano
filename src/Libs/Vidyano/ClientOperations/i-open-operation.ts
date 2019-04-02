namespace Vidyano {
    export namespace ClientOperations {
        export interface IOpenOperation extends IClientOperation {
            persistentObject: any;
            replace?: boolean;
        }
    }
}