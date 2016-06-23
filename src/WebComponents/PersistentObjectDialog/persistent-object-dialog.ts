namespace Vidyano.WebComponents {
    "use strict";

    export interface IPersistentObjectDialogOptions {
        noHeader?: boolean;
        saveLabel?: string;
        save?: (po: Vidyano.PersistentObject, close: () => void) => void;
        cancel?: (close: () => void) => void;
    }

    @Dialog.register({
        properties: {
            persistentObject: Object,
            tab: {
                type: Object,
                computed: "_computeTab(persistentObject, isAttached)"
            },
            readOnly: {
                type: Boolean,
                computed: "_computeReadOnly(tab)"
            },
            saveLabel: {
                type: String,
                computed: "_computeSaveLabel(isAttached)"
            }
        },
        listeners: {
            "attribute-loaded": "_attributeLoaded"
        },
        forwardObservers: [
            "persistentObject.isBusy"
        ],
        hostAttributes: {
            "dialog": ""
        }
    })
    export class PersistentObjectDialog extends Dialog {
        private _saveHook: (po: Vidyano.PersistentObject) => Promise<any>;
        private _tabAttributePresenters: Vidyano.WebComponents.PersistentObjectAttributePresenter[];
        tab: Vidyano.PersistentObjectAttributeTab;

        constructor(public persistentObject: Vidyano.PersistentObject, private _options: IPersistentObjectDialogOptions = {}) {
            super();

            this.noHeader = _options.noHeader;
            persistentObject.beginEdit();
        }

        private _save() {
            if (this._options.save)
                this._options.save(this.persistentObject, () => this.close(this.persistentObject));
            else {
                const wasNew = this.persistentObject.isNew;
                this.persistentObject.save().then(() => {
                    if (StringEx.isNullOrWhiteSpace(this.persistentObject.notification) || this.persistentObject.notificationType !== NotificationType.Error) {
                        if (wasNew && this.persistentObject.ownerAttributeWithReference == null && this.persistentObject.stateBehavior.indexOf("OpenAfterNew") !== -1) {
                            this.persistentObject.queueWork(() => this.app.service.getPersistentObject(this.persistentObject.parent, this.persistentObject.id, this.persistentObject.objectId)).then(po2 => {
                                this.app.service.hooks.onOpen(po2, true);
                                this.close(this.persistentObject);
                            }, e => {
                                this.close(this.persistentObject);
                                const owner: ServiceObjectWithActions = this.persistentObject.ownerQuery || this.persistentObject.parent;
                                if (!!owner)
                                    owner.setNotification(e);
                            });
                        }
                        else
                            this.close(this.persistentObject);
                    }
                }).catch(Vidyano.noop);
            }
        }

        private _cancel() {
            if (this._options.cancel)
                this._options.cancel(() => this.cancel());
            else if (this.persistentObject) {
                this.persistentObject.cancelEdit();
                this.cancel();
            }
        }

        private _computeSaveLabel(isAttached: boolean): string {
            if (!isAttached)
                return null;

            return this._options.saveLabel || this.translateMessage("Save");
        }

        private _computeTab(persistentObject: Vidyano.PersistentObject, isAttached: boolean): Vidyano.PersistentObjectAttributeTab {
            if (!persistentObject || !isAttached)
                return null;

            const tab = <Vidyano.PersistentObjectAttributeTab>Enumerable.from(persistentObject.tabs).firstOrDefault(tab => tab instanceof Vidyano.PersistentObjectAttributeTab);
            tab.columnCount = tab.columnCount > 1 ? tab.columnCount : 1;

            const width = parseInt(this.getComputedStyleValue("--vi-persistent-object-dialog-base-width-base")) * tab.columnCount;
            this.customStyle["--vi-persistent-object-dialog-computed-width"] = `${width}px`;
            this.updateStyles();

            return tab;
        }

        private _computeReadOnly(tab: Vidyano.PersistentObjectAttributeTab): boolean {
            return !!tab && !tab.attributes.some(attribute => !attribute.isReadOnly && attribute.isVisible);
        }

        private _attributeLoaded(e: CustomEvent, detail: { attribute: Vidyano.PersistentObjectAttribute }) {
            if (!this._tabAttributePresenters)
                this._tabAttributePresenters = [];

            const presenter = <Vidyano.WebComponents.PersistentObjectAttributePresenter>e.target;
            this._tabAttributePresenters.push(presenter);

            if (this._tabAttributePresenters.length < this.tab.attributes.length)
                return;

            this._tabAttributePresenters = this._tabAttributePresenters.sort((attr1, attr2) => attr1.attribute.offset - attr2.attribute.offset);
            const target = Enumerable.from(this._tabAttributePresenters).firstOrDefault(a => !a.hidden && !a.disabled && !a.readOnly);
            if (!target)
                return;

            target.focus();
        }

        private _onCaptureTab() {
            // Skip default tab navigation behavior
        }
    }
}