var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var ActionBar = (function (_super) {
            __extends(ActionBar, _super);
            function ActionBar() {
                _super.apply(this, arguments);
                this.accent = false;
            }
            ActionBar.prototype._serviceObjectChanged = function () {
                this.canSearch = this.serviceObject instanceof Vidyano.Query && this.serviceObject.actions["Filter"] != null;
            };
            ActionBar.prototype.executeAction = function (e, details, sender) {
                var action = this.serviceObject.actions[sender.getAttribute("data-action-name")];
                if (action)
                    action.execute(parseInt(sender.getAttribute("data-option") || "-1", 10));
            };
            ActionBar.prototype.filterActions = function (actions, pinned) {
                return actions.filter(function (a) { return a.definition.isPinned == pinned; });
            };
            ActionBar.prototype._search = function () {
                if (!this.canSearch)
                    return;
                var query = this.serviceObject;
                query.search();
            };
            ActionBar.prototype._computePinnedActions = function () {
                return this.serviceObject && this.serviceObject.actions ? this.serviceObject.actions.filter(function (action) { return action.definition.isPinned; }) : [];
            };
            ActionBar.prototype._computeUnpinnedActions = function () {
                return this.serviceObject && this.serviceObject.actions ? this.serviceObject.actions.filter(function (action) { return !action.definition.isPinned; }) : [];
            };
            ActionBar.prototype._computeCanSearch = function (serviceObject) {
                return serviceObject instanceof Vidyano.Query && serviceObject.actions["Filter"] != null;
            };
            ActionBar.prototype._computeNoActions = function (pinnedActions, unpinnedActions) {
                var actions = (pinnedActions || []).concat(unpinnedActions || []);
                if (actions.length == 0)
                    return true;
                return Enumerable.from(actions).where(function (a) { return a.isVisible; }).count() == 0;
            };
            return ActionBar;
        })(WebComponents.WebComponent);
        WebComponents.ActionBar = ActionBar;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.ActionBar, Vidyano.WebComponents, "vi", {
    properties: {
        serviceObject: {
            type: Object,
            observer: "_serviceObjectChanged"
        },
        pinnedActions: {
            type: Array,
            computed: "_computePinnedActions(serviceObject)"
        },
        unpinnedActions: {
            type: Array,
            computed: "_computeUnpinnedActions(serviceObject)"
        },
        canSearch: {
            type: Boolean,
            computed: "_computeCanSearch(serviceObject)"
        },
        noActions: {
            type: Boolean,
            reflectToAttribute: true,
            computed: "_computeNoActions(pinnedActions, unpinnedActions)"
        }
    }
});
