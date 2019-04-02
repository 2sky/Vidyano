namespace Vidyano {
    export namespace Actions {
        export class Edit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = !this.parent.isEditing;

                this.dependentActions = ["EndEdit", "CancelEdit"];
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = !isEditing;
            }

            protected _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
                this.parent.beginEdit();
                return Promise.resolve(null);
            }
        }
    }
}