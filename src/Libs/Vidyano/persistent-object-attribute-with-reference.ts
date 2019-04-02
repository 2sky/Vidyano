namespace Vidyano {
    export class PersistentObjectAttributeWithReference extends PersistentObjectAttribute {
        lookup: Query;
        objectId: string;
        displayAttribute: string;
        canAddNewReference: boolean;
        selectInPlace: boolean;

        constructor(service: Service, attr: any, public parent: PersistentObject) {
            super(service, attr, parent);

            if (attr.lookup)
                this.lookup = this.service.hooks.onConstructQuery(service, attr.lookup, parent, false, 1);
            else
                this.lookup = null;

            this.objectId = typeof attr.objectId === "undefined" ? null : attr.objectId;
            this.displayAttribute = attr.displayAttribute;
            this.canAddNewReference = !!attr.canAddNewReference;
            this.selectInPlace = !!attr.selectInPlace;

            this._setOptions(attr.options);
        }

        async addNewReference() {
            if (this.isReadOnly)
                return;

            try {
                const po = await this.service.executeAction("Query.New", this.parent, this.lookup, null, { PersistentObjectAttributeId: this.id });
                po.ownerAttributeWithReference = this;
                po.stateBehavior = (po.stateBehavior || "") + " OpenAsDialog";

                this.service.hooks.onOpen(po, false, true);
            }
            catch (e) {
                this.parent.setNotification(e);
            }
        }

        changeReference(selectedItems: QueryResultItem[] | string[]): Promise<boolean> {
            return this.parent.queueWork(async () => {
                if (this.isReadOnly)
                    throw "Attribute is read-only.";

                this.parent._prepareAttributesForRefresh(this);
                if (selectedItems.length && selectedItems.length > 0 && typeof selectedItems[0] === "string") {
                    const selectedObjectIds = <string[]>selectedItems;
                    selectedItems = selectedObjectIds.map(id => this.service.hooks.onConstructQueryResultItem(this.service, { id: id }, null));
                }

                const result = await this.service.executeAction("PersistentObject.SelectReference", this.parent, this.lookup, <QueryResultItem[]>selectedItems, { PersistentObjectAttributeId: this.id });
                if (result)
                    this.parent.refreshFromResult(result);

                return true;
            });
        }

        getPersistentObject(): Promise<Vidyano.PersistentObject> {
            if (!this.objectId)
                return Promise.resolve(null);

            return this.parent.queueWork(() => this.service.getPersistentObject(this.parent, this.lookup.persistentObject.id, this.objectId));
        }

        _refreshFromResult(resultAttr: PersistentObjectAttribute, resultWins: boolean): boolean {
            const resultAttrWithRef = <PersistentObjectAttributeWithReference>resultAttr;
            this.objectId = resultAttrWithRef.objectId;

            const visibilityChanged = super._refreshFromResult(resultAttr, resultWins);

            this.displayAttribute = resultAttrWithRef.displayAttribute;
            this.canAddNewReference = resultAttrWithRef.canAddNewReference;
            this.selectInPlace = resultAttrWithRef.selectInPlace;

            return visibilityChanged;
        }
    }
}