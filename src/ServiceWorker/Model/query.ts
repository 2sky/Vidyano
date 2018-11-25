/// <reference path="wrappers.ts" />

namespace Vidyano {
    const _QueryWritableProperties = {
        "actionLabels": 1,
        "allowTextSearch": 1,
        "label": 1,
        "enableSelectAll": 1,
        "notification": 1,
        "notificationType": 1,
        "notificationDuration": 1,
        "sortOptions": 1,
        "textSearch": 1
    };
    const QueryWritableProperties = Object.keys(_QueryWritableProperties) as (keyof typeof _QueryWritableProperties)[];

    export type Query = Wrappers.Wrap<Service.Query, typeof QueryWritableProperties[number], Wrappers.QueryWrapper>;
    export type ReadOnlyQuery = Readonly<Query>;

    export namespace Wrappers {
        export class QueryWrapper extends Wrapper<Service.Query> {
            private readonly _columns: QueryColumn[];
            private readonly _persistentObject: ReadOnlyPersistentObject;
            private _result: QueryResult;

            private constructor(private _query: Service.Query, private _transaction: idb.Transaction) {
                super();

                this._columns = QueryColumnWrapper._wrap(this._query.columns || []);
                this._persistentObject = PersistentObjectWrapper._wrap(this._query.persistentObject);
            }

            get columns(): QueryColumn[] {
                return this._columns;
            }

            get persistentObject(): ReadOnlyPersistentObject {
                return this._persistentObject;
            }

            get result(): QueryResult {
                return this._result || (this._result = this._query.result ? QueryResultWrapper._wrap(this._query.result) : QueryResultWrapper.fromQuery(<Query><any>this));
            }

            protected _unwrap(): Service.Query {
                return super._unwrap(QueryWritableProperties, "columns", "persistentObject", "result");
            }

            static _unwrap(obj: Query): Service.Query {
                return obj ? obj._unwrap() : null;
            }
        }
    }
}