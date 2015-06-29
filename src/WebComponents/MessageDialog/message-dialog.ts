module Vidyano.WebComponents {
    export interface MessageDialogOptions extends DialogOptions {
        noClose?: boolean;
        title?: string;
        titleIcon?: string;
        actions?: string[];
        actionTypes?: string[];
        message: string;
        extraClasses?: string[];

    }

    export class MessageDialog extends WebComponent {
        private _dialog: WebComponents.DialogInstance;
        options: MessageDialogOptions;

        private _setOptions: (options: MessageDialogOptions) => void;

        show(options: MessageDialogOptions): Promise<any> {
            this._setOptions(options);

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

        private _onSelectAction(e: Event) {
            this._dialog.resolve(parseInt((<HTMLElement>e.target).getAttribute("data-action-index"), 10));

            e.stopPropagation();
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
            }
        });
}