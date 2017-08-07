namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            key: String,
            value: String,
            slot: {
                type: String,
                reflectToAttribute: true,
                value: "vi-setting"
            }
        }
    })
    export class AppSetting extends WebComponent {
        key: string;
        value: string;
    }
}