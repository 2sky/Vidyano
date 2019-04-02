namespace Vidyano.WebComponents.Attributes {

    @WebComponent.register({
        properties: {
            friendlyName: {
                type: String,
                computed: "_computeFriendlyName(attribute.options)"
            },
            canClear: {
                type: Boolean,
                computed: "_computeCanClear(readOnly, attribute.isRequired, value)"
            },
            canBrowseReference: {
                type: Boolean,
                computed: "_computeCanBrowseReference(readOnly)",
            },
        }
    })
    export class PersistentObjectAttributeUser extends WebComponents.Attributes.PersistentObjectAttribute {
        private _browsing: boolean;

        private async _browseReference() {
            const query = await this.attribute.parent.queueWork(() => this.attribute.service.getQuery(this.attribute.getTypeHint("IncludeGroups") === "True" ? "98b12f32-3f2d-4f54-b963-cb9206f74355" : "273a8302-ddc8-43db-a7f6-c3c28fc8f593"));
            query.maxSelectedItems = 1;

            const result = <QueryResultItem[]>await this.app.showDialog(new SelectReferenceDialog(query));
            if (!result)
                return;

            this._setNewUser(result[0].id, result[0].getValue("FriendlyName") || result[0].getValue("Name"));
        }

        private _clearReference() {
            this._setNewUser(null, null);
        }

        private _setNewUser(id: string, name: string) {
            this.notifyPath("attribute.options", this.attribute.options = [name]);
            this.attribute.setValue(id, true);
        }

        private _computeFriendlyName(options: string[]): string {
            return options && options.length > 0 ? options[0] || "\u2014" : "\u2014";
        }

        private _computeCanClear(readOnly: boolean, isRequired: boolean, value: string): boolean {
            return !readOnly && !isRequired && !StringEx.isNullOrEmpty(value);
        }

        private _computeCanBrowseReference(readOnly: boolean): boolean {
            return !readOnly;
        }
    }
}