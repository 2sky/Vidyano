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

    @WebComponent.register({
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
            },
            dragging: {
                type: Boolean,
                readOnly: true,
                reflectToAttribute: true
            },
            _translate: {
                type: Object,
                readOnly: true,
                observer: "_translateChanged"
            }
        }
    })
    export class Dialog extends WebComponent {
        private _translate: { x: number; y: number };
        private _instance: DialogInstance;
        private _setShown: (shown: boolean) => void;
        private _setAutoSize: (autoSize: boolean) => void;
        private _setDragging: (dragging: boolean) => void;
        private _set_translate: (translate: { x: number; y: number }) => void;

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

        private _track(e: CustomEvent, detail: PolymerTrackDetail) {
            if (detail.state == "track") {
                this._set_translate({
                    x: this._translate.x + detail.ddx,
                    y: this._translate.y + detail.ddy
                });
            }
            else if (detail.state == "start") {
                if (!this._translate)
                    this._set_translate({ x: 0, y: 0 });

                this._setDragging(true);
            }
            else if (detail.state == "end")
                this._setDragging(false);
        }

        private _translateChanged() {
            var dialog = this.$["dialog"];
            dialog.style.webkitTransform = dialog.style.transform = "translate(" + this._translate.x + "px, " + this._translate.y + "px)";
        }
    }
}