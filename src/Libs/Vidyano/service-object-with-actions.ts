namespace Vidyano {
    "use strict";

    export class ServiceObjectWithActions extends ServiceObject {
        private _queue: Queue;
        private _isBusy: boolean = false;
        private _notification: string;
        private _notificationType: NotificationType;
        private _notificationDuration: number;
        actions: Action[] = [];

        constructor(service: Service, private _actionNames: string[] = [], private _actionLabels?: { [key: string]: string }) {
            super(service);

            this._queue = new Queue(1);
        }

        get isBusy(): boolean {
            return this._isBusy;
        }

        private _setIsBusy(val: boolean) {
            if (this._isBusy === val)
                return;

            const oldIsBusy = this._isBusy;
            this.notifyPropertyChanged("isBusy", this._isBusy = val, oldIsBusy);
        }

        get notification(): string {
            return this._notification;
        }

        get notificationType(): NotificationType {
            return this._notificationType;
        }

        get notificationDuration(): number {
            return this._notificationDuration;
        }

        getAction(name: string): Vidyano.Action {
            return this.actions[name];
        }

        setNotification(notification: string = null, type: NotificationType = "Error", duration: number = null, skipShowNotification?: boolean) {
            if (notification != null && typeof notification === "object")
                notification = notification["message"];

            const oldNotificationDuration = this.notificationDuration;
            if (oldNotificationDuration !== duration)
                this.notifyPropertyChanged("notificationDuration", this._notificationDuration = duration, oldNotificationDuration);

            const oldNotificationType = this._notificationType;
            if (oldNotificationType !== type)
                this.notifyPropertyChanged("notificationType", this._notificationType = type, oldNotificationType);

            const oldNotification = this.notification;
            if (oldNotification !== notification)
                this.notifyPropertyChanged("notification", this._notification = notification, oldNotification);

            if (!skipShowNotification && this.notificationDuration) {
                this.service.hooks.onShowNotification(notification, type, duration);
                this.setNotification();
            }
        }

        queueWork<T>(work: () => Promise<T>, blockActions: boolean = true): Promise<T> {
            this._setIsBusy(true);

            return this._queue.add(async () => {
                if (blockActions)
                    this._blockActions(true);

                try {
                    const result = await work();
                    this._setIsBusy(this._queue.getQueueLength() > 0);
                    if (blockActions)
                        this._blockActions(false);

                    return result;
                }
                catch (e) {
                    this._setIsBusy(this._queue.getQueueLength() > 0);
                    this._blockActions(false);

                    throw e;
                }
            });
        }

        protected _initializeActions() {
            Action.addActions(this.service, this, this.actions, this._actionNames);
            this.actions.forEach(a => {
                this.actions[a.name] = a;

                if (this._actionLabels && this._actionLabels[a.name] != null)
                    a.displayName = this._actionLabels[a.name];
            });
        }

        private _blockActions(block: boolean) {
            this.actions.forEach(action => {
                action.block = block;
            });
        }
    }
}
