namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            key: String,
            value: String
        }
    })
    export class AppSetting extends WebComponent {
        key: string;
        value: string;
    }
}