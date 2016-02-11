module Vidyano.WebComponents {
    @TemplateConfig.register({
        properties: {
            name: String,
            type: String,
            objectId: String
        }
    })
    export class PersistentObjectTabConfig extends TemplateConfig {
        name: string;
        type: string;
        objectId: string;
    }
}