﻿namespace Vidyano {
    export namespace Actions {
        /* tslint:disable:class-name */
        export class viConfigureQuery extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions) {
                super(service, definition, owner);

                this.isVisible = false;
            }
        }
        /* tslint:enable:class-name */
    }
}