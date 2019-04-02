namespace Vidyano {
    export namespace Actions {
        export class CancelSave extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
            }

            protected _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
                this.service.hooks.onClose(this.parent);
                return Promise.resolve(null);
            }
        }
    }
}