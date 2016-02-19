module Vidyano.WebComponents {
    @TemplateConfig.register({
        properties: {
            name: String,
            type: String,
            objectId: String
        }
    })
    export class PersistentObjectTabConfig extends TemplateConfig<Vidyano.PersistentObjectTab> {
        name: string;
        type: string;
        objectId: string;
    }
}