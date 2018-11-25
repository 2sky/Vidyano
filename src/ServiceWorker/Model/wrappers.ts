namespace Vidyano {
    export namespace Wrappers {
        export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
        export type Overwrite<T, U> = Omit<T, Extract<keyof T, keyof U>> & U;

        /*
         * Creates a wrapped type taking all properties from ServiceType and makes them readonly except for the ones passed in Writable.
         * Any property defined on the WrapperType will win over any property taken from ServiceType.
         */
        export type Wrap<ServiceType, Writable extends keyof ServiceType, WrapperType> = Overwrite<Readonly<Omit<ServiceType, Writable>> & Pick<ServiceType, Writable>, WrapperType> & WrapperType;

        export abstract class Wrapper<T> {
            private __wrappedProperties__: (keyof T)[] = [];

            /*
             * For internal use only
             */
            protected _unwrap(writableProperties: string[] = [], ...children: string[]): T {
                const result: any = {};

                const properties = Array.from(new Set(writableProperties.concat(<string[]>this.__wrappedProperties__)));
                for (let i = 0; i < properties.length; i++) {
                    const prop = properties[i];
                    result[prop] = (<any>this)[prop];
                }

                for (let i = 0; i < children.length; i++) {
                    const prop = children[i];
                    const child = (<any>this)[prop];
                    if (Array.isArray(child))
                        result[prop] = child.map(c => c instanceof Wrapper ? c._unwrap() : c);
                    else
                        result[prop] = child instanceof Wrapper ? child._unwrap() : child;
                }

                return result as T;
            }

            /*
             * For internal use only
             */
            static _wrap<T, U>(object: U, ...args: any[]): T;
            static _wrap<T, U>(objects: U[], ...args: any[]): T[];
            static _wrap<T, U>(objects: U | U[], ...args: any[]): T | T[] {
                const array = Array.isArray(objects);
                const results = (array ? <U[]>objects : [<U>objects]).map(object => {
                    if (object instanceof Wrapper)
                        return object;

                    const result = <any>new (<{ new(value?: any): Object }>this.prototype.constructor)(...[object].concat(args));
                    const props: (keyof T)[] = [];

                    for (let prop in object) {
                        if (!result.__proto__.hasOwnProperty(prop)) {
                            const value = object[prop];
                            result[prop] = value;

                            result.__wrappedProperties__.push(prop);
                        }
                    }

                    return result;
                });

                return array ? results : results[0];
            }
        }
    }
}