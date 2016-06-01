namespace Vidyano.WebComponents {
    "use strict";

    @TemplateConfig.register({
        properties: {
            name: {
                type: String,
                reflectToAttribute: true
            },
            id: {
                type: String,
                reflectToAttribute: true
            },
            type: {
                type: String,
                reflectToAttribute: true
            },
            defaultChart: {
                type: String,
                reflectToAttribute: true
            },
            fileDropAttribute: {
                type: String,
                reflectToAttribute: true
            },
            hideHeader: {
                type: Boolean,
                reflectToAttribute: true
            }
        }
    })
    export class QueryConfig extends TemplateConfig<Vidyano.Query> {
        name: string;
        id: string;
        type: string;
        defaultChart: string;
        fileDropAttribute: string;
        hideHeader: boolean;
    }
}