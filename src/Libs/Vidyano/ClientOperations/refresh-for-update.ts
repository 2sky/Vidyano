namespace Vidyano {
    "use strict";

    export namespace ClientOperations {
        export function refreshForUpdate(hooks: ServiceHooks, path: string, replaceCurrent?: boolean): void {
            hooks.onUpdateAvailable();
        }
    }
}