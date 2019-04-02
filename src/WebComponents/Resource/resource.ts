namespace Vidyano.WebComponents {
    const resources: Resource[] = [];

    export abstract class ResourceBase extends WebComponent {
        static Load(type: string, name: string): Resource {
            const resource = resources.find(r => r.type === type && r.name === name);
            if (resource)
                return resource;

            return resources.find(r => r.type === type && r.aliases.some(a => a === name));
        }

        static Exists(type: string, name: string): boolean {
            return !!this.Load(type, name);
        }
    }

    @WebComponent.register({
        properties: {
            type: {
                type: String,
                reflectToAttribute: true
            },
            name: {
                type: String,
                reflectToAttribute: true
            }
        }
    })
    export class Resource extends ResourceBase {
        private _aliases: string[] = [];
        type: string;
        name: string;

        connectedCallback() {
            super.connectedCallback();

            resources.push(this);
        }

        disconnectedCallback() {
            resources.remove(this);

            super.disconnectedCallback();
        }

        get aliases(): string[] {
            return this._aliases;
        }

        addAlias(...alias: string[]) {
            this._aliases.push(...alias);
        }
    }
}