namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            scroll: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            serviceUri: {
                type: String,
                value: ""
            },
            serviceHooks: {
                type: String,
                value: "Vidyano.WebComponents.WebsiteAppServiceHooks"
            },
            cookiePrefix: {
                type: String,
                reflectToAttribute: true,
                observer: "_cookiePrefixChanged"
            }
        }
    })
    export class Website extends WebComponent {
        serviceUri: string;
        serviceHooks: string;
        cookiePrefix: string;

        attached() {
            super.attached();

            if (this.app)
                return;

            const template = Polymer.dom(this).querySelector("template[is='dom-template']");
            if (!template) {
                console.error("Website requires a valid template.");
                return;
            }

            const config = new Vidyano.WebComponents.PersistentObjectConfig();
            config.id = "3256a3ad-3035-44ec-b3dd-7c9bdd14a3a7";
            config.as = "website";
            config.asModel = po => {
                const model = {
                    label: po.attributes["Label"].displayValue,
                    pages: po.queries["Website_Pages"].items.map(i => new WebsitePageModel(i))
                };

                model.pages.forEach(p => model.pages[p.name] = p);
                return model;
            };

            // NOTE: Hack to initialize app under website
            this["_app"] = new Vidyano.WebComponents.App();
            this.isConnected = !(this.isConnected = !this.isConnected);

            this.app.uri = this.serviceUri;
            this.app.noMenu = true;
            this.app.noHistory = true;
            this.app.path = `PersistentObject.${config.id}`;
            this.app.hooks = this.serviceHooks;

            Polymer.dom(config).appendChild(template);
            Polymer.dom(this.app).appendChild(config);
            Polymer.dom(this).appendChild(this.app);
        }

        private _cookiePrefixChanged(cookiePrefix: string) {
            Vidyano.cookiePrefix = cookiePrefix;
        }
    }

    export class WebsiteAppServiceHooks extends AppServiceHooks {
        createData(data: any) {
            data.isMobile = false;
        }
    }

    export class WebsitePageModel {
        private _name: string;
        private _label: string;
        private _content: string;

        constructor(page: Vidyano.QueryResultItem) {
            this._name = page.values["Name"];
            this._label = page.values["Label"];
            this._content = page.values["Content"];
        }

        get name(): string {
            return this._name;
        }

        get label(): string {
            return this._label;
        }

        get content(): string {
            return this._content;
        }
    }
}