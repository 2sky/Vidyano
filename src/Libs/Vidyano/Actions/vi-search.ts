namespace Vidyano {
    export namespace Actions {
        /* tslint:disable:class-name */
        export class viSearch extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);

                this.isVisible = this.parent == null || this.parent.fullTypeName === "Vidyano.Search";

                if (this.parent != null && this.parent.fullTypeName === "Vidyano.Search")
                    this._isPinned = false;
            }
        }
        /* tslint:enable:class-name */
    }
}