module Vidyano.WebComponents {
    export interface DialogOptions {
        autoSize?: boolean;
    }

    export class DialogInstance {
        constructor(public options: DialogOptions, public result: Promise<any>, private _resolve: Function, private _reject: Function) {
        }

        resolve(result?: any) {
            this._resolve(result);
        }

        reject(error?: any) {
            this._reject(error);
        }
    }

    export class Dialog extends WebComponent {
        private _instance: DialogInstance;
        private _position: { x: number; y: number };
        private _setShown: (shown: boolean) => void;
        private _setAutoSize: (autoSize: boolean) => void;

        show(options: DialogOptions = {}): DialogInstance {
            var resolve: Function;
            var reject: Function;
            var promise = new Promise((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;

                this._setAutoSize(options.autoSize);
                this._setShown(true);
            }).then(result => {
                this._setShown(false);
                return result;
            }).catch(e => {
                this._setShown(false);
                reject(e);
            });

            this.set("_instance", new DialogInstance(options, promise, resolve, reject));
            return this._instance;
        }

        private _close() {
            this._setShown(false);

            this._instance.reject();
        }
    }

    WebComponent.register(Dialog, WebComponents, "vi", {
        properties: {
            shown:
            {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            autoSize:
            {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            }
        }
    });
}