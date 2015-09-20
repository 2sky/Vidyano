module Vidyano.WebComponents {
    export interface MessageDialogOptions extends DialogOptions {
        noClose?: boolean;
        title?: string;
        titleIcon?: string;
        actions?: string[];
        actionTypes?: string[];
        message: string;
        extraClasses?: string[];
        html?: boolean;
    }

    @Dialog.register({
        properties: {
            options: {
                type: Object,
                readOnly: true
            }
        },
        keybindings: {
            "esc": {
                listener: "cancel",
                priority: Number.MAX_VALUE
            }
        }
    })
    export class MessageDialog extends Dialog {
        options: MessageDialogOptions;

        private _setOptions: (options: MessageDialogOptions) => void;

        protected show(options: MessageDialogOptions) {
            this._setOptions(options);

            if (options.html)
                this.$["pre"].innerHTML = options.message;
            else
                this.$["pre"].textContent = options.message;
        }

        private _hasHeaderIcon(options: MessageDialogOptions): boolean {
            return this.options && typeof this.options.titleIcon == "string";
        }

        private _getActionType(options: MessageDialogOptions, index: number): string {
            if (!options || !options.actionTypes)
                return undefined;

            return options.actionTypes[index];
        }

        private _onSelectAction(e: TapEvent) {
            this.instance.resolve(e.model.index);

            e.stopPropagation();
        }

        private _isFirst(index: number): boolean {
            return index === 0;
        }
    }
}