module Vidyano.WebComponents {
    var d3timer = <any>d3.timer;
    d3.timer = <any>function(callback, delay, then) {
        d3timer(callback, 0, 0);
    };

    interface ProfilerServiceRequest extends Vidyano.ServiceRequest {
        resultItem: {
            id: string | number;
            breadcrumb ?: string;
            typeHints ?: { [name: string]: string };
            values: {
                key: string;
                value: string;
                typeHints ?: { [name: string]: string };
            } [];
        };
        parameters: {
            [name: string]: string;
        };
        flattenedEntries: FlattenedServiceRequestProfilerEntry[];
    }

    interface FlattenedServiceRequestProfilerEntry {
        entry: ServiceRequestProfilerEntry;
        level: number;
    }

    @WebComponent.register({
        properties: {
            service: Object,
            awaiting: {
                type: String,
                value: "Awaiting next request..."
            },
            lastRequest: {
                type: Object,
                readOnly: true
            },
            lastRequestParameters: {
                type: Array,
                computed: "_computeLastRequestParameters(lastRequest)"
            },
            selectedRequest: {
                type: Object,
                readOnly: true,
                observer: "_selectedRequestChanged"
            },
            hoveredEntry: {
                type: Object,
                readOnly: true,
                value: null
            },
            query: {
                type: Object,
                computed: "_computeQuery(isAttached, service.profile, service.profiledRequests)"
            },
            timelineSize: Object,
            zoom: {
                type: Number,
                readOnly: true,
                value: 1
            }
        },
        forwardObservers: [
            "service.profile",
            "service.profiledRequests"
        ],
        observers: [
            "_renderRequestTimeline(selectedRequest, timelineSize, zoom)"
        ]
    })
    export class Profiler extends WebComponent {
        private static _queryColumns: any[];
        private _boundMousehweel = this._onMousewheel.bind(this);
        query: Vidyano.Query;
        lastRequest: Vidyano.ServiceRequest;
        selectedRequest: Vidyano.ServiceRequest;
        zoom: number;
        timelineSize: Size;

        private _setLastRequest: (request: Vidyano.ServiceRequest) => void;
        private _setSelectedRequest: (request: Vidyano.ServiceRequest) => void;
        private _setHoveredEntry: (entry: ServiceRequestProfilerEntry) => void;
        private _setZoom: (value: number) => void;

        attached() {
            super.attached();

            this.$["timeline"].addEventListener("DOMMouseScroll", this._boundMousehweel);
        }

        detached() {
            super.detached();

            this.$["timeline"].removeEventListener("DOMMouseScroll", this._boundMousehweel);
        }

        private _computeQuery(isAttached: boolean, profile: boolean, profiledRequests: ProfilerServiceRequest[]): Vidyano.Query {
            if (!isAttached || !profile)
                return null;

            const query = this.query || Vidyano.Query.FromJsonData(this.app.service, {
                label: "Profiler",
                columns: Profiler._queryColumns || (Profiler._queryColumns = [
                    { name: "HasWarnings", label: "", type: "Image", width: "30px", typeHints: { "Width": "30", "Height": "30" } },
                    { name: "When", label: "When?", type: "DateTime", width: "90px", typeHints: { "DisplayFormat": "{0:HH:mm:ss}" } },
                    { name: "Method", label: "Method", type: "String", width: "150px" },
                    { name: "Parameters", label: "Parameters", type: "String", width: "200px" },
                    { name: "Server", label: "Server", type: "String", width: "90px" },
                    { name: "Transport", label: "Transport", type: "String", width: "90px" },
                    { name: "SQL", label: "SQL", type: "String", width: "90px" },
                    { name: "SharpSQL", label: "#SQL", type: "String", width: "90px" }
                ]),
                items: []
            });

            query._setResult({
                columns: Profiler._queryColumns,
                items: profiledRequests.map(request => {
                    return request.resultItem || (request.resultItem = {
                        id: Unique.get(),
                        values: [
                            { key: "HasWarnings", value: this._hasNPlusOne(request.profiler) || (request.profiler.exceptions && request.profiler.exceptions.length > 0) ? "iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABTAAAAUwBaYa9OQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKISURBVEiJ7ZbfS1NhHMafs3czdIII5gwvDL0JgrCLbiLN/0DL/oPwJggHlU7DCFIRQcuuK7vW/NHlcsicdTMhQ4NSWVMC8YhTdGOHufO+Tzdq2RbzzIUIPnDg8D4vz+f9vue8PzSSOAnZToR6Bj4NYA1AE4B7e+/WRTKbx8PfassmQ8tiOZVRypA+OlYApeC60xjXhKgCsPa/K34tEwkZqKhkoKKSKpGQJF9ZzbEKvaqUUj+6uumFoBeCoc4uUilFsvq/gZVpTid03fQVFh2AfYVFTOi6SdMMWMmy8lc3akLcWPK0CxmLHTTKWAyLrW0CQtQAuJ3rb3xOmebKzuwX+cHm4GRxCTcmfNyY8HGyuIRezc6dz7NS7e6ukMzL5VS3kmSwto5eCPrLyg/Wkr+snF4IBmtu7je15GqqXVCqY31klFuB6X922pr+CP3dCCjlEwClmUKPAu6klPkLj1oz7lCLLR5AqXwAz44LriZ5d7mv32aEwxlHaITDWO7rt4FsAnAlazClHEhGIirc3ZMRuq9wdw+SkYiClAPZgm9pQtQutT0WZjR6yJCGgbWhYawNDUMaxiHPjEax6GkXEKIOQL1VcB6lfB6bm5erbwZTXaUg43HIeBxQKsVeHXyL6Ny8YjL5AkCeFbBbE6Lie7NbME2wcDrhaqiHq6EewulM8akUFprdNs3huAjg/lHBpVCqY338PTf9U2lHJQ0D28EZbAdnUqZ6X5v+Kehj46CUTwGU/O2nOxZ7aZoPPl26bIuHQmlDj6qCqipc//aVNofjJQD3n549Tf8L0DTt2tRk8ljUPWl2uwNpNpR0FRcBeAjgfC7AAH4C6AVwqJBsbiA50am7ZZ6BLesXm5TlWBFDkl8AAAAASUVORK5CYII=" : "" },
                            { key: "When", value: Service.toServiceString(request.when, "DateTime") },
                            { key: "Method", value: request.method },
                            { key: "Parameters", value: this._computeParameters(request) },
                            { key: "Server", value: this._formatMs(request.profiler.elapsedMilliseconds) },
                            { key: "Transport", value: this._formatMs(request.transport) },
                            { key: "SQL", value: request.profiler.sql ? this._formatMs(request.profiler.sql.reduce((current, entry) => current + entry.elapsedMilliseconds, 0)) : "0ms" },
                            { key: "SharpSQL", value: (request.profiler.sql ? request.profiler.sql.length : 0).toString() }
                        ]
                    })
                })
            });

            this._setLastRequest(profiledRequests[0]);
            if (!this.selectedRequest)
                this._setSelectedRequest(this.lastRequest);

            return query;
        }

        private _computeParameters(request: ProfilerServiceRequest): string {
            if (!request.parameters)
                request.parameters = {};

            switch (request.method) {
                case "GetPersistentObject":
                    return `(${request.parameters["Type"] = request.response.result.type}, ${request.parameters["Id"] = request.response.result.objectId})`;

                case "GetQuery":
                    return `(${request.parameters["Name"] = request.response.query.name})`;

                case "ExecuteAction":
                    return `(${request.parameters["Name"] = request.request.action})`;

                case "ExecuteQuery": {
                    let parameters = `(${request.parameters["Name"] = request.request.query.name}, ${request.parameters["PageSize"] = request.request.query.pageSize}`;
                    if (request.request.query.top)
                        parameters = `${parameters}, ${request.parameters["Top"] = request.request.query.top}`;
                    if (request.request.query.skip)
                        parameters = `${parameters}, ${request.parameters["Skip"] = request.request.query.skip}`;

                    return `${parameters})`;
                }
            }
        }

        private _computeLastRequestParameters(request: ProfilerServiceRequest): { key: string; value: string; }[] {
            return Enumerable.from(<any>request.parameters).toArray();
        }

        private _hasNPlusOne(profiler: ServiceRequestProfiler, entries: ServiceRequestProfilerEntry[] = profiler.entries): boolean {
            if (!entries)
                return false;

            let hasNPlusOne = false;
            entries.forEach(entry => {
                const counts = Enumerable.from(entry.sql).groupBy(commandId => Enumerable.from(profiler.sql).firstOrDefault(s => s.commandId == commandId).commandText, s => s);
                if (counts.firstOrDefault(c => c.count() > 1))
                    entry.hasNPlusOne = hasNPlusOne = true;

                if (entry.entries && entry.entries.length > 0)
                    hasNPlusOne = this._hasNPlusOne(profiler, entry.entries) || hasNPlusOne;
            });

            return hasNPlusOne;
        }

        private _onMousewheel(e: MouseWheelEvent) {
            const scroller = <Scroller>this.$["timelineScroller"];

            var rect = scroller.getBoundingClientRect();
			var offsetX = e.pageX - rect.left - window.pageXOffset;
            const mousePctg = 1 / scroller.outerWidth * offsetX;

            const isZoomIn = (e.wheelDelta || -e.detail) > 0;
            const newZoom = Math.max(isZoomIn ? this.zoom * 1.1 : this.zoom / 1.1, 1);
            const newInnerWidth = (this.timelineSize.width - 2) * newZoom;

            this._setZoom(newZoom);

            scroller.horizontalScrollOffset = (newInnerWidth - scroller.outerWidth) * mousePctg;
        }

        private _selectedRequestChanged() {
            this._setZoom(1);
        }

        private _renderRequestTimeline(request: ProfilerServiceRequest, size: Size, zoom: number) {
            const width = (size.width - 2) * zoom; // Strip vi-scroller borders
            const headerHeight = parseInt(this.getComputedStyleValue("--vi-profiler-header-height"));
            const entryHeight = parseInt(this.getComputedStyleValue("--vi-profiler-entry-height"));
            const entryLevelGap = parseInt(this.getComputedStyleValue("--vi-profiler-entry-level-gap"));
            const scale = d3.scale.linear().domain([0, request.profiler.elapsedMilliseconds]).range([0, width]);

            const svg = d3.select(this.$["timeline"]).
                attr("width", width).
                attr("height", size.height);

            // Render x-axis
            var xAxis = d3.svg.axis()
                .scale(scale.copy().rangeRound([0, width - 12]))
                .orient("top")
                .tickSize(-size.height, 0)
                .tickFormat(d => this._formatMs(d));

            var xAxisGroup = svg.selectAll('g.xaxis')
                .attr('transform', `translate(0, ${headerHeight})`)
                .call(xAxis);

            xAxisGroup.selectAll("line")
                .attr("stroke-dasharray", "6, 4");

            xAxisGroup.selectAll("text")
                .style("text-anchor", "middle")
                .attr("dy", "-0.5em");

            // Render entries
            let entriesGroup = svg.select(".entries");
            if (entriesGroup.empty())
                entriesGroup = svg.append("g").classed("entries", true);

            const entryGroupSelection = entriesGroup.selectAll("g.entry").data(request.flattenedEntries || (request.flattenedEntries = this._flattenEntries(request.profiler.entries)));
            const entryGroup = entryGroupSelection.enter()
                .append("g")
                .attr("class", e => this._computeEntryClassName(e.entry));

            entryGroup.append("rect")
                .attr("x", e => scale(e.entry.started || 0))
                .attr("y", e => size.height - (e.level * entryHeight) - (e.level * entryLevelGap))
                .attr("width", e => e.entry.elapsedMilliseconds ? scale(e.entry.elapsedMilliseconds) : 1)
                .attr("height", entryHeight);

            entryGroup
                .append("foreignObject")
                .attr("x", e => scale(e.entry.started || 0))
                .attr("y", e => size.height - (e.level * entryHeight) - (e.level * entryLevelGap))
                .attr("width", e => e.entry.elapsedMilliseconds ? scale(e.entry.elapsedMilliseconds) : 1)
                .attr("height", entryHeight)
                .html(e => `<div class="text" style="width: ${e.entry.elapsedMilliseconds ? scale(e.entry.elapsedMilliseconds) : 1}px;">` + e.entry.methodName + "</div>")
                .on("mouseenter", e => this._setHoveredEntry(e.entry))
                .on("mouseleave", e => this._setHoveredEntry(null));

            const entryGroupTransition = entryGroupSelection.transition().duration(0)
                .attr("class", e => this._computeEntryClassName(e.entry));

            entryGroupTransition
                .select("rect")
                .attr("x", e => scale(e.entry.started || 0))
                .attr("y", e => size.height - (e.level * entryHeight) - (e.level * entryLevelGap))
                .attr("width", e => e.entry.elapsedMilliseconds ? scale(e.entry.elapsedMilliseconds) : 1)
                .attr("height", entryHeight);

            entryGroupTransition.select("foreignObject")
                .attr("x", e => scale(e.entry.started || 0))
                .attr("y", e => size.height - (e.level * entryHeight) - (e.level * entryLevelGap))
                .attr("width", e => e.entry.elapsedMilliseconds ? scale(e.entry.elapsedMilliseconds) : 1)
                .attr("height", entryHeight)
                .select(".text")
                .attr("style", e => `width: ${e.entry.elapsedMilliseconds ? scale(e.entry.elapsedMilliseconds) : 1}px;`)
                .text(e => e.entry.methodName);

            entryGroupSelection.exit().remove();
        }

        private _flattenEntries(entries: ServiceRequestProfilerEntry[], level: number = 1, flattenedEntries: FlattenedServiceRequestProfilerEntry[] = []): FlattenedServiceRequestProfilerEntry[] {
            entries.forEach(entry => {
                flattenedEntries.push({
                    entry: entry,
                    level: level
                });

                this._flattenEntries(entry.entries, level + 1, flattenedEntries);
            });

            return flattenedEntries;
        };

        private _computeEntryClassName(e: ServiceRequestProfilerEntry): string {
            let className = "entry";
            let hasDetails = false;

            if (e.sql && e.sql.length > 0) {
                className = `${className} has-sql`;

                if (e.hasNPlusOne)
                    className = `${className} has-n-plus-one`;

                hasDetails = true;
            }

            if (e.exception)
                className = `${className} has-exception`;

            if (e.arguments)
                hasDetails = true;

            if (hasDetails)
                className = `${className} has-details`;

            return className;
        }

        private _formatMs(ms: number): string {
            return `${ms || 0}ms`;
        }

        private _gridItemTap(e: CustomEvent, detail: { item: QueryResultItem; }) {
            this._setSelectedRequest(Enumerable.from(<ProfilerServiceRequest[]>this.app.service.profiledRequests).firstOrDefault(r => r.resultItem.id === detail.item.id));
        }

        private _close(e: TapEvent) {
            this.app.service.profile = false;

            e.stopPropagation();
        }
    }
}