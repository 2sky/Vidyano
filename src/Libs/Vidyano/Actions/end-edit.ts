namespace Vidyano {
    "use strict";

    export namespace Actions {
        export class EndEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = this.parent.isDirty;
            }

            _onParentIsEditingChanged(isEditing: boolean) {
                this.isVisible = isEditing;
            }

            _onParentIsDirtyChanged(isDirty: boolean) {
                this.canExecute = isDirty;
            }

            protected async _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
                await this.parent.save();
                if (StringEx.isNullOrWhiteSpace(this.parent.notification) || this.parent.notificationType !== "Error") {
                    const edit = this.parent.actions["Edit"];
                    const endEdit = this.parent.actions["EndEdit"];

                    if (this.parent.stateBehavior.indexOf("StayInEdit") !== -1 && endEdit != null) {
                        endEdit.canExecute = false;
                    } else if (edit) {
                        edit.isVisible = true;
                        if (endEdit != null)
                            endEdit.isVisible = false;
                    }
                }

                return this.parent;
            }
        }
    }
}