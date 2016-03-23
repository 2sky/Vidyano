namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            key: String,
            value: String
        }
    })
    export class ConfigSetting extends WebComponent {
        key: string;
        value: string;
    }
}