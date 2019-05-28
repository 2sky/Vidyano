namespace Vidyano {
    "use strict";

    export namespace Actions {
        export class Save extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.dependentActions = ["CancelSave"];
                this.canExecute = this.parent.isDirty || this.parent.isNew;
            }

            _onParentIsDirtyChanged(isDirty: boolean) {
                this.canExecute = isDirty;
            }

            protected async _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
                const wasNew = this.parent.isNew;

                await this.parent.save();

                // NOTE: Check if operations will open a new persistent object anyway
                if (this.service.queuedClientOperations.length > 0 &&
                    this.service.queuedClientOperations.some(o => {
                        if (o.type === "Open") {
                            (<ClientOperations.IOpenOperation>o).replace = true;
                            return true;
                        }
                        else if (o.type === "ExecuteMethod") {
                            const eo = <ClientOperations.IExecuteMethodOperation>o;
                            if (eo.name === "navigate") {
                                eo.arguments[1] = true;
                                return true;
                            }
                        }

                        return false;
                    })
                )
                    return this.parent;

                if (StringEx.isNullOrWhiteSpace(this.parent.notification) || this.parent.notificationType !== "Error") {
                    if (wasNew && this.parent.ownerAttributeWithReference == null && this.parent.stateBehavior.indexOf("OpenAfterNew") !== -1) {
                        const newPO = await this.parent.queueWork(() => this.service.getPersistentObject(this.parent.parent, this.parent.id, this.parent.objectId));
                        newPO.ownerQuery = this.parent.ownerQuery;
                        this.service.hooks.onOpen(newPO, true);
                    }
                    else
                        this.service.hooks.onClose(this.parent);
                }

                return this.parent;
            }
        }
    }
}