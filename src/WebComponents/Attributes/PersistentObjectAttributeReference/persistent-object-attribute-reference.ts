namespace Vidyano.WebComponents.Attributes {
    "use strict";

    @PersistentObjectAttribute.register({
        properties: {
            href: String,
            canClear: {
                type: Boolean,
                readOnly: true
            },
            canAddNewReference: {
                type: Boolean,
                readOnly: true
            },
            canBrowseReference: {
                type: Boolean,
                readOnly: true
            },
            filter: {
                type: String,
                notify: true
            },
            objectId: {
                type: String,
                observer: "_objectIdChanged",
                value: null
            },
            selectInPlace: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "attribute.selectInPlace"
            },
            selectInPlaceAsRadio: {
                type: Boolean,
                computed: "_computeSelectInPlaceAsRadio(attribute, sensitive)"
            },
            orientation: {
                type: String,
                computed: "_computeOrientation(attribute)"
            },
            target: {
                type: String,
                computed: "_computeTarget(attribute, href)"
            }
        },
        observers: [
            "_update(attribute.isReadOnly, sensitive, isAttached)"
        ]
    })
    export class PersistentObjectAttributeReference extends WebComponents.Attributes.PersistentObjectAttribute {
        readonly canClear: boolean; private _setCanClear: (val: boolean) => void;
        readonly canAddNewReference: boolean; private _setCanAddNewReference: (val: boolean) => void;
        readonly canBrowseReference: boolean; private _setCanBrowseReference: (val: boolean) => void;
        objectId: string;
        attribute: Vidyano.PersistentObjectAttributeWithReference;
        href: string;
        filter: string;

        attached() {
            super.attached();
            this._update();
        }

        protected _attributeChanged() {
            super._attributeChanged();

            this._update();
        }

        protected _valueChanged(newValue: any) {
            this._update();

            if (this.attribute && newValue !== this.attribute.value) {
                this.attribute.setValue(newValue, true).catch(Vidyano.noop);
            }
        }

        private _objectIdChanged() {
            if (this.attribute && this.attribute.objectId !== this.objectId)
                this.attribute.changeReference(this.objectId ? [this.objectId] : []);
        }

        private async _filterBlur() {
            if (!this.attribute)
                return;

            if (!StringEx.isNullOrEmpty(this.filter) && this.filter !== this.attribute.value) {
                this.attribute.lookup.textSearch = "vi-breadcrumb:\"" + this.filter + "\"";
                const result = await this.attribute.lookup.search();
                this.attribute.lookup.textSearch = null;

                if (!result)
                    return;

                if (result.length === 1) {
                    await this.attribute.changeReference([result[0]]);
                    this._update();
                }
                else {
                    if (result.length === 0) {
                        this.filter = this.attribute.value;
                        this.attribute.lookup.textSearch = "";
                    }
                    else
                        this.attribute.lookup.textSearch = this.filter;

                    await this._browseReference(true, true);
                }
            }
            else
                this.filter = this.attribute.value;
        }

        protected _editingChanged() {
            this._update();
        }

        private _browse(e: TapEvent) {
            this.attribute.lookup.textSearch = "";
            this._browseReference(false, true);
        }

        private async _browseReference(throwExceptions?: boolean, forceSearch?: boolean): Promise<any> {
            this.attribute.lookup.selectedItems = [];

            try {
                const result = await this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(this.attribute.lookup, forceSearch, this.canAddNewReference));
                if (!result)
                    return;

                if (result instanceof Array && result.length > 0 && result[0] instanceof Vidyano.QueryResultItem) {
                    await this.attribute.changeReference(result);
                    this._update();
                }

                if (result === "AddNewReference")
                    this._addNewReference();
            }
            finally {
                this.filter = this.attribute.value;
            }
        }

        private _addNewReference(e?: Event) {
            this.attribute.addNewReference();
        }

        private async _clearReference(e: Event) {
            await this.attribute.changeReference([]);
            this._update();
        }

        private _update() {
            if (!this.isAttached)
                return;

            const hasReference = this.attribute instanceof Vidyano.PersistentObjectAttributeWithReference;

            if (hasReference && this.attribute.objectId !== this.objectId)
                this.objectId = this.attribute ? this.attribute.objectId : null;

            if (!this.app.barebone && hasReference && this.attribute.lookup && this.attribute.lookup.canRead && this.attribute.objectId && this.app && !this.app.noHistory)
                this.href = Vidyano.Path.routes.rootPath + this.app.getUrlForPersistentObject(this.attribute.lookup.persistentObject.id, this.attribute.objectId);
            else
                this.href = null;

            this.filter = hasReference ? this.attribute.value : "";

            this._setCanClear(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && !this.sensitive && !this.attribute.isRequired && !StringEx.isNullOrEmpty(this.attribute.objectId));
            this._setCanAddNewReference(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && !this.sensitive && this.attribute.canAddNewReference);
            this._setCanBrowseReference(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && !this.sensitive && !this.attribute.selectInPlace);
        }

        private _openSelect() {
            const selectInPlace = <Select>Polymer.dom(this.root).querySelector("#selectInPlace");
            selectInPlace.open();
        }

        private async _open(e: Event) {
            if (this.app.barebone || this.attribute.parent.isNew || !this.attribute.lookup.canRead)
                return;

            e.preventDefault();

            try {
                const po = await this.attribute.getPersistentObject();
                if (po)
                    this.attribute.service.hooks.onOpen(po, false, !!po.parent);
            }
            catch (e) {
                this.attribute.parent.setNotification(e, "Error");
            }
        }

        private _computeTarget(attribute: Vidyano.PersistentObjectAttribute, href: string): string {
            return attribute && href && attribute.parent.isNew ? "_blank" : "";
        }

        private _computeSelectInPlaceAsRadio(attribute: Vidyano.PersistentObjectAttributeWithReference, sensitive: boolean): boolean {
            return !sensitive && attribute && attribute.getTypeHint("inputtype", undefined, undefined, true) === "radio";
        }

        private _computeOrientation(attribute: Vidyano.PersistentObjectAttributeWithReference): string {
            return attribute && attribute.getTypeHint("orientation", "vertical", undefined, true);
        }

        private _computeCanOpenSelect(isReadOnly: boolean, options: string[]): boolean {
            return !isReadOnly && !!options && options.length > 0;
        }

        private _computeTitle(displayValue: string, sensitive: boolean): string {
            return !sensitive ? displayValue : "";
        }

        private _isRadioChecked(optionKey: string, objectId: string): boolean {
            return optionKey === objectId;
        }

        private _radioChanged(e: CustomEvent) {
            e.stopPropagation();

            this.objectId = (<any>e).model.option.key;
        }
    }
}