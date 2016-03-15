module Vidyano.WebComponents {
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
            query: {
                type: Object,
                computed: "_computeQuery(isAttached, service.profile, service.profiledRequests)"
            }
        },
        forwardObservers: [
            "service.profile",
            "service.profiledRequests"
        ]
    })
    export class Profiler extends WebComponent {
        private static _queryColumns: any[];
        query: Vidyano.Query;
        lastRequest: Vidyano.ServiceRequest;

        private _setLastRequest: (request: Vidyano.ServiceRequest) => void;

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
                            { key: "Server", value: request.profiler.elapsedMilliseconds + "ms" },
                            { key: "Transport", value: request.transport + "ms" },
                            { key: "SQL", value: request.profiler.sql ? request.profiler.sql.reduce((current, entry) => current + entry.elapsedMilliseconds, 0) + "ms" : "" },
                            { key: "SharpSQL", value: (request.profiler.sql ? request.profiler.sql.length : 0).toString() }
                        ]
                    })
                })
            });

            this._setLastRequest(profiledRequests[0]);

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
                // Detect N+1
                const counts = Enumerable.from(entry.sql).groupBy(commandId => Enumerable.from(profiler.sql).firstOrDefault(s => s.commandId == commandId).commandText, s => s);
                if (counts.firstOrDefault(c => c.count() > 1))
                    entry.hasNPlusOne = hasNPlusOne = true;

                if (entry.entries && entry.entries.length > 0)
                    hasNPlusOne = this._hasNPlusOne(profiler, entry.entries) || hasNPlusOne;
            });

            return hasNPlusOne;
        }

        private _close(e: TapEvent) {
            this.app.service.profile = false;

            e.stopPropagation();
        }
    }
}