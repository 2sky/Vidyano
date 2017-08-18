namespace Vidyano.WebComponents {
    "use strict";

    @Dialog.register({
        properties: {
            retry: Object,
            tab: {
                type: Object,
                computed: "_computeTab(retry.persistentObject, isConnected)"
            }
        }
    })
    export class RetryActionDialog extends Dialog {
        constructor(public retry: IRetryAction) {
            super();

            if (typeof retry.message === "undefined")
                retry.message = null;
        }

        private _computeTab(persistentObject: Vidyano.PersistentObject, isConnected: boolean): Vidyano.PersistentObjectAttributeTab {
            if (!persistentObject || !isConnected)
                return null;

            const tab = <Vidyano.PersistentObjectAttributeTab>Enumerable.from(persistentObject.tabs).firstOrDefault(tab => tab instanceof Vidyano.PersistentObjectAttributeTab);
            tab.columnCount = tab.columnCount > 1 ? tab.columnCount : 1;

            const width = parseInt(this.getComputedStyleValue("--vi-persistent-object-dialog-base-width-base")) * tab.columnCount;
            this.updateStyles({ "--vi-persistent-object-dialog-computed-width": `${width}px` });

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