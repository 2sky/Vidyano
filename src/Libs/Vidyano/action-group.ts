namespace Vidyano {
    "use strict";

    interface IActionGroupAction {
        action: Action;
        observer: Common.ISubjectDisposer;
    }

    export class ActionGroup extends ServiceObject {
        private _actions: IActionGroupAction[] = [];
        private _canExecute: boolean = false;
        private _isVisible: boolean = false;

        constructor(public service: Service, public definition: ActionDefinition) {
            super(service);
        }

        addAction(action: Action) {
            const index = this._actions.findIndex(a => a.action === action);
            if (index >= 0)
                return;

            this._actions.push({
                action: action,
                observer: action.propertyChanged.attach(this._actionPropertyChanged.bind(this))
            });

            this._setCanExecute(this.canExecute || action.canExecute);
            this._setIsVisible(this.isVisible || action.isVisible);
        }

        removeAction(action: Action) {
            const index = this._actions.findIndex(a => a.action === action);
            if (index < 0)
                return;

            const gAction = this._actions.splice(index, 1)[0];
            gAction.observer();
        }

        get actions(): Action[] {
            return this._actions.map(a => a.action);
        }

        get name(): string {
            return this.definition.name;
        }

        get displayName(): string {
            return this.definition.displayName;
        }

        get canExecute(): boolean {
            return this._canExecute;
        }

        private _setCanExecute(val: boolean) {
            if (this._canExecute === val)
                return;

            this._canExecute = val;
            this.notifyPropertyChanged("canExecute", val, !val);
        }

        get isVisible(): boolean {
            return this._isVisible;
        }

        private _setIsVisible(val: boolean) {
            if (this._isVisible === val)
                return;

            this._isVisible = val;
            this.notifyPropertyChanged("isVisible", val, !val);
        }

        get isPinned(): boolean {
            return this._actions[0] ? this._actions[0].action.isPinned : false;
        }

        get options(): string[] {
            return null;
        }

        private _actionPropertyChanged(action: Action, detail: Common.PropertyChangedArgs) {
            switch (detail.propertyName) {
                case "canExecute": {
                    this._setCanExecute(this._actions.some(a => a.action.canExecute));
                    break;
                }

                case "isVisible": {
                    this._setIsVisible(this._actions.some(a => a.action.isVisible));
                    break;
                }
            }
        }
    }
}