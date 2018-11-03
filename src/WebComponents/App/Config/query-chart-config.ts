namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            type: String
        }
    })
    export class QueryChartConfig extends TemplateConfig<Vidyano.QueryChart> {
        type: string;
    }
}