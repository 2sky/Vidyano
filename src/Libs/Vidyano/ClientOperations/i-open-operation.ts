namespace Vidyano {
    "use strict";

    export namespace ClientOperations {
        export interface IOpenOperation extends IClientOperation {
            persistentObject: any;
            replace?: boolean;
        }
    }
}