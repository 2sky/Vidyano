namespace Vidyano {
    export namespace Actions {
        export class ShowHelp extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
            }

            protected async _onExecute({ menuOption, parameters, selectedItems, skipOpen, noConfirmation, throwExceptions }: IActionExecuteOptions): Promise<PersistentObject> {
                const owner = this.query ? this.query.persistentObject : this.parent;
                const helpWindow = window.open();

                try {
                    const po = await this.service.executeAction("PersistentObject.ShowHelp", owner, null, null);

                    if (po != null) {
                        if (po.fullTypeName === "Vidyano.RegisteredStream" || po.getAttributeValue("Type") === "0") {
                            helpWindow.close();
                            this.service._getStream(po);
                        } else {
                            helpWindow.location.href = po.getAttributeValue("Document");
                            helpWindow.focus();
                        }
                    }
                    else
                        helpWindow.close();
                }
                catch (e) {
                    helpWindow.close();
                    this.owner.setNotification(e);
                }

                return null;
            }
        }
    }
}