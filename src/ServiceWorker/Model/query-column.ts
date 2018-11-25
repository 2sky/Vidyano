/// <reference path="wrappers.ts" />

namespace Vidyano {
    const _QueryColumnWritableProperties = {
        "canSort": 1,
        "label": 1,
        "offset": 1
    };
    const QueryColumnWritableProperties = Object.keys(_QueryColumnWritableProperties) as (keyof typeof _QueryColumnWritableProperties)[];

    export type QueryColumn = Wrappers.Wrap<Service.QueryColumn, typeof QueryColumnWritableProperties[number], Wrappers.QueryColumnWrapper>;
    export type ReadOnlyQueryColumn = Readonly<QueryColumn>;

    export namespace Wrappers {
        export class QueryColumnWrapper extends Wrapper<Service.QueryColumn> {
            private constructor(private _column: Service.QueryColumn) {
                super();
            }

            static _unwrap(obj: QueryColumn): Service.QueryColumn {
                return obj ? obj._unwrap(QueryColumnWritableProperties) : null;
            }
        }
    }
}