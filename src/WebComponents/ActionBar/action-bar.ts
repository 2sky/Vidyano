module Vidyano.WebComponents {
    @WebComponent.register({
        properties:
        {
            serviceObject: Object,
            pinnedActions: {
                type: Array,
                computed: "_computePinnedActions(serviceObject)"
            },
            unpinnedActions: {
                type: Array,
                computed: "_computeUnpinnedActions(serviceObject)"
            },
            hasCharts: {
                type: Boolean,
                computed: "_computeHasCharts(serviceObject.charts, isAttached)"
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
        },
        forwardObservers: [
            "serviceObject.charts"
        ]
    })
    export class ActionBar extends WebComponent {
        accent: boolean = false;
        serviceObject: Vidyano.ServiceObjectWithActions;
        pinnedActions: Vidyano.Action[];
        unpinnedActions: Vidyano.Action[];
        canSearch: boolean;

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

        private _computeHasCharts(charts: linqjs.Enumerable<Vidyano.QueryChart>): boolean {
            return !!charts && !!charts.firstOrDefault(c => !!this.app.configuration.getQueryChartConfig(c.type));
        }

        private _computeCanSearch(serviceObject: Vidyano.ServiceObjectWithActions): boolean {
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