namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            name: String
        }
    })
    export class ProgramUnitConfig extends TemplateConfig<Vidyano.ProgramUnit> {
        name: string;
    }
}