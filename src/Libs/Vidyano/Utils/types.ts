type KeyValuePair<T, U> = { key: T; value: U; };

type KeyValue<T> = { [key: string]: T; };

type NamedArray<T> = Array<T> & { [name: string]: T};