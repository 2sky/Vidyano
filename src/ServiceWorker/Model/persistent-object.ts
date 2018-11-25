/// <reference path="wrappers.ts" />

namespace Vidyano {
    const _PersistentObjectWritableProperties = {
        "actions": 1,
        "breadcrumb": 1,
        "isNew": 1,
        "label": 1,
        "notification": 1,
        "notificationType": 1,
        "notificationDuration": 1,
        "stateBehavior": 1
    };
    const PersistentObjectWritableProperties = Object.keys(_PersistentObjectWritableProperties) as (keyof typeof _PersistentObjectWritableProperties)[];

    export type PersistentObject = Wrappers.Wrap<Service.PersistentObject, typeof PersistentObjectWritableProperties[number], Wrappers.PersistentObjectWrapper>;
    export type ReadOnlyPersistentObject = Readonly<PersistentObject>;

    export namespace Wrappers {
        export class PersistentObjectWrapper extends Wrapper<Service.PersistentObject> {
            private readonly _attributes: PersistentObjectAttribute[];
            private readonly _queries: ReadOnlyQuery[];

            private constructor(private _obj: Service.PersistentObject, private _db: IndexedDB) {
                super();

                this._attributes = (this._obj.attributes || []).map(attr => attr.type !== "Reference" ? PersistentObjectAttributeWrapper._wrap(attr) : PersistentObjectAttributeWithReferenceWrapper._wrap(<Service.PersistentObjectAttributeWithReference>attr));
                this._queries = QueryWrapper._wrap(this._obj.queries || []);
            }

            get queries(): ReadOnlyQuery[] {
                return this._queries;
            }

            getQuery(name: string): ReadOnlyQuery {
                return this.queries.find(q => q.name === name);
            }

            get attributes(): PersistentObjectAttribute[] {
                return this._attributes;
            }

            getAttribute(name: string): PersistentObjectAttribute {
                return this.attributes.find(a => a.name === name);
            }

            protected _unwrap(): Service.PersistentObject {
                return super._unwrap(PersistentObjectWritableProperties, "queries", "attributes");
            }

            static _unwrap(obj: PersistentObject): Service.PersistentObject {
                return obj ? obj._unwrap() : null;
            }
        }
    }
}