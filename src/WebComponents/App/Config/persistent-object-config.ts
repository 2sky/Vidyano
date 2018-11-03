namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            id: {
                type: String,
                reflectToAttribute: true
            },
            type: {
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
        type: string;
        objectId: string;
    }
}