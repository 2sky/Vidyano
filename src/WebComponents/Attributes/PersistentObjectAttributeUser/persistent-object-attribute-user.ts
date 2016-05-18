namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            friendlyName: {
                type: String,
                computed: "_computeFriendlyName(attribute.options)"
            },
            canClear: {
                type: Boolean,
                computed: "_computeCanClear(attribute.isRequired, value)"
            },
            canBrowseReference: {
                type: Boolean,
                computed: "_computeCanBrowseReference(attribute.isReadOnly)",
            },
        }
    })
    export class PersistentObjectAttributeUser extends WebComponents.Attributes.PersistentObjectAttribute {
        private _browseReference() {
            this.app.service.getQuery(this.attribute.getTypeHint("IncludeGroups") === "True" ? "98b12f32-3f2d-4f54-b963-cb9206f74355" : "273a8302-ddc8-43db-a7f6-c3c28fc8f593").then(query => {
                query.maxSelectedItems = 1;

                this.app.showDialog(new SelectReferenceDialog(query)).then((result: QueryResultItem[]) => {
                    if (!result)
                        return;

                    this._setNewUser(result[0].id, result[0].getValue("FriendlyName") || result[0].breadcrumb);
                }).catch(() => { });
            });
        }

        private _clearReference() {
            this._setNewUser(null, null);
        }

        private _setNewUser(id: string, name: string) {
            this.value = id;
            this.notifyPath("attribute.options", this.attribute.options[0] = name);
        }

        private _computeFriendlyName(options: string[]): string {
            return options && options.length > 0 ? options[0] : "";
        }

        private _computeCanClear(isRequired: boolean, value: string): boolean {
            return !isRequired && !StringEx.isNullOrEmpty(value);
        }

        private _computeCanBrowseReference(isReadOnly: boolean): boolean {
            return !isReadOnly;
        }
    }
}