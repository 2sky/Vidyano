namespace Vidyano.WebComponents {
    @WebComponent.register({
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

        connectedCallback() {
            super.connectedCallback();

            this.retry.cancelOption = 1;
            this.noCancelOnOutsideClick = this.noCancelOnEscKey = this.retry.cancelOption == null;
        }

        cancel() {
            this.close(this.retry.cancelOption);
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

        private _onSelectOption(e: Polymer.TapEvent) {
            this.close(e.model.option);

            e.stopPropagation();
        }

        private _isFirst(index: number): boolean {
            return index === 0;
        }
    }
}