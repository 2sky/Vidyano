namespace Vidyano.WebComponents {
    @WebComponent.register({
        properties: {
            query: Object,
            types: {
                type: Array,
                computed: "_computeTypes(query.charts, app)"
            }
        },
        forwardObservers: [
            "query.charts",
            "query.currentChart"
        ]
    })
    export class ChartSelector extends WebComponent {
        query: Vidyano.Query;

        private _computeTypes(charts: Vidyano.QueryChart[]): ChartType[] {
            if (!charts || !charts.length)
                return null;

            return charts.groupBy(c => c.type).filter(cg => !!this.app.configuration.getQueryChartConfig(cg.key)).map(ct => new ChartType(ct.key, ct.value));
        }

        private _showGrid(e: Polymer.TapEvent) {
            this.query.currentChart = null;
        }

        private _showChart(e: Polymer.TapEvent) {
            this.query.currentChart = e.model.chart || (e.model.type && e.model.type.single ? e.model.type.charts[0] : null);
        }
    }

    class ChartType {
        private _icon: string;

        constructor(private _type: string, public charts: Vidyano.QueryChart[]) {
            if (!Vidyano.WebComponents.Icon.Exists(this._icon = "Chart_" + _type))
                this._icon = "Chart_Unknown";
        }

        get icon(): string {
            return this._icon;
        }

        get type(): string {
            return this._type;
        }

        get single(): boolean {
            return this.charts.length === 1;
        }
    }
}