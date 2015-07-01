module Vidyano.WebComponents.Attributes {
    export class PersistentObjectAttributeReference extends WebComponents.Attributes.PersistentObjectAttribute {
        objectId: string;
        referenceAttribute: Vidyano.PersistentObjectAttributeWithReference;
        href: string;
        filter: string;

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
                this.attribute.setValue(newValue, true);
            }
        }

        private _objectIdChanged() {
            if (this.referenceAttribute && this.referenceAttribute.objectId !== this.objectId)
                this.referenceAttribute.changeReference(this.objectId ? [this.objectId] : []);
        }

        private _filterBlur() {
            if (!this.referenceAttribute)
                return;

            if (!StringEx.isNullOrEmpty(this.filter) && this.filter != this.referenceAttribute.value) {
                this.referenceAttribute.lookup.textSearch = 'vi-breadcrumb:"' + this.filter + '"';
                this.referenceAttribute.lookup.search().then(result => {
                    if (result.length == 0)
                        this.filter = this.referenceAttribute.value;
                    else if (result.length == 1)
                        this.referenceAttribute.changeReference([result[0]]).then(() => this._update());
                    else {
                        this.referenceAttribute.lookup.textSearch = this.filter;

                        this._browseReference().catch(() => {
                            this.filter = this.referenceAttribute.value;
                        });
                    }
                });
            }
            else
                this.filter = this.referenceAttribute.value;
        }

        protected _editingChanged() {
            this._update();
        }

        private _browseReference(): Promise<any> {
            this.referenceAttribute.lookup.selectedItems = [];
            this.referenceAttribute.lookup.search();

            var dialog = <SelectReferenceDialog>this.$$("#browseReferenceDialog");
            return dialog.show().then(result => {
                if (!result)
                    return Promise.reject();

                this.referenceAttribute.changeReference(result).then(() => {
                    this._update();
                });
            });
        }

        private _addNewReference(e: Event) {
            this.referenceAttribute.addNewReference();
        }

        private _clearReference(e: Event) {
            this.referenceAttribute.changeReference([]).then(() => this._update());
        }

        private _update() {
            var hasReference = this.referenceAttribute instanceof Vidyano.PersistentObjectAttributeWithReference;

            if (hasReference && this.referenceAttribute.objectId != this.objectId)
                this.objectId = this.referenceAttribute ? this.referenceAttribute.objectId : null;

            if (hasReference && this.referenceAttribute.lookup && this.referenceAttribute.objectId && this.app)
                this.href = "#!/" + this.app.getUrlForPersistentObject(this.referenceAttribute.lookup.persistentObject.id, this.referenceAttribute.objectId);
            else
                this.href = null;

            this.filter = hasReference ? this.referenceAttribute.value : "";

            this._setCanClear(hasReference && this.referenceAttribute.parent.isEditing && !this.referenceAttribute.isReadOnly && !this.referenceAttribute.isRequired && !StringEx.isNullOrEmpty(this.href) && !this.referenceAttribute.selectInPlace);
            this._setCanAddNewReference(hasReference && this.referenceAttribute.parent.isEditing && !this.referenceAttribute.isReadOnly && this.referenceAttribute.canAddNewReference);
            this._setCanBrowseReference(hasReference && this.referenceAttribute.parent.isEditing && !this.referenceAttribute.isReadOnly && !this.referenceAttribute.selectInPlace);
        }

        private _open(e: Event) {
            this.referenceAttribute.getPersistentObject().then(po => {
                if (po)
                    this.referenceAttribute.service.hooks.onOpen(po, false, true);
            });

            e.preventDefault();
        }
    }

    PersistentObjectAttribute.registerAttribute(PersistentObjectAttributeReference, {
        properties: {
            href: String,
            referenceAttribute: {
                type: Object,
                computed: "_forwardComputed(attribute)"
            },
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
                observer: "_objectIdChanged"
            },
            selectInPlace: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "referenceAttribute.selectInPlace"
            }
        }
    });
}