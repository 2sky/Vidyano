namespace Vidyano.WebComponents {
    export interface IPersistentObjectDialogOptions {
        noHeader?: boolean;
        saveLabel?: string;
        save?: (po: Vidyano.PersistentObject, close: () => void) => void;
        noCancel?: boolean;
        cancel?: (close: () => void) => void;
    }

    @WebComponent.register({
        properties: {
            persistentObject: Object,
            tab: {
                type: Object,
                computed: "_computeTab(persistentObject, isConnected)"
            },
            readOnly: {
                type: Boolean,
                computed: "_computeReadOnly(tab)"
            },
            canSave: {
                type: Boolean,
                computed: "_computeCanSave(persistentObject.isBusy, persistentObject.dialogSaveAction.canExecute)"
            },
            saveLabel: {
                type: String,
                computed: "_computeSaveLabel(app)"
            },
            dialogActions: {
                type: Array,
                computed: "_computeDialogActions(persistentObject, app)"
            },
            options: {
                type: Object,
                readOnly: true
            }
        },
        forwardObservers: [
            "persistentObject.isBusy",
            "persistentObject.dialogSaveAction.canExecute"
        ],
        hostAttributes: {
            "dialog": ""
        },
        listeners: {
            "vi-persistent-object-tab-inner-size-changed": "_tabInnerSizeChanged"
        },
        keybindings: {
            "ctrl+s": "_keyboardSave"
        }
    })
    export class PersistentObjectDialog extends Dialog {
        private _saveHook: (po: Vidyano.PersistentObject) => Promise<any>;
        readonly options: IPersistentObjectDialogOptions; private _setOptions: (options: IPersistentObjectDialogOptions) => void;
        tab: Vidyano.PersistentObjectAttributeTab;

        constructor(public persistentObject: Vidyano.PersistentObject, _options: IPersistentObjectDialogOptions = {}) {
            super();

            this._setOptions(_options || null);
            persistentObject.beginEdit();
        }

        private _keyboardSave(e: KeyboardEvent) {
            if (document.activeElement && document.activeElement instanceof HTMLInputElement)
                document.activeElement.blur();

            e.stopPropagation();
            this._save();
        }

        private async _save() {
            if (this.options.save)
                this.options.save(this.persistentObject, () => this.close(this.persistentObject));
            else {
                const wasNew = this.persistentObject.isNew;
                await this.persistentObject.dialogSaveAction.execute();

                if (StringEx.isNullOrWhiteSpace(this.persistentObject.notification) || this.persistentObject.notificationType !== NotificationType.Error) {
                    if (wasNew && this.persistentObject.ownerAttributeWithReference == null && this.persistentObject.stateBehavior.indexOf("OpenAfterNew") !== -1) {
                        try {
                            const po2 = await this.persistentObject.queueWork(() => this.persistentObject.service.getPersistentObject(this.persistentObject.parent, this.persistentObject.id, this.persistentObject.objectId));
                            this.persistentObject.service.hooks.onOpen(po2, true);
                            this.close(this.persistentObject);
                        }
                        catch (e) {
                            this.close(this.persistentObject);
                            const owner: ServiceObjectWithActions = this.persistentObject.ownerQuery || this.persistentObject.parent;
                            if (!!owner)
                                owner.setNotification(e);
                        }
                    }
                    else
                        this.close(this.persistentObject);
                }
            }
        }

        private _cancel() {
            if (this.options.cancel)
                this.options.cancel(() => this.cancel());
            else if (this.persistentObject) {
                this.persistentObject.cancelEdit();
                this.cancel();
            }
        }

        private _computeCanSave(isBusy: boolean, canExecute: boolean): boolean {
            return !isBusy && canExecute;
        }

        private _computeSaveLabel(app: Vidyano.WebComponents.App): string {
            if (!app)
                return null;

            let label = this.options.saveLabel;
            if (!label) {
                const endEdit = this.persistentObject.dialogSaveAction;
                if (endEdit)
                    label = endEdit.displayName;
            }

            return label || this.translateMessage("Save");
        }

        private _computeTab(persistentObject: Vidyano.PersistentObject, isConnected: boolean): Vidyano.PersistentObjectAttributeTab {
            if (!persistentObject || !isConnected)
                return null;

            const tab = <Vidyano.PersistentObjectAttributeTab>persistentObject.tabs.find(tab => tab instanceof Vidyano.PersistentObjectAttributeTab);
            tab.columnCount = tab.columnCount > 1 ? tab.columnCount : 1;

            const width = parseInt(ShadyCSS.getComputedStyleValue(this, "--vi-persistent-object-dialog-base-width-base")) * tab.columnCount;
            this.updateStyles({
                "--vi-persistent-object-dialog-computed-width": `${width}px`
            });

            return tab;
        }

        private _computeReadOnly(tab: Vidyano.PersistentObjectAttributeTab): boolean {
            return !!tab && !tab.parent.isNew && !tab.attributes.some(attribute => !attribute.isReadOnly && attribute.isVisible);
        }

        private _computeDialogActions(persistentObject: Vidyano.PersistentObject): Vidyano.Action[] {
            return persistentObject.actions.filter(a => a.definition.showedOn.some(s => s === "Dialog"));
        }

        private _computeHideCancel(readOnly: boolean, noCancel: boolean): boolean {
            return readOnly || noCancel;
        }

        private _executeExtraAction(e: Polymer.TapEvent) {
            const action = e.model.action as Vidyano.Action;
            if (!action.canExecute)
                return;

            action.execute();
        }

        private _onCaptureTab() {
            // Skip default tab navigation behavior
        }

        private _tabInnerSizeChanged(e: SizeTrackerEvent) {
            e.stopPropagation();

            if (!e.detail.height)
                return;

            this.$.main.style.height = `${e.detail.height}px`;
            this._translateReset();
        }
    }
}