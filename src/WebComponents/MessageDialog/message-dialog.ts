namespace Vidyano.WebComponents {
    "use strict";

    export interface IMessageDialogOptions extends IDialogOptions {
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
        keybindings: {
            "esc": {
                listener: "cancel",
                priority: Number.MAX_VALUE
            }
        }
    })
    export class MessageDialog extends Dialog {
        options: IMessageDialogOptions;

        constructor(options: IMessageDialogOptions) {
            super(options);
        }

        private _hasHeaderIcon(options: IMessageDialogOptions): boolean {
            return this.options && typeof this.options.titleIcon === "string";
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