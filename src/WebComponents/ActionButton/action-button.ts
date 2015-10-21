module Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            action: Object,
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
            options: {
                type: Array,
                readOnly: true
            },
            overflow: {
                type: Boolean,
                reflectToAttribute: true,
                value: null
            },
            openOnHover: {
                type: Boolean,
                reflectToAttribute: true,
                value: null
            }
        },
        observers: [
            "_observeAction(action.canExecute, action.isVisible, action.options, isAttached)"
        ],
        forwardObservers: [
            "action.isPinned",
            "action.canExecute",
            "action.isVisible",
            "action.options"
        ]
    })
    export class ActionButton extends WebComponent {
        private _skipObserver: boolean;
        options: string[];
        canExecute: boolean;
        noLabel: boolean;
        openOnHover: boolean;
        forceLabel: boolean;

        private _setCanExecute: (val: boolean) => void;
        private _setHidden: (val: boolean) => void;
        private _setOptions: (val: string[]) => void;

        constructor(public item: Vidyano.QueryResultItem, public action: Vidyano.Action) {
            super();

            if(item && action) {
                var args: SelectedItemsActionArgs = {
                    name: action.name,
                    isVisible: action.isVisible,
                    canExecute: action.definition.selectionRule(1),
                    options: action.options
                };

                action.service.hooks.onSelectedItemsActions(item.query, [item], args);

                this._setCanExecute(args.canExecute);
                this._setHidden(!args.isVisible);
                this._setOptions(args.options && args.options.length > 0 ? args.options : null);

                this._skipObserver = true;
            }
        }

        private _executeWithoutOptions(e: TapEvent) {
            if (!this.canExecute) {
                e.stopPropagation();
                return;
            }

            if (!this.options)
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
                else {
                    this.action.execute(option, this.options && option < this.options.length ? {
                        MenuLabel: this.options[option]
                    } : null, [this.item]);
                }
            }
        }

        private _observeAction(canExecute: boolean, isVisible: boolean, options: boolean) {
            if(!this.isAttached || this._skipObserver)
                return;

            this._setCanExecute(this.item ? this.action.definition.selectionRule(1) : this.action.canExecute);
            this._setHidden(!this.action.isVisible);
            this._setOptions(this.action.options && this.action.options.length > 0 ? this.action.options : null);
        }

        private _computeIcon(action: Vidyano.Action): string {
            if (!action)
                return "";

            var actionIcon = `Action_${action.definition.name}`;
            return action.isPinned && !Icon.Exists(actionIcon) ? "Action_Default$" : actionIcon;
        }

        private _computeOpenOnHover(overflow: boolean, openOnHover: boolean): boolean {
            return overflow || openOnHover;
        }
    }
}
