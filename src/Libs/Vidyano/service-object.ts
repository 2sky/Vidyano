namespace Vidyano {

    export class ServiceObject extends Vidyano.Common.Observable<ServiceObject> {
        constructor(public service: Service) {
            super();
        }

        copyProperties(propertyNames: Array<string>, includeNullValues?: boolean, result?: any): any {
            result = result || {};
            propertyNames.forEach(p => {
                const value = this[p];
                if (includeNullValues || (value != null && value !== false && (value !== 0 || p === "pageSize") && (!Array.isArray(value) || value.length > 0)))
                    result[p] = value;
            });
            return result;
        }
    }
}