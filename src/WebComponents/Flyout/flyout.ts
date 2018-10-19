namespace Vidyano.WebComponents {
    let _flyouts: Vidyano.WebComponents.Flyout[] = [];

    export type FlyoutVisibility = "open" | "modal";

    @Vidyano.WebComponents.WebComponent.register({
        properties: {
            index: {
                type: Number,
                readOnly: true,
                observer: "_indexChanged",
                value: 0
            },
            item: {
                type: Object,
                readOnly: true
            },
            persistentObject: {
                type: Object,
                readOnly: true,
                observer: "_persistentObjectChanged"
            },
            persistentObjectPromise: {
                type: Object,
                observer: "_persistentObjectPromiseChanged"
            },
            persistentObjectTabs: {
                type: Array,
                computed: "_computePersistentObjectTabs(persistentObject, persistentObject.tabs)"
            },
            persistentObjectTab: {
                type: Object,
                value: null,
                notify: true
            },
            message: {
                type: Object,
                readOnly: true
            },
            activeMessageAction: {
                type: Number,
                readOnly: true,
                value: 0,
                observer: "_activeMessageActionChanged"
            },
            busy: {
                type: Boolean,
                readOnly: true,
                value: false
            },
            visibility: {
                type: String,
                reflectToAttribute: true,
                value: null,
                observer: "_visibilityChanged"
            }
        },
        forwardObservers: [
            "persistentObject.tabs.*.isVisible",
            "persistentObject.breadcrumb",
            "persistentObject.notification",
            "persistentObject.isBusy"
        ],
        listeners: {
            "close": "close",
            "action": "_onAction"
        },
        keybindings: {
            "esc": "close",
            "tab": "_keyboardNextMessageAction",
            "right": "_keyboardNextMessageAction",
            "left": "_keyboardPreviousMessageAction",
            "hover": "_hover"
        }
    })
    export class Flyout extends Vidyano.WebComponents.WebComponent {
        private _promise: { resolve: (result?: any) => void; reject: (error?: any) => void; };
        private _busyTimer: number;
        readonly index: number; private _setIndex: (index: number) => void;
        readonly persistentObject: Vidyano.PersistentObject; private _setPersistentObject: (persistentObject: Vidyano.PersistentObject) => void;
        readonly item: Vidyano.QueryResultItem; private _setItem: (item: Vidyano.QueryResultItem) => void;
        readonly message: Vidyano.WebComponents.IMessageDialogOptions; private _setMessage: (message: Vidyano.WebComponents.IMessageDialogOptions) => void;
        readonly busy: boolean; private _setBusy: (busy: boolean) => void;
        readonly activeMessageAction: number; private _setActiveMessageAction: (activeAction: number) => void;
        persistentObjectPromise: Promise<Vidyano.PersistentObject>;
        persistentObjectTab: Vidyano.PersistentObjectTab;
        visibility: FlyoutVisibility;

        static Create(): Flyout {
            const newFlyout = new Vidyano.WebComponents.Flyout();
            newFlyout.setAttribute("hidden", "");

            const app = <App>document.querySelector("vi-app");
            Polymer.dom(app).appendChild(newFlyout);
            Polymer.dom(app).flush();

            _flyouts.push(newFlyout);

            return newFlyout;
        }

        static get Instances(): Flyout[] {
            return _flyouts;
        }

        attached() {
            super.attached();
            this._updateIndex();
        }

        private _indexChanged(index: number) {
            this.customStyle["--vi-flyout-index"] = `${index}`;
            this.updateStyles();
        }

        private _newResponse(): Promise<any> {
            return new Promise((resolve, reject) => {
                this._promise = {
                    resolve: result => {
                        resolve(result);
                        this._promise = null;
                    },
                    reject: err => {
                        reject(err);
                        this._promise = null;
                    },
                };
            });
        }

        async showMessageDialog(options: Vidyano.WebComponents.IMessageDialogOptions): Promise<number> {
            this._setActiveMessageAction(0);
            this.visibility = "modal";
            this._setMessage(options);

            return this._newResponse();
        }

        async showQueryResultItem(item: Vidyano.QueryResultItem, visibility: FlyoutVisibility = "open") {
            this._setItem(item);
            this.showPersistentObject(item.getPersistentObject(), visibility);
        }

        async showPersistentObject(persistentObject: Vidyano.PersistentObject, visibility?: FlyoutVisibility);
        async showPersistentObject(promise: Promise<Vidyano.PersistentObject>, visibility?: FlyoutVisibility);
        async showPersistentObject(persistentObjectOrPromise: Vidyano.PersistentObject | Promise<Vidyano.PersistentObject>, visibility: FlyoutVisibility = "modal") {
            this.visibility = visibility;
            let animationPromise = new Promise(resolve => setTimeout(() => resolve(), 300));

            if (this._busyTimer) {
                clearTimeout(this._busyTimer);
                this._busyTimer = 0;
                this._setBusy(false);
            }

            this._setPersistentObject(null);
            this.persistentObjectTab = null;

            if (!persistentObjectOrPromise)
                return;

            if (persistentObjectOrPromise instanceof Vidyano.PersistentObject)
                persistentObjectOrPromise = Promise.resolve(persistentObjectOrPromise);

            this._busyTimer = setTimeout(() => {
                this._setBusy(true);
            }, 500);

            try {
                const po: Vidyano.PersistentObject = (await Promise.all([
                    persistentObjectOrPromise,
                    animationPromise,
                    this.app.importComponent("PersistentObjectTabPresenter"),
                    this.app.importComponent("PersistentObjectTabBar")]))[0];

                if (!po)
                    return;

                this._setPersistentObject(po);
            }
            catch (e) {
                this.app.showAlert(e, Vidyano.NotificationType.Error, 3000);
            }
            finally {
                clearTimeout(this._busyTimer);
                this._setBusy(false);
            }
        }

        private _persistentObjectChanged(persistentObject: Vidyano.PersistentObject) {
            if (persistentObject) {
                setTimeout(() => {
                    if (persistentObject.getAction("Edit") && !persistentObject.isEditing && !(persistentObject.stateBehavior || "").toLowerCase().contains("stayinedit")) {
                        persistentObject.stateBehavior = `StayInEdit,${persistentObject.stateBehavior || ""}`;
                        persistentObject.beginEdit();
                    }

                    this.persistentObjectTab = persistentObject.tabs[0];
                }, 1);
            }
            else
                this.persistentObjectTab = null;
        }

        private _computePersistentObjectTabs(persistentObject: Vidyano.PersistentObject, tabs: Vidyano.PersistentObjectTab[]): Vidyano.PersistentObjectTab[] {
            const result = tabs ? tabs.filter(t => t.isVisible) : [];
            return result.length > 1 ? result : null;
        }

        private _sortAttributes(a1: Vidyano.PersistentObjectAttribute, a2: Vidyano.PersistentObjectAttribute): number {
            return a1.offset - a2.offset;
        }

        private _isActionUnpinned(action: Vidyano.Action): boolean {
            return !action.isPinned;
        }

        private async _onAction(e: CustomEvent, detail: { action: Vidyano.Action; workHandler: Promise<Vidyano.PersistentObject> }) {
            try {
                if (detail.action.name === "CancelEdit" || detail.action.name === "CancelSave") {
                    await detail.workHandler;
                    this.close();

                    e.stopPropagation();
                }
                else
                    await detail.workHandler;
            }
            catch (e) {
                this.app.showAlert(e, Vidyano.NotificationType.Error, 3000);
            }
        }

        private _onMessageAction(e: TapEvent) {
            this.close(e.model.index);
        }

        private _getMessageActionType(options: Vidyano.WebComponents.IMessageDialogOptions, index: number): string {
            if (!options || !options.actionTypes)
                return undefined;

            return options.actionTypes[index];
        }

        private _activeMessageActionChanged(activeMessageAction: number) {
            const actions = <HTMLElement>Polymer.dom(this.root).querySelector(".message .actions");
            if (!actions)
                return;

            const button = <HTMLButtonElement>actions.querySelector(`button:nth-child(${activeMessageAction + 1})`);
            if (!button)
                return;

            this._focusElement(button);
        }

        private _keyboardNextMessageAction() {
            this._setActiveMessageAction((this.activeMessageAction + 1) % this.message.actions.length);
        }

        private _keyboardPreviousMessageAction() {
            this._setActiveMessageAction((this.activeMessageAction - 1 + this.message.actions.length) % this.message.actions.length);
        }

        private _isActiveMessageAction(activeAction: number, index: number): boolean {
            return activeAction === index;
        }

        private _visibilityChanged(visibility: FlyoutVisibility) {
            this.removeAttribute("hidden");
            this.fire("flyout-visibility-changed", visibility);
        }

        private _blur(e: FocusEvent) {
            const parent = this.findParent(e => e === this, <Node>e.relatedTarget);
            if (parent !== this)
                setTimeout(() => this._activeMessageActionChanged(this.activeMessageAction), 1);
        }

        close(result?: any) {
            this.visibility = null;
            this._setItem(null);
            this._setPersistentObject(null);
            this._setMessage(null);

            if (this._promise)
                this._promise.resolve(result);

            this._updateIndex(1);
            setTimeout(() => Polymer.dom(this.app).removeChild(this), 200);
        }

        private _updateIndex(sliceTop: number = 0) {
            if (sliceTop)
                _flyouts.splice(_flyouts.length - 1, 1);

            _flyouts.forEach((flyout: Flyout, index) => flyout._setIndex(_flyouts.length - index - sliceTop));
        }
    }
}