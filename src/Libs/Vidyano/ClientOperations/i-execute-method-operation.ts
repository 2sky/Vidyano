namespace Vidyano {
    export namespace ClientOperations {
        export interface IExecuteMethodOperation extends IClientOperation {
            name: string;
            arguments: any[];
        }
    }
}