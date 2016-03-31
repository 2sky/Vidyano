namespace Vidyano.WebComponents {
    "use strict";

    @TemplateConfig.register({
        properties: {
            id: String,
            name: String,
            type: String,
            objectId: String
        }
    })
    export class PersistentObjectTabConfig extends TemplateConfig<Vidyano.PersistentObjectTab> {
        id: string;
        name: string;
        type: string;
        objectId: string;
    }
}