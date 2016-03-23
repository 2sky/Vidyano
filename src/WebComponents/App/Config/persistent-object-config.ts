namespace Vidyano.WebComponents {
    "use strict";

    @TemplateConfig.register({
        properties: {
            id: {
                type: String,
                reflectToAttribute: true
            },
            objectId: {
                type: String,
                reflectToAttribute: true
            }
        }
    })
    export class PersistentObjectConfig extends TemplateConfig<Vidyano.PersistentObject> {
        id: string;
        objectId: string;
    }
}