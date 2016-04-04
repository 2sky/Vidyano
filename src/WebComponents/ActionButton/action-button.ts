namespace Vidyano.WebComponents {
    "use strict";

    @WebComponent.register({
        properties: {
            action: Object,
            item: Object,
            icon: {
                type: String,
                computed: "_computeIcon(action)"
            },
            hasIcon: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeHasIcon(icon)"
            },
            siblingIcon: {
                type: Boolean,
                readOnly: true
            },
            iconSpace: {
                type: Boolean,
                reflectToAttribute: true,
                computed: "_computeIconSpace(icon, siblingIcon, overflow)"
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
            overflow: {
                type: Boolean,
                reflectToAttribute: true
            },
            canExecute: {
                type: Boolean,
                readOnly: true
            },
            disabled: {
                type: Boolean,
                computed: "_computeDisabled(canExecute)",
                reflectToAttribute: true
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
            openOnHover: {
                type: Boolean,
                reflectToAttribute: true,
                value: null
            },
            title: {
                type: String,
                reflectToAttribute: true,
                computed: "_computeTitle(action, pinned)"
            }
        },
        observers: [
            "_observeAction(action.canExecute, action.isVisible, action.options, isAttached)",
            "_computeSiblingIcon(overflow, isAttached)"
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
        options: linqjs.KeyValuePair<number, string>[];
        canExecute: boolean;
        noLabel: boolean;
        openOnHover: boolean;
        forceLabel: boolean;

        private _setCanExecute: (val: boolean) => void;
        private _setHidden: (val: boolean) => void;
        private _setOptions: (val: linqjs.KeyValuePair<number, string>[]) => void;
        private _setSiblingIcon: (val: boolean) => void;

        constructor(public item: Vidyano.QueryResultItem, public action: Action) {
            super();

            if(item && action) {
                const args: ISelectedItemsActionArgs = {
                    name: action.name,
                    isVisible: action.isVisible,
                    canExecute: action.definition.selectionRule(1),
                    options: action.options
                };

                action.service.hooks.onSelectedItemsActions(item.query, [item], args);

                this._setCanExecute(args.canExecute);
                this._setHidden(!args.isVisible);
                this._setOptions(args.options && args.options.length > 0 ? args.options.map((value: string, index: number) => {
                    return {
                        key: index,
                        value: value
                    };
                }) : null);

                this._skipObserver = true;
            }
        }

        private _onExecuteWithoutOptions(e: TapEvent) {
            if (!this.canExecute) {
                e.stopPropagation();
                return;
            }

            if (!this.options)
                this._execute();

            e.preventDefault();
        }

        private _onExecuteWithOption(e: TapEvent) {
            if (!this.canExecute) {
                e.stopPropagation();
                return;
            }

            this._execute(e.model.option.key);
        }

        private _execute(option: number = -1) {
            if (this.canExecute) {
                if (!this.item)
                    this.action.execute({
                        menuOption: option
                    });
                else {
                    this.action.execute({
                        menuOption: option,
                        parameters: this.options && option < this.options.length ? { MenuLabel: this.options[option].value } : null,
                        selectedItems: [this.item]
                    });
                }
            }
        }

        private _observeAction(canExecute: boolean, isVisible: boolean, options: boolean) {
            if(!this.isAttached || this._skipObserver)
                return;

            this._setCanExecute(this.item ? this.action.definition.selectionRule(1) : this.action.canExecute);
            this._setHidden(!this.action.isVisible);
            this._setOptions(this.action.options && this.action.options.length > 0 ? this.action.options.map((value: string, index: number) => {
                return {
                    key: index,
                    value: value
                };
            }) : null);
        }

        private _computeDisabled(canExecute: boolean): boolean {
            return !canExecute;
        }

        private _computeTitle(action: Vidyano.Action, pinned: boolean): string {
            return pinned ? action.displayName : null;
        }

        private _computeIcon(action: Action): string {
            if (!action)
                return "";

            const actionIcon = `Action_${action.definition.name}`;
            return action.isPinned && !Icon.Exists(actionIcon) ? "Action_Default$" : actionIcon;
        }

        private _computeHasIcon(icon: string): boolean {
            return !StringEx.isNullOrEmpty(icon) && Vidyano.WebComponents.Icon.Exists(icon);
        }

        private _computeIconSpace(icon: string, siblingIcon: boolean, overflow: boolean): boolean {
            return overflow && !Icon.Exists(icon) && siblingIcon;
        }

        private _computeSiblingIcon(overflow: boolean, isAttached: boolean) {
            const siblingIcon = overflow && isAttached && this.parentElement != null && Enumerable.from(this.parentElement.children).firstOrDefault((c: ActionButton) => c.action && Icon.Exists(this._computeIcon(c.action))) != null;
            this._setSiblingIcon(siblingIcon);
            if (siblingIcon) {
                Enumerable.from(this.parentElement.children).forEach((ab: ActionButton) => {
                    if (ab instanceof Vidyano.WebComponents.ActionButton && ab !== this)
                        ab._setSiblingIcon(true);
                });
            }
        }

        private _computeOpenOnHover(overflow: boolean, openOnHover: boolean): boolean {
            return overflow || openOnHover;
        }
    }
}
