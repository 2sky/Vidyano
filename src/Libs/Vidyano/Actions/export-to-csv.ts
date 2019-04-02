namespace Vidyano {
    export namespace Actions {
        export class ExportToCsv extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
            }

            protected _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
                this.service._getStream(null, "Query.ExportToCsv", this.parent, this.query, null, this._getParameters(parameters, menuOption));
                return Promise.resolve(null);
            }
        }
    }
}