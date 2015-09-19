module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            action: {
                type: Object,
                observer: "_updateCanExecuteHook"
            },
            isAttached: {
                type: Boolean,
                observer: "_updateCanExecuteHook"
            },
            item: Object,
            icon: {
                type: String,
                computed: "_computeIcon(action)"
            },
            pinned: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "action.isPinned"
            },
            noLabel: {
                type: Boolean,
                reflectToAttribute: true
            },
            forceLabel: {
                type: Boolean,
                reflectToAttribute: true
            },
            noIcon: {
                type: Boolean,
                reflectToAttribute: true
            },
            canExecute: {
                type: Boolean,
                readOnly: true
            },
            hidden: {
                type: Boolean,
                reflectToAttribute: true,
                readOnly: true
            },
            hasOptions: {
                type: Boolean,
                computed: "_computeHasOptions(action)"
            },
            options: {
                type: Array,
                computed: "action.options"
            },
            overflow: {
                type: Boolean,
                reflectToAttribute: true
            }
        },
        forwardObservers: [
            "action.isPinned"
        ]
    })
    export class ActionButton extends WebComponent {
        private _propertyChangedObserver: Vidyano.Common.SubjectDisposer;
        action: Vidyano.Action;
        item: Vidyano.QueryResultItem;
        canExecute: boolean;
        hasOptions: boolean;
        noLabel: boolean;
        forceLabel: boolean;

        private _setCanExecute: (val: boolean) => void;
        private _setHidden: (val: boolean) => void;

        private _executeWithoutOptions(e: TapEvent) {
            if (!this.canExecute) {
                e.stopPropagation();
                return;
            }

            if (!this.hasOptions)
                this._execute();

            e.preventDefault();
        }

        private _executeWithOption(e: TapEvent) {
            if (!this.canExecute) {
                e.stopPropagation();
                return;
            }

            this._execute(e.model.index);
        }

        private _execute(option: number = -1) {
            if (this.canExecute) {
                if (!this.item)
                    this.action.execute(option);
                else
                    this.action.execute(option, null, [this.item]);
            }
        }

        private _updateCanExecuteHook() {
            if (this._propertyChangedObserver) {
                this._propertyChangedObserver();
                this._propertyChangedObserver = undefined;
            }

            if (this.action && this.isAttached) {
                this._propertyChangedObserver = this.action.propertyChanged.attach((action, detail) => {
                    if (detail.propertyName == "canExecute")
                        this._setCanExecute(this.item ? this.action.definition.selectionRule(1) : this.action.canExecute);
                    else if (detail.propertyName == "isVisible")
                        this._setHidden(!detail.newValue);
                });

                this._setCanExecute(this.item ? this.action.definition.selectionRule(1) : this.action.canExecute);
                this._setHidden(!this.action.isVisible);
            }
        }

        private _computeIcon(action: Vidyano.Action): string {
            if (!action)
                return "";

            var actionIcon = "Action_" + action.definition.name;
            return action.isPinned && !Icon.Exists(actionIcon) ? "Action_Default$" : actionIcon;
        }

        private _computeHasOptions(action: Vidyano.Action): boolean {
            return action && action.options && action.options.length > 0;
        }
    }
}