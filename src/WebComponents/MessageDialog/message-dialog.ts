namespace Vidyano.WebComponents {
    "use strict";

    export interface IMessageDialogOptions {
        noClose?: boolean;
        title?: string;
        titleIcon?: string;
        actions?: string[];
        actionTypes?: string[];
        message: string;
        extraClasses?: string[];
        rich?: boolean;
    }

    @Dialog.register({
        properties: {
            options: {
                type: Object,
                readOnly: true
            }
        }
    })
    export class MessageDialog extends Dialog {
        readonly options: IMessageDialogOptions; private _setOptions: (options: IMessageDialogOptions) => void;

        constructor(options: IMessageDialogOptions) {
            super();

            this._setOptions(options);
        }

        async open(): Promise<any> {
            if (this.options.rich)
                await this.importHref(this.resolveUrl("../../Libs/marked-element/marked-element.html"));

            return super.open();
        }

        private _hasHeaderIcon(options: IMessageDialogOptions): boolean {
            return options && typeof options.titleIcon === "string";
        }

        private _getActionType(options: IMessageDialogOptions, index: number): string {
            if (!options || !options.actionTypes)
                return undefined;

            return options.actionTypes[index];
        }

        private _onSelectAction(e: TapEvent) {
            this.close(e.model.index);

            e.stopPropagation();
        }

        private _isFirst(index: number): boolean {
            return index === 0;
        }
    }
}