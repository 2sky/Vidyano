module Vidyano.WebComponents {
    @TemplateConfig.register({
        properties: {
            type: String
        }
    })
    export class QueryChartConfig extends TemplateConfig {
        type: string;
    }
}