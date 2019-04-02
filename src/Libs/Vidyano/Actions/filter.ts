namespace Vidyano {
    export namespace Actions {
        export class Filter extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);
                this.isVisible = false;
            }
        }
    }
}