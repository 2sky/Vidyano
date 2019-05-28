namespace Vidyano.WebComponents {
    "use strict";

    @Dialog.register({
        properties: {
            retry: Object,
            tab: {
                type: Object,
                computed: "_computeTab(retry.persistentObject, isAttached)"
            }
        }
    })
    export class RetryActionDialog extends Dialog {
        constructor(public retry: Service.RetryAction) {
            super();

            if (typeof retry.message === "undefined")
                retry.message = null;
        }

        attached() {
            super.attached();

            this.retry.cancelOption = 1;
            this.noCancelOnOutsideClick = this.noCancelOnEscKey = this.retry.cancelOption == null;
        }

        cancel() {
            this.close(this.retry.cancelOption);
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

        private _onSelectOption(e: TapEvent) {
            this.close(e.model.option);

            e.stopPropagation();
        }

        private _isFirst(index: number): boolean {
            return index === 0;
        }
    }
}