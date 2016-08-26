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
                computed: "_computeSelectInPlaceAsRadio(attribute)"
            },
            target: {
                type: String,
                computed: "_computeTarget(attribute, href)"
            }
        },
        observers: [
            "_update(attribute.isReadOnly)"
        ]
    })
    export class PersistentObjectAttributeReference extends WebComponents.Attributes.PersistentObjectAttribute {
        private _browsing: boolean;
        objectId: string;
        attribute: Vidyano.PersistentObjectAttributeWithReference;
        href: string;
        filter: string;
        canAddNewReference: boolean;

        private _setCanClear: (val: boolean) => void;
        private _setCanAddNewReference: (val: boolean) => void;
        private _setCanBrowseReference: (val: boolean) => void;

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

        private _filterBlur() {
            if (!this.attribute)
                return;

            if (!StringEx.isNullOrEmpty(this.filter) && this.filter !== this.attribute.value) {
                this.attribute.lookup.textSearch = "vi-breadcrumb:\"" + this.filter + "\"";
                this.attribute.lookup.search().then(result => {
                    this.attribute.lookup.textSearch = null;

                    if (result.length === 1)
                        this.attribute.changeReference([result[0]]).then(() => this._update());
                    else {
                        if (result.length === 0) {
                            this.filter = this.attribute.value;
                            this.attribute.lookup.textSearch = "";
                        }
                        else
                            this.attribute.lookup.textSearch = this.filter;

                        this._browseReference(true, true);
                    }
                });
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

        private _browseReference(throwExceptions?: boolean, forceSearch?: boolean): Promise<any> {
            this.attribute.lookup.selectedItems = [];

            return this.app.showDialog(new Vidyano.WebComponents.SelectReferenceDialog(this.attribute.lookup, forceSearch, this.canAddNewReference)).then(result => {
                this._browseReferenceDone();

                if (!result) {
                    if (throwExceptions === true)
                        return Promise.reject("Nothing selected");

                    return Promise.resolve();
                }

                if (result instanceof Vidyano.QueryResultItem)
                    return this.attribute.changeReference(result).then(() => this._update());

                if (result === "AddNewReference")
                    this._addNewReference();
            }).catch(() => {
                this.filter = this.attribute.value;
                this._browseReferenceDone();
            });
        }

        private _browseReferenceDone() {
            this._browsing = false;
        }

        private _addNewReference(e?: Event) {
            this.attribute.addNewReference();
        }

        private _clearReference(e: Event) {
            this.attribute.changeReference([]).then(() => this._update());
        }

        private _update() {
            const hasReference = this.attribute instanceof Vidyano.PersistentObjectAttributeWithReference;

            if (hasReference && this.attribute.objectId !== this.objectId)
                this.objectId = this.attribute ? this.attribute.objectId : null;

            if (hasReference && this.attribute.lookup && this.attribute.lookup.canRead && this.attribute.objectId && this.app && !this.app.noHistory)
                this.href = "#!/" + this.app.getUrlForPersistentObject(this.attribute.lookup.persistentObject.id, this.attribute.objectId);
            else
                this.href = null;

            this.filter = hasReference ? this.attribute.value : "";

            this._setCanClear(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && !this.attribute.isRequired && !StringEx.isNullOrEmpty(this.attribute.objectId));
            this._setCanAddNewReference(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && this.attribute.canAddNewReference);
            this._setCanBrowseReference(hasReference && this.attribute.parent.isEditing && !this.attribute.isReadOnly && !this.attribute.selectInPlace);
        }

        private _openSelect() {
            const selectInPlace = <Select>Polymer.dom(this.root).querySelector("#selectInPlace");
            selectInPlace.open();
        }

        private _open(e: Event) {
            if (this.attribute.parent.isNew || !this.attribute.lookup.canRead)
                return;

            this.attribute.getPersistentObject().then(po => {
                if (po)
                    this.attribute.service.hooks.onOpen(po, false, !!po.parent);
            });

            e.preventDefault();
        }

        private _computeTarget(attribute: Vidyano.PersistentObjectAttribute, href: string): string {
            return attribute && href && attribute.parent.isNew ? "_blank" : "";
        }

        private _computeSelectInPlaceAsRadio(attribute: Vidyano.PersistentObjectAttributeWithReference): boolean {
            return attribute && attribute.getTypeHint("inputtype", undefined, undefined, true) === "radio";
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