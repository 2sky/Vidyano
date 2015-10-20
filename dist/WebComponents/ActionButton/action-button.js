var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var ActionButton = (function (_super) {
            __extends(ActionButton, _super);
            function ActionButton(item, action) {
                _super.call(this);
                this.item = item;
                this.action = action;
                if (item && action) {
                    var args = {
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
            ActionButton.prototype._executeWithoutOptions = function (e) {
                if (!this.canExecute) {
                    e.stopPropagation();
                    return;
                }
                if (!this.options)
                    this._execute();
                e.preventDefault();
            };
            ActionButton.prototype._executeWithOption = function (e) {
                if (!this.canExecute) {
                    e.stopPropagation();
                    return;
                }
                this._execute(e.model.index);
            };
            ActionButton.prototype._execute = function (option) {
                if (option === void 0) { option = -1; }
                if (this.canExecute) {
                    if (!this.item)
                        this.action.execute(option);
                    else
                        this.action.execute(option, null, [this.item]);
                }
            };
            ActionButton.prototype._observeAction = function (canExecute, isVisible, options) {
                if (!this.isAttached || this._skipObserver)
                    return;
                this._setCanExecute(this.item ? this.action.definition.selectionRule(1) : this.action.canExecute);
                this._setHidden(!this.action.isVisible);
                this._setOptions(this.action.options && this.action.options.length > 0 ? this.action.options : null);
            };
            ActionButton.prototype._computeIcon = function (action) {
                if (!action)
                    return "";
                var actionIcon = "Action_" + action.definition.name;
                return action.isPinned && !WebComponents.Icon.Exists(actionIcon) ? "Action_Default$" : actionIcon;
            };
            ActionButton = __decorate([
                WebComponents.WebComponent.register({
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
                            reflectToAttribute: true
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
            ], ActionButton);
            return ActionButton;
        })(WebComponents.WebComponent);
        WebComponents.ActionButton = ActionButton;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
