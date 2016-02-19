module Vidyano.WebComponents {
    @TemplateConfig.register({
        properties: {
            name: String,
            id: String,
            defaultChart: String
        }
    })
    export class QueryConfig extends TemplateConfig<Vidyano.Query> {
        name: string;
        id: string;
        defaultChart: string;
    }
}