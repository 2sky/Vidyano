namespace Vidyano.WebComponents {
    "use strict";

    export interface IMessageDialogOptions {
        noClose?: boolean;
        title?: string;
        titleIcon?: string;
        actions?: string[];
        actionTypes?: string[];
        defaultAction?: number;
        cancelAction?: number;
        message: string;
        extraClasses?: string[];
        rich?: boolean;
    }

    @Dialog.register({
        properties: {
            options: {
                type: Object,
                readOnly: true
            },
            activeAction: {
                type: Number,
                readOnly: true,
                value: 0,
                observer: "_activeActionChanged"
            }
        },
        keybindings: {
            "tab": "_keyboardNextAction",
            "right": "_keyboardNextAction",
            "left": "_keyboardPreviousAction"
        }
    })
    export class MessageDialog extends Dialog {
        readonly options: IMessageDialogOptions; private _setOptions: (options: IMessageDialogOptions) => void;
        readonly activeAction: number; private _setActiveAction: (activeAction: number) => void;

        constructor(options: IMessageDialogOptions) {
            super();

            this._setOptions(options);

            if (options.defaultAction)
                this._setActiveAction(options.defaultAction);
        }

        attached() {
            super.attached();

            this.noCancelOnEscKey = this.noCancelOnOutsideClick = this.options.noClose || this.options.cancelAction == null;
        }

        cancel() {
            if (this.options.cancelAction == null)
                super.cancel();
            else
                super.close(this.options.cancelAction);
        }

        async open(): Promise<any> {
            if (this.options.rich)
                await this.importHref(this.resolveUrl("../../Libs/marked-element/marked-element.html"));

            const focus = setInterval(() => {
                const button = <HTMLButtonElement>this.$.actions.querySelectorAll("button")[this.activeAction];
                if (!button)
                    return;

                if (document.activeElement !== button)
                    this._focusElement(button);
                else
                    clearInterval(focus);
            }, 100);

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

        private _activeActionChanged(activeAction: number) {
            const button = <HTMLButtonElement>this.$.actions.querySelector(`button:nth-child(${activeAction + 1})`);
            if (!button)
                return;

            this._focusElement(button);
        }

        private _keyboardNextAction() {
            this._setActiveAction((this.activeAction + 1) % this.options.actions.length);
        }

        private _keyboardPreviousAction() {
            this._setActiveAction((this.activeAction - 1 + this.options.actions.length) % this.options.actions.length);
        }

        private _isActiveAction(activeAction: number, index: number): boolean {
            return activeAction === index;
        }
    }
}