module Vidyano.WebComponents {
    @TemplateConfig.register({
        properties: {
            name: String,
            id: String,
            defaultChart: String
        }
    })
    export class QueryConfig extends TemplateConfig {
        name: string;
        id: string;
        defaultChart: string;
    }
}