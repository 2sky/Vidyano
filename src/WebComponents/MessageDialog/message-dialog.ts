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

    export class MessageDialog extends WebComponent {
        private _dialog: WebComponents.DialogInstance;
        options: MessageDialogOptions;

        private _setOptions: (options: MessageDialogOptions) => void;

        show(options: MessageDialogOptions): Promise<any> {
            this._setOptions(options);

            if (options.html)
                this.$["pre"].innerHTML = options.message;
            else
                this.$["pre"].textContent = options.message;

            var dialog = <WebComponents.Dialog><any>this.$["dialog"];
            this._dialog = dialog.show(options);

            return this._dialog.result;
        }

        private _close() {
            this._dialog.reject();
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
            this._dialog.resolve(e.model.index);

            e.stopPropagation();
        }

        private _isFirst(index: number): boolean {
            return index === 0;
        }
    }

    Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.MessageDialog, Vidyano.WebComponents, "vi",
        {
            properties: {
                options: {
                    type: Object,
                    readOnly: true
                }
            },
            hostAttributes: {
                "dialog": ""
            },
            keybindings: {
                "esc": {
                    listener: "_close",
                    priority: Number.MAX_VALUE
                }
            }
        });
}