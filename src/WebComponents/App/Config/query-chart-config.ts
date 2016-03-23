namespace Vidyano.WebComponents {
    "use strict";

    @TemplateConfig.register({
        properties: {
            type: String
        }
    })
    export class QueryChartConfig extends TemplateConfig<Vidyano.QueryChart> {
        type: string;
    }
}