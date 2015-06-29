module Vidyano.WebComponents {
    var resources: { [name: string]: Resource } = {};

    export class Resource extends WebComponent {
        private _loadedSource: string;
        name: string;
        source: string;
        if: boolean;
        icon: boolean;
        model: any;

        attached() {
            super.attached();

            this._load();
        }

        private _nameChanged() {
            if (this.name)
                resources[this.name.toUpperCase()] = this;
            else
                delete resources[this.name.toUpperCase()];
        }

        private _setIcon(value: boolean) { }
        private _setHasResource(value: boolean) { }

        private _load() {
            if (this.isAttached && this.source) {
                if (this.source == this._loadedSource)
                    return;

                this.empty();

                var resource = Resource.LoadResource(this.source);
                if (resource)
                    Polymer.dom(this).appendChild(Resource.Load(resource));

                this.icon = resource != null ? resource.icon : false;
                this._setHasResource(resource != null);
                this._loadedSource = this.source;
            }
        }

        static Load(source: string | Resource): DocumentFragment {
            var resource = (typeof source === "string") ? resources[source.toUpperCase()] : source;

            var copy = document.createDocumentFragment();
            Enumerable.from(Polymer.dom(resource).children).forEach((child: HTMLElement) => {
                copy.appendChild(child.cloneNode(true));
            });

            return copy;
        }

        static LoadResource(source: string): Resource {
            return resources[source.toUpperCase()];
        }

        static Exists(name: string): boolean {
            return resources[name.toUpperCase()] != undefined;
        }
    }

    WebComponent.register(Resource, WebComponents, "vi", {
        properties: {
            name: {
                type: String,
                observer: "_nameChanged"
            },
            model: {
                type: Object,
                observer: "_load"
            },
            source: {
                type: String,
                reflectToAttribute: true,
                observer: "_load"
            },
            hasResource: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            icon: {
                type: Boolean,
                reflectToAttribute: true
            },
        }
    });
}