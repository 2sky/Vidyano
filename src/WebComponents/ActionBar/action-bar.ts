module Vidyano.WebComponents {
    @WebComponent.register({
        properties:
        {
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
    })
    export class ActionBar extends WebComponent {
        accent: boolean = false;
        serviceObject: Vidyano.ServiceObjectWithActions;
        pinnedActions: Vidyano.Action[];
        unpinnedActions: Vidyano.Action[];
        canSearch: boolean;

        private _serviceObjectChanged() {
            this.canSearch = this.serviceObject instanceof Vidyano.Query && (<Vidyano.Query>this.serviceObject).actions["Filter"] != null;
        }

        executeAction(e: Event, details: any, sender: HTMLElement) {
            var action = this.serviceObject.actions[sender.getAttribute("data-action-name")];
            if (action)
                action.execute(parseInt(sender.getAttribute("data-option") || "-1", 10));
        }

        filterActions(actions: Vidyano.Action[], pinned: boolean): Vidyano.Action[] {
            return actions.filter(a => a.isPinned == pinned);
        }

        private _search() {
            if (!this.canSearch)
                return;

            var query = <Vidyano.Query>this.serviceObject;
            query.search();
        }

        private _computePinnedActions(): Vidyano.Action[] {
            return this.serviceObject && this.serviceObject.actions ? this.serviceObject.actions.filter(action => action.isPinned) : [];
        }

        private _computeUnpinnedActions(): Vidyano.Action[] {
            return this.serviceObject && this.serviceObject.actions ? this.serviceObject.actions.filter(action => !action.isPinned) : [];
        }

        private _computeCanSearch(serviceObject: Vidyano.ServiceObjectWithActions) {
            return serviceObject instanceof Vidyano.Query && (<Vidyano.Query>serviceObject).actions["Filter"] != null;
        }

        private _computeNoActions(pinnedActions: Vidyano.Action[], unpinnedActions: Vidyano.Action[]): boolean {
            var actions = (pinnedActions || []).concat(unpinnedActions || []);
            if (actions.length == 0)
                return true;

            return Enumerable.from(actions).where(a => a.isVisible).count() == 0;
        }
    }
}