// Typing for linq.js, ver 3.0.3-Beta4

declare module linqjs {
    interface IEnumerator<T> {
        /** @deprecated */
        current(): T;
        /** @deprecated */
        moveNext(): Boolean;
        /** @deprecated */
        dispose(): void;
    }

    interface EnumerableStatic {
        Utils: {
            /** @deprecated */
            createLambda<T>(expression: T): (...params: T[]) => T;
            /** @deprecated */
            createEnumerable<T>(getEnumerator: () => IEnumerator<T>): Enumerable<T>;
            /** @deprecated */
            createEnumerator<T>(initialize: () => void, tryGetNext: () => Boolean, dispose: () => void): IEnumerator<T>;
            /** @deprecated */
            extendTo<T>(type: T): void;
        };
        /** @deprecated */
        choice<T>(...params: T[]): Enumerable<T>;
        /** @deprecated */
        cycle<T>(...params: T[]): Enumerable<T>;
        /** @deprecated */
        empty<T>(): Enumerable<T>;
        /** @deprecated */
        from<T>(): Enumerable<T>;
        /** @deprecated */
        from<T>(obj: Enumerable<T>): Enumerable<T>;
        /** @deprecated */
        from(obj: string): Enumerable<string>;
        /** @deprecated */
        from(obj: number): Enumerable<number>;
        /** @deprecated */
        from<T>(obj: { length: number;[x: number]: T; }): Enumerable<T>;
        /** @deprecated */
        from<T>(obj: T): Enumerable<T>;
        /** @deprecated */
        make<T>(element: T): Enumerable<T>;
        /** @deprecated */
        matches<T>(input: string, pattern: RegExp): Enumerable<T>;
        /** @deprecated */
        matches<T>(input: string, pattern: string, flags?: string): Enumerable<T>;
        /** @deprecated */
        range(start: number, count: number, step?: number): Enumerable<number>;
        /** @deprecated */
        rangeDown(start: number, count: number, step?: number): Enumerable<number>;
        /** @deprecated */
        rangeTo(start: number, to: number, step?: number): Enumerable<number>;
        /** @deprecated */
        repeat<T>(element: T, count?: number): Enumerable<T>;
        /** @deprecated */
        repeatWithFinalize<T>(initializer: () => T, finalizer: (element) => void): Enumerable<T>;
        /** @deprecated */
        generate<T>(func: () => T, count?: number): Enumerable<T>;
        /** @deprecated */
        toInfinity<T>(start?: number, step?: number): Enumerable<T>;
        /** @deprecated */
        toNegativeInfinity<T>(start?: number, step?: number): Enumerable<T>;
        /** @deprecated */
        unfold<T>(seed: T, func: (value: T) => T): Enumerable<T>;
        /** @deprecated */
        defer<T>(enumerableFactory: () => Enumerable<T>): Enumerable<T>;
    }

    interface Enumerable<T> {
        /** @deprecated */
        constructor(getEnumerator: () => IEnumerator<T>);
        /** @deprecated */
        getEnumerator(): IEnumerator<T>;

        // Extension Methods
        /** @deprecated */
        traverseBreadthFirst(func: (element: T) => Enumerable<T>, resultSelector?: (element: T, nestLevel: number) => T): Enumerable<T>;
        /** @deprecated */
        traverseDepthFirst(func: (element: T) => Enumerable<T>, resultSelector?: (element: T, nestLevel: number) => T): Enumerable<T>;
        /** @deprecated */
        flatten(): Enumerable<T>;
        /** @deprecated */
        pairwise(selector: (prev: T, current: T) => T): Enumerable<T>;
        /** @deprecated */
        scan(func: (prev: T, current: T) => T): Enumerable<T>;
        /** @deprecated */
        scan(seed: T, func: (prev: T, current: T) => T): Enumerable<T>;
        /** @deprecated */
        select<TResult>(selector: (element: T, index: number) => TResult): Enumerable<TResult>;
        /** @deprecated */
        selectMany<TResult>(collectionSelector: (element: T, index: number) => TResult[]): Enumerable<TResult>;
        /** @deprecated */
        selectMany<TResult>(collectionSelector: (element: T, index: number) => Enumerable<TResult>): Enumerable<TResult>;
        /** @deprecated */
        where(predicate: (element: T, index: number) => Boolean): Enumerable<T>;
        /** @deprecated */
        choose(selector: (element: T, index: number) => T): Enumerable<T>;
        /** @deprecated */
        ofType(type: T): Enumerable<T>;
        /** @deprecated */
        zip(second: T[], resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        /** @deprecated */
        zip(second: Enumerable<T>, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        /** @deprecated */
        zip(second: { length: number;[x: number]: T; }, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        /** @deprecated */
        zip(...params: T[]): Enumerable<T>; // last one is selector
        /** @deprecated */
        merge(second: T[], resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        /** @deprecated */
        merge(second: Enumerable<T>, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        /** @deprecated */
        merge(second: { length: number;[x: number]: T; }, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        /** @deprecated */
        merge(...params: T[]): Enumerable<T>; // last one is selector
        /** @deprecated */
        join(inner: Enumerable<T>, outerKeySelector: (outer: T) => T, innerKeySelector: (inner: T) => T, resultSelector: (outer: T, inner: T) => T, compareSelector?: (obj: T) => T): Enumerable<T>;
        /** @deprecated */
        groupJoin(inner: Enumerable<T>, outerKeySelector: (outer: T) => T, innerKeySelector: (inner: T) => T, resultSelector: (outer: T, inner: T) => T, compareSelector?: (obj: T) => T): Enumerable<T>;
        /** @deprecated */
        all(predicate: (element: T) => Boolean): Boolean;
        /** @deprecated */
        T(predicate?: (element: T) => Boolean): Boolean;
        /** @deprecated */
        isEmpty(): Boolean;
        /** @deprecated */
        concat(sequences: T[]): Enumerable<T>;
        /** @deprecated */
        insert(index: number, second: T[]): Enumerable<T>;
        /** @deprecated */
        insert(index: number, second: Enumerable<T>): Enumerable<T>;
        /** @deprecated */
        insert(index: number, second: { length: number;[x: number]: T; }): Enumerable<T>;
        /** @deprecated */
        alternate(alternateValue: T): Enumerable<T>;
        /** @deprecated */
        alternate(alternateSequence: T[]): Enumerable<T>;
        /** @deprecated */
        alternate(alternateSequence: Enumerable<T>): Enumerable<T>;
        /** @deprecated */
        contains(value: T, compareSelector: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        defaultIfEmpty(defaultValue?: T): Enumerable<T>;
        /** @deprecated */
        distinct<TKey>(compareSelector?: (element: T) => TKey): Enumerable<T>;
        /** @deprecated */
        distinctUntilChanged(compareSelector: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        except(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        except(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        except(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        intersect(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        intersect(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        intersect(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        sequenceEqual(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        sequenceEqual(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        sequenceEqual(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        union(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        union(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        union(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        orderBy<TKey>(keySelector: (element: T) => TKey): OrderedEnumerable<T>;
        /** @deprecated */
        orderByDescending<TKey>(keySelector: (element: T) => TKey): OrderedEnumerable<T>;
        /** @deprecated */
        reverse(): Enumerable<T>;
        /** @deprecated */
        shuffle(): Enumerable<T>;
        /** @deprecated */
        weightedSample(weightSelector: (element: T) => T): Enumerable<T>;
        /** @deprecated */groupBy<TKey, TValue>(keySelector: (element: T) => TKey, elementSelector: (element: T) => TValue): Enumerable<Grouping<TKey, TValue>>;
        partitionBy(keySelector: (element: T) => T, elementSelector?: (element: T) => T, resultSelector?: (key: T, element: T) => T, compareSelector?: (element: T) => T): Enumerable<T>;
        /** @deprecated */
        buffer(count: number): Enumerable<T>;
        /** @deprecated */
        aggregate(func: (prev: T, current: T) => T): T;
        /** @deprecated */
        aggregate(seed: T, func: (prev: T, current: T) => T, resultSelector?: (last: T) => T): T;
        /** @deprecated */
        average(selector?: (element: T) => number): number;
        /** @deprecated */
        count(predicate?: (element: T, index: number) => Boolean): number;
        /** @deprecated */
        max(selector?: (element: T) => number): number;
        /** @deprecated */
        min(selector?: (element: T) => number): number;
        /** @deprecated */
        maxBy(keySelector: (element: T) => T): T;
        /** @deprecated */
        minBy(keySelector: (element: T) => T): T;
        /** @deprecated */
        sum(selector?: (element: T) => number): number;
        /** @deprecated */
        elementAt(index: number): T;
        /** @deprecated */
        elementAtOrDefault(index: number, defaultValue?: T): T;
        /** @deprecated */
        first(predicate?: (element: T, index: number) => Boolean): T;
        /** @deprecated */
        firstOrDefault(predicate?: (element: T, index: number) => Boolean, defaultValue?: T): T;
        /** @deprecated */
        last(predicate?: (element: T, index: number) => Boolean): T;
        /** @deprecated */
        lastOrDefault(predicate?: (element: T, index: number) => Boolean, defaultValue?: T): T;
        /** @deprecated */
        single(predicate?: (element: T, index: number) => Boolean): T;
        /** @deprecated */
        singleOrDefault(predicate?: (element: T, index: number) => Boolean, defaultValue?: T): T;
        /** @deprecated */
        skip(count: number): Enumerable<T>;
        /** @deprecated */
        skipWhile(predicate: (element: T, index: number) => Boolean): Enumerable<T>;
        /** @deprecated */
        take(count: number): Enumerable<T>;
        /** @deprecated */takeWhile(predicate: (element: T, index: number) => Boolean): Enumerable<T>;
        takeExceptLast(count?: number): Enumerable<T>;
        /** @deprecated */
        takeFromLast(count: number): Enumerable<T>;
        /** @deprecated */
        indexOf(item: T): number;
        /** @deprecated */
        indexOf(predicate: (element: T, index: number) => Boolean): number;
        /** @deprecated */
        lastIndexOf(item: T): number;
        /** @deprecated */
        lastIndexOf(predicate: (element: T, index: number) => Boolean): number;
        /** @deprecated */
        asEnumerable(): Enumerable<T>;
        /** @deprecated */
        toArray(): T[];
        /** @deprecated */
        toLookup(keySelector: (element: T) => T, elementSelector?: (element: T) => T, compareSelector?: (element: T) => T): Lookup<T>;
        /** @deprecated */
        toObject(keySelector: (element: T) => T, elementSelector?: (element: T) => T): Object;
        /** @deprecated */
        toDictionary<TKey, TValue>(keySelector: (element: T) => TKey, elementSelector: (element: T) => TValue): Dictionary<TKey, TValue>;
        /** @deprecated */
        toJSONString(replacer: (key: string, value: T) => T): string;
        /** @deprecated */
        toJSONString(replacer: T[]): string;
        /** @deprecated */
        toJSONString(replacer: (key: string, value: T) => T, space: T): string;
        /** @deprecated */
        toJSONString(replacer: T[], space: T): string;
        /** @deprecated */
        toJoinedString(separator?: string, selector?: (element: T, index: number) => T): string;
        /** @deprecated */
        doAction(action: (element: T, index: number) => void): Enumerable<T>;
        /** @deprecated */
        doAction(action: (element: T, index: number) => Boolean): Enumerable<T>;
        /** @deprecated */
        forEach(action: (element: T, index: number) => void): void;
        /** @deprecated */
        forEach(action: (element: T) => void): void;
        /** @deprecated */
        forEach(action: (element: T, index: number) => Boolean): void;
        /** @deprecated */
        forEach(action: (element: T) => Boolean): void;
        /** @deprecated */
        write(separator?: string, selector?: (element: T) => T): void;
        /** @deprecated */
        writeLine(selector?: (element: T) => T): void;
        /** @deprecated */
        force(): void;
        /** @deprecated */
        letBind(func: (source: Enumerable<T>) => T[]): Enumerable<T>;
        /** @deprecated */
        letBind(func: (source: Enumerable<T>) => { length: number;[x: number]: T; }): Enumerable<T>;
        /** @deprecated */
        letBind(func: (source: Enumerable<T>) => Enumerable<T>): Enumerable<T>;
        /** @deprecated */
        share(): DisposableEnumerable<T>;
        /** @deprecated */
        memoize(): DisposableEnumerable<T>;
        /** @deprecated */
        catchError(handler: (exception: T) => void): Enumerable<T>;
        /** @deprecated */
        finallyAction(finallyAction: () => void): Enumerable<T>;
        /** @deprecated */
        log(selector?: (element: T) => void): Enumerable<T>;
        /** @deprecated */
        trace(message?: string, selector?: (element: T) => void): Enumerable<T>;
    }

    interface OrderedEnumerable<T> extends Enumerable<T> {
        /** @deprecated */
        createOrderedEnumerable(keySelector: (element: T) => T, descending: Boolean): OrderedEnumerable<T>;
        /** @deprecated */
        thenBy<TKey>(keySelector: (element: T) => TKey): OrderedEnumerable<T>;
        /** @deprecated */
        thenByDescending<TKey>(keySelector: (element: T) => TKey): OrderedEnumerable<T>;
    }

    interface DisposableEnumerable<T> extends Enumerable<T> {
        /** @deprecated */
        dispose(): void;
    }

    export class Dictionary<TKey, TValue> {
        /** @deprecated */
        constructor();

        /** @deprecated */
        add(key: TKey, value: TValue): void;
        /** @deprecated */
        get(key: TKey): TValue;
        /** @deprecated */
        set(key: TKey, value: TValue): Boolean;
        /** @deprecated */
        contains(key: TKey): Boolean;
        /** @deprecated */
        clear(): void;
        /** @deprecated */
        remove(key: TKey): void;
        /** @deprecated */
        count(): number;
        /** @deprecated */
        toEnumerable(): Enumerable<KeyValuePair<TKey, TValue>>;
    }

    interface KeyValuePair<TKey, TValue> {
        /** @deprecated */
        key: TKey;
        /** @deprecated */
        value: TValue;
    }

    interface Lookup<T> {
        /** @deprecated */
        count(): number;
        /** @deprecated */
        get(key: T): Enumerable<T>;
        /** @deprecated */
        contains(key: T): Boolean;
        /** @deprecated */
        toEnumerable(): Enumerable<T>;
    }

    interface Grouping<TKey, TValue> extends Enumerable<TValue> {
        /** @deprecated */
        key(): TKey;
    }
}

// export definition
/** @deprecated */
declare var Enumerable: linqjs.EnumerableStatic;