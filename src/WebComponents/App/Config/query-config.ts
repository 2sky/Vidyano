namespace Vidyano.WebComponents {
    "use strict";

    @TemplateConfig.register({
        properties: {
            name: String,
            id: String,
            defaultChart: String,
            fileDropAttribute: String
        }
    })
    export class QueryConfig extends TemplateConfig<Vidyano.Query> {
        name: string;
        id: string;
        defaultChart: string;
        fileDropAttribute: string;
    }
}