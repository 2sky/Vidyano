namespace Vidyano {
    export namespace Actions {
        export class CancelEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = this.parent.stateBehavior.indexOf("StayInEdit") < 0 || this.parent.isDirty;
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = isEditing;
            }

            _onParentIsDirtyChanged(isDirty: boolean) {
                this.canExecute = this.parent.stateBehavior.indexOf("StayInEdit") < 0 || isDirty;
            }

            protected _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
                this.parent.cancelEdit();
                return Promise.resolve(null);
            }
        }
    }
}