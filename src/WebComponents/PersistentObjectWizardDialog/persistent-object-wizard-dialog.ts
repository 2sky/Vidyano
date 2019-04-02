namespace Vidyano.WebComponents {
    @WebComponent.register({
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
        readonly currentTab: Vidyano.PersistentObjectAttributeTab; private _setCurrentTab: (tab: Vidyano.PersistentObjectTab) => void;
        readonly canPrevious: boolean;
        readonly canNext: boolean;
        readonly canFinish: boolean;
        hasPendingAttributes: boolean;

        constructor(public persistentObject: Vidyano.PersistentObject) {
            super();

            persistentObject.beginEdit();
            this._setCurrentTab(<Vidyano.PersistentObjectAttributeTab>persistentObject.tabs[0]);
        }

        connectedCallback() {
            super.connectedCallback();

            const width = parseInt(ShadyCSS.getComputedStyleValue(this, "--vi-persistent-object-dialog-base-width-base")) * (this.currentTab.columnCount || 1);
            this.updateStyles({
                "--vi-persistent-object-dialog-computed-width": `${width}px`
            });
        }

        private _tabInnerSizeChanged(e: SizeTrackerEvent) {
            e.stopPropagation();

            if (!e.detail.height)
                return;

            this.$.main.style.height = `${e.detail.height}px`;
            this._translateReset();
        }

        private _computeCanPrevious(currentTab: Vidyano.PersistentObjectAttributeTab): boolean {
            return !!currentTab && currentTab.parent.tabs.indexOf(currentTab) > 0;
        }

        private _previous(e: Polymer.TapEvent) {
            this._setCurrentTab(this.currentTab.parent.tabs[this.currentTab.parent.tabs.indexOf(this.currentTab) - 1]);
        }

        private _computeCanNext(currentTab: Vidyano.PersistentObjectAttributeTab, hasPendingAttributes: boolean, isBusy: boolean): boolean {
            if (isBusy || hasPendingAttributes)
                return false;

            return !!currentTab && currentTab.parent.tabs.indexOf(currentTab) < currentTab.parent.tabs.length - 1;
        }

        private _next(e: Polymer.TapEvent) {
            this.persistentObject.queueWork(async () => {
                const result = await this.persistentObject.service.executeAction("Wizard.NextStep", this.persistentObject, undefined, undefined, { CurrentTab: this.currentTab.key, Attributes: this.currentTab.attributes.map(a => a.name).join("\n") });
                this.persistentObject.refreshFromResult(result);

                if (this.currentTab.attributes.some(attr => !!attr.validationError))
                    return;

                this._setCurrentTab(this.currentTab.parent.tabs[this.currentTab.parent.tabs.indexOf(this.currentTab) + 1]);
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

        private async _finish() {
            if (await this.persistentObject.save())
                this.close(this.persistentObject);
        }

        private _onCaptureTab() {
            // Skip default tab navigation behavior
        }
    }
}