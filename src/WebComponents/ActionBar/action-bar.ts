namespace Vidyano.WebComponents {
    "use strict";

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
            hasCharts: {
                type: Boolean,
                readOnly: true
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
        observers: [
            "_computeHasCharts(serviceObject.charts)"
        ],
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

        private _setHasCharts: (val: boolean) => void;

        filterActions(actions: Vidyano.Action[], pinned: boolean): Vidyano.Action[] {
            return actions.filter(a => a.isPinned === pinned);
        }

        private _serviceObjectChanged(serviceObject: Vidyano.ServiceObject) {
            if (!this.isAttached)
                return;

            if (serviceObject instanceof Vidyano.Query)
                this._computeHasCharts(serviceObject.charts, this.isAttached);
            else
                this._setHasCharts(false);
        }

        private _computeHasCharts(charts: linqjs.Enumerable<Vidyano.QueryChart>, isAttached: boolean) {
            this._setHasCharts(isAttached && !!charts && !!charts.firstOrDefault(c => !!this.app.configuration.getQueryChartConfig(c.type)));
        }

        private _search() {
            if (!this.canSearch)
                return;

            const query = <Vidyano.Query>this.serviceObject;
            query.search();
        }

        private _computePinnedActions(): Vidyano.Action[] {
            return this.serviceObject && this.serviceObject.actions ? this.serviceObject.actions.filter(action => action.isPinned) : [];
        }

        private _computeUnpinnedActions(): Vidyano.Action[] {
            return this.serviceObject && this.serviceObject.actions ? this.serviceObject.actions.filter(action => !action.isPinned) : [];
        }

        private _computeCanSearch(serviceObject: Vidyano.ServiceObjectWithActions): boolean {
            return serviceObject instanceof Vidyano.Query && (<Vidyano.Query>serviceObject).actions["Filter"] != null;
        }

        private _computeNoActions(pinnedActions: Vidyano.Action[], unpinnedActions: Vidyano.Action[]): boolean {
            const actions = (pinnedActions || []).concat(unpinnedActions || []);
            if (actions.length === 0)
                return true;

            return Enumerable.from(actions).where(a => a.isVisible).count() === 0;
        }
    }
}