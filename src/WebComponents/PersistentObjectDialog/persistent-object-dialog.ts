namespace Vidyano.WebComponents {
    "use strict";

    export interface IPersistentObjectDialogOptions {
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
        hostAttributes: {
            "dialog": ""
        }
    })
    export class PersistentObjectDialog extends Dialog {
        private _saveHook: (po: Vidyano.PersistentObject) => Promise<any>;
        tab: Vidyano.PersistentObjectAttributeTab;

        constructor(public persistentObject: Vidyano.PersistentObject, private _options: IPersistentObjectDialogOptions = {}) {
            super();

            persistentObject.beginEdit();
        }

        private _save() {
            if (this._options.save)
                this._options.save(this.persistentObject, () => this.instance.resolve(this.persistentObject));
            else {
                const wasNew = this.persistentObject.isNew;
                this.persistentObject.save().then(() => {
                    if (StringEx.isNullOrWhiteSpace(this.persistentObject.notification) || this.persistentObject.notificationType !== NotificationType.Error) {
                        if (wasNew && this.persistentObject.ownerAttributeWithReference == null && this.persistentObject.stateBehavior.indexOf("OpenAfterNew") !== -1)
                            this.app.service.getPersistentObject(this.persistentObject.parent, this.persistentObject.id, this.persistentObject.objectId).then(po2 => {
                                this.app.service.hooks.onOpen(po2, true);
                                this.instance.resolve(this.persistentObject);
                            }, e => {
                                this.instance.resolve(this.persistentObject);
                                const owner: ServiceObjectWithActions = this.persistentObject.ownerQuery || this.persistentObject.parent;
                                if (!!owner)
                                    owner.setNotification(e);
                            });
                        else
                            this.instance.resolve(this.persistentObject);
                    }
                });
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

        private _onSelectAction(e: Event) {
            this.instance.resolve(parseInt((<HTMLElement>e.target).getAttribute("data-action-index"), 10));

            e.stopPropagation();
        }
    }
}