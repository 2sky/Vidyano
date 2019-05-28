/// <reference path="wrappers.ts" />

namespace Vidyano {
    export type QueryResultItemValue = Readonly<Service.QueryResultItemValue> & Wrappers.QueryResultItemValueWrapper;

    export namespace Wrappers {
        export class QueryResultItemValueWrapper extends Wrapper<Service.QueryResultItemValue> {
            private constructor(private _value: Service.QueryResultItemValue) {
                super();
            }

            static _unwrap(obj: QueryResultItemValue): Service.QueryResultItemValue {
                return obj ? obj._unwrap() : null;
            }
        }
    }
}