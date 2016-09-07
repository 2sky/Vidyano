namespace Vidyano.WebComponents {
    "use strict";

    @Dialog.register({
        properties: {
            persistentObject: Object,
            currentTab: {
                type: Object,
                readOnly: true
            },
            canPrevious: {
                type: Boolean,
                value: false,
                computed: "_computeCanPrevious(currentTab)"
            },
            canNext: {
                type: Boolean,
                value: true,
                computed: "_computeCanNext(currentTab, hasPendingAttributes, persistentObject.isBusy)"
            },
            canFinish: {
                type: Boolean,
                value: false,
                computed: "_computeCanFinish(currentTab, canNext)"
            },
            hasPendingAttributes: {
                type: Boolean,
                computed: "_computeHasPendingAttributes(currentTab.attributes, currentTab.attributes.*, persistentObject.lastUpdated)"
            }
        },
        forwardObservers: [
            "persistentObject.isBusy",
            "currentTab.attributes.*.value",
            "persistentObject.lastUpdated"
        ],
        hostAttributes: {
            "dialog": ""
        },
        listeners: {
            "vi-persistent-object-tab-inner-size-changed": "_tabInnerSizeChanged"
        }
    })
    export class PersistentObjectWizardDialog extends Dialog {
        currentTab: Vidyano.PersistentObjectAttributeTab;
        hasPendingAttributes: boolean;

        private _setCurrentTab: (tab: Vidyano.PersistentObjectTab) => void;
        private _setCanPrevious: (val: boolean) => void;
        private _setCanNext: (val: boolean) => void;
        private _setCanFinish: (val: boolean) => void;

        constructor(public persistentObject: Vidyano.PersistentObject) {
            super();

            persistentObject.beginEdit();
            this._setCurrentTab(<Vidyano.PersistentObjectAttributeTab>persistentObject.tabs[0]);
        }

        attached() {
            super.attached();

            const width = parseInt(this.getComputedStyleValue("--vi-persistent-object-dialog-base-width-base")) * (this.currentTab.columnCount || 1);
            this.customStyle["--vi-persistent-object-dialog-computed-width"] = `${width}px`;
            this.updateStyles();
        }

        private _tabInnerSizeChanged(e: CustomEvent, detail: { size: ISize; }) {
            e.stopPropagation();

            if (!detail.size.height)
                return;

            this.$["main"].style.height = `${detail.size.height}px`;
            this._translateReset();
        }

        private _computeCanPrevious(currentTab: Vidyano.PersistentObjectAttributeTab): boolean {
            return !!currentTab && currentTab.parent.tabs.indexOf(currentTab) > 0;
        }

        private _previous(e: TapEvent) {
            this._setCurrentTab(this.currentTab.parent.tabs[this.currentTab.parent.tabs.indexOf(this.currentTab) - 1]);
        }

        private _computeCanNext(currentTab: Vidyano.PersistentObjectAttributeTab, hasPendingAttributes: boolean, isBusy: boolean): boolean {
            if (isBusy || hasPendingAttributes)
                return false;

            return !!currentTab && currentTab.parent.tabs.indexOf(currentTab) < currentTab.parent.tabs.length - 1;
        }

        private _next(e: TapEvent) {
            this.persistentObject.queueWork(() => {
                return this.persistentObject.service.executeAction("Wizard.NextStep", this.persistentObject, undefined, undefined, { CurrentTab: this.currentTab.key, Attributes: this.currentTab.attributes.map(a => a.name).join("\n") }).then(result => {
                    this.persistentObject.refreshFromResult(result);

                    if (this.currentTab.attributes.some(attr => !!attr.validationError))
                        return;

                    this._setCurrentTab(this.currentTab.parent.tabs[this.currentTab.parent.tabs.indexOf(this.currentTab) + 1]);
                }).catch(Vidyano.noop);
            });
        }

        private _computeCanFinish(currentTab: Vidyano.PersistentObjectAttributeTab, canNext: boolean): boolean {
            if (canNext)
                return false;

            return !!currentTab && currentTab.parent.tabs.indexOf(currentTab) === currentTab.parent.tabs.length - 1;
        }

        private _computeHasPendingAttributes(attributes: Vidyano.PersistentObjectAttribute[]): boolean {
            return attributes && attributes.some(attr => attr.isRequired && (attr.value == null || (attr.rules && attr.rules.contains("NotEmpty") && attr.value === "")));
        }

        private _finish() {
            this.persistentObject.save().then(success => {
                if (success)
                    this.close(this.persistentObject);
            }).catch(Vidyano.noop);
        }

        private _onCaptureTab() {
            // Skip default tab navigation behavior
        }
    }
}