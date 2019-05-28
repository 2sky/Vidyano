/// <reference path="wrappers.ts" />

namespace Vidyano {
    const _PersistentObjectAttributeWritableProperties = {
        "label": 1,
        "group": 1,
        "isValueChanged": 1,
        "offset": 1,
        "tab": 1,
        "visibility": 1
    };
    const PersistentObjectAttributeWritableProperties = Object.keys(_PersistentObjectAttributeWritableProperties) as (keyof typeof _PersistentObjectAttributeWritableProperties)[];

    export type PersistentObjectAttribute = Wrappers.Wrap<Service.PersistentObjectAttribute, typeof PersistentObjectAttributeWritableProperties[number], Wrappers.PersistentObjectAttributeWrapper>;
    export type ReadOnlyPersistentObjectAttribute = Readonly<PersistentObjectAttribute>;

    const _PersistentObjectAttributeWithReferenceWritableProperties = { ..._PersistentObjectAttributeWritableProperties };
    const PersistentObjectAttributeWithReferenceWritableProperties = Object.keys(_PersistentObjectAttributeWritableProperties) as (keyof typeof _PersistentObjectAttributeWritableProperties)[];

    export type PersistentObjectAttributeWithReference = Wrappers.Wrap<Service.PersistentObjectAttributeWithReference, typeof PersistentObjectAttributeWithReferenceWritableProperties[number], Wrappers.PersistentObjectAttributeWithReferenceWrapper>;
    export type ReadOnlyPersistentObjectAttributeWithReference = Readonly<PersistentObjectAttributeWithReference>;

    export namespace Wrappers {
        export class PersistentObjectAttributeWrapper extends Wrapper<Service.PersistentObjectAttribute> {
            private _value: any;

            protected constructor(private _attr: Service.PersistentObjectAttribute) {
                super();
            }

            get value(): any {
                return this._attr.value;
            }

            set value(value: any) {
                this._attr.value = this._value = value;
                this._attr.isValueChanged = true;
            }

            get isReadOnly(): boolean {
                return this._attr.isReadOnly;
            }

            set isReadOnly(readOnly: boolean) {
                if (readOnly)
                    this._attr.isReadOnly = readOnly;
                else
                    console.error("Read-only cannot be disabled.");
            }

            get isReference(): boolean {
                return false;
            }

            protected _unwrap(writableProperties: string[] = [], ...children: string[]): Service.PersistentObjectAttribute {
                return super._unwrap(writableProperties.concat(PersistentObjectAttributeWritableProperties), ...children.concat(["isValueChanged", "isReadOnly", "value"]));
            }

            static _unwrap(obj: PersistentObjectAttribute): Service.PersistentObjectAttribute {
                return obj ? obj._unwrap() : null;
            }
        }

        export class PersistentObjectAttributeWithReferenceWrapper extends PersistentObjectAttributeWrapper {
            private constructor(private _attrWithReference: Service.PersistentObjectAttributeWithReference) {
                super(_attrWithReference);
            }

            get objectId(): string {
                return this._attrWithReference.objectId;
            }

            set objectId(objectId: string) {
                this._attrWithReference.objectId = objectId;
                this._attrWithReference.isValueChanged = true;
            }

            get isReference(): boolean {
                return true;
            }

            protected _unwrap(): Service.PersistentObjectAttributeWithReference {
                return <Service.PersistentObjectAttributeWithReference>super._unwrap(PersistentObjectAttributeWithReferenceWritableProperties, "objectId");
            }

            static _unwrap(obj: PersistentObjectAttributeWithReference): Service.PersistentObjectAttributeWithReference {
                return obj ? obj._unwrap() : null;
            }
        }
    }
}