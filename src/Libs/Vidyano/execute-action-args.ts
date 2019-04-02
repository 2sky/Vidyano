namespace Vidyano {
    export class ExecuteActionArgs {
        private _action: string;

        action: string;
        isHandled: boolean = false;
        result: PersistentObject;

        constructor(private service: Service, action: string, public persistentObject: PersistentObject, public query: Query, public selectedItems: Array<QueryResultItem>, public parameters: any) {
            this._action = action;
            this.action = action.split(".")[1];
        }

        async executeServiceRequest(): Promise<PersistentObject> {
            this.result = await this.service.executeAction(this._action, this.persistentObject, this.query, this.selectedItems, this.parameters, true);
            this.isHandled = true;

            return this.result;
        }
    }
}