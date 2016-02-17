module Vidyano.WebComponents {
    @TemplateConfig.register({
        properties: {
            id: {
                type: String,
                reflectToAttribute: true
            },
            objectId: {
                type: String,
                reflectToAttribute: true
            },
            as: {
                type: String,
                reflectToAttribute: true
            }
        }
    })
    export class PersistentObjectConfig extends TemplateConfig {
        id: string;
        objectId: string;
        as: string;
        asModel: (po: Vidyano.PersistentObject) => any;
    }
}