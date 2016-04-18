// Typing for linq.js, ver 3.0.3-Beta4

declare module linqjs {
    interface IEnumerator<T> {
        current(): T;
        moveNext(): Boolean;
        dispose(): void;
    }

    interface EnumerableStatic {
        Utils: {
            createLambda<T>(expression: T): (...params: T[]) => T;
            createEnumerable<T>(getEnumerator: () => IEnumerator<T>): Enumerable<T>;
            createEnumerator<T>(initialize: () => void, tryGetNext: () => Boolean, dispose: () => void): IEnumerator<T>;
            extendTo<T>(type: T): void;
        };
        choice<T>(...params: T[]): Enumerable<T>;
        cycle<T>(...params: T[]): Enumerable<T>;
        empty<T>(): Enumerable<T>;
        from<T>(): Enumerable<T>;
        from<T>(obj: Enumerable<T>): Enumerable<T>;
        from(obj: string): Enumerable<string>;
        from(obj: number): Enumerable<number>;
        from<T>(obj: { length: number;[x: number]: T; }): Enumerable<T>;
        from<T>(obj: T): Enumerable<T>;
        make<T>(element: T): Enumerable<T>;
        matches<T>(input: string, pattern: RegExp): Enumerable<T>;
        matches<T>(input: string, pattern: string, flags?: string): Enumerable<T>;
        range(start: number, count: number, step?: number): Enumerable<number>;
        rangeDown(start: number, count: number, step?: number): Enumerable<number>;
        rangeTo(start: number, to: number, step?: number): Enumerable<number>;
        repeat<T>(element: T, count?: number): Enumerable<T>;
        repeatWithFinalize<T>(initializer: () => T, finalizer: (element) => void): Enumerable<T>;
        generate<T>(func: () => T, count?: number): Enumerable<T>;
        toInfinity<T>(start?: number, step?: number): Enumerable<T>;
        toNegativeInfinity<T>(start?: number, step?: number): Enumerable<T>;
        unfold<T>(seed: T, func: (value: T) => T): Enumerable<T>;
        defer<T>(enumerableFactory: () => Enumerable<T>): Enumerable<T>;
    }

    interface Enumerable<T> {
        constructor(getEnumerator: () => IEnumerator<T>);
        getEnumerator(): IEnumerator<T>;

        // Extension Methods
        traverseBreadthFirst(func: (element: T) => Enumerable<T>, resultSelector?: (element: T, nestLevel: number) => T): Enumerable<T>;
        traverseDepthFirst(func: (element: T) => Enumerable<T>, resultSelector?: (element: T, nestLevel: number) => T): Enumerable<T>;
        flatten(): Enumerable<T>;
        pairwise(selector: (prev: T, current: T) => T): Enumerable<T>;
        scan(func: (prev: T, current: T) => T): Enumerable<T>;
        scan(seed: T, func: (prev: T, current: T) => T): Enumerable<T>;
        select<TResult>(selector: (element: T, index: number) => TResult): Enumerable<TResult>;
        selectMany<TResult>(collectionSelector: (element: T, index: number) => TResult[]): Enumerable<TResult>;
        selectMany<TResult>(collectionSelector: (element: T, index: number) => Enumerable<TResult>): Enumerable<TResult>;
        where(predicate: (element: T, index: number) => Boolean): Enumerable<T>;
        choose(selector: (element: T, index: number) => T): Enumerable<T>;
        ofType(type: T): Enumerable<T>;
        zip(second: T[], resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        zip(second: Enumerable<T>, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        zip(second: { length: number;[x: number]: T; }, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        zip(...params: T[]): Enumerable<T>; // last one is selector
        merge(second: T[], resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        merge(second: Enumerable<T>, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        merge(second: { length: number;[x: number]: T; }, resultSelector: (first: T, second: T, index: number) => T): Enumerable<T>;
        merge(...params: T[]): Enumerable<T>; // last one is selector
        join(inner: Enumerable<T>, outerKeySelector: (outer: T) => T, innerKeySelector: (inner: T) => T, resultSelector: (outer: T, inner: T) => T, compareSelector?: (obj: T) => T): Enumerable<T>;
        groupJoin(inner: Enumerable<T>, outerKeySelector: (outer: T) => T, innerKeySelector: (inner: T) => T, resultSelector: (outer: T, inner: T) => T, compareSelector?: (obj: T) => T): Enumerable<T>;
        all(predicate: (element: T) => Boolean): Boolean;
        T(predicate?: (element: T) => Boolean): Boolean;
        isEmpty(): Boolean;
        concat(sequences: T[]): Enumerable<T>;
        insert(index: number, second: T[]): Enumerable<T>;
        insert(index: number, second: Enumerable<T>): Enumerable<T>;
        insert(index: number, second: { length: number;[x: number]: T; }): Enumerable<T>;
        alternate(alternateValue: T): Enumerable<T>;
        alternate(alternateSequence: T[]): Enumerable<T>;
        alternate(alternateSequence: Enumerable<T>): Enumerable<T>;
        contains(value: T, compareSelector: (element: T) => T): Enumerable<T>;
        defaultIfEmpty(defaultValue?: T): Enumerable<T>;
        distinct<TKey>(compareSelector?: (element: T) => TKey): Enumerable<T>;
        distinctUntilChanged(compareSelector: (element: T) => T): Enumerable<T>;
        except(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        except(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        except(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        intersect(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        intersect(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        intersect(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        sequenceEqual(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        sequenceEqual(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        sequenceEqual(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        union(second: T[], compareSelector?: (element: T) => T): Enumerable<T>;
        union(second: { length: number;[x: number]: T; }, compareSelector?: (element: T) => T): Enumerable<T>;
        union(second: Enumerable<T>, compareSelector?: (element: T) => T): Enumerable<T>;
        orderBy<TKey>(keySelector: (element: T) => TKey): OrderedEnumerable<T>;
        orderByDescending<TKey>(keySelector: (element: T) => TKey): OrderedEnumerable<T>;
        reverse(): Enumerable<T>;
        shuffle(): Enumerable<T>;
        weightedSample(weightSelector: (element: T) => T): Enumerable<T>;
        groupBy<TKey, TValue>(keySelector: (element: T) => TKey, elementSelector: (element: T) => TValue): Enumerable<Grouping<TKey, TValue>>;
        partitionBy(keySelector: (element: T) => T, elementSelector?: (element: T) => T, resultSelector?: (key: T, element: T) => T, compareSelector?: (element: T) => T): Enumerable<T>;
        buffer(count: number): Enumerable<T>;
        aggregate(func: (prev: T, current: T) => T): T;
        aggregate(seed: T, func: (prev: T, current: T) => T, resultSelector?: (last: T) => T): T;
        average(selector?: (element: T) => number): number;
        count(predicate?: (element: T, index: number) => Boolean): number;
        max(selector?: (element: T) => number): number;
        min(selector?: (element: T) => number): number;
        maxBy(keySelector: (element: T) => T): T;
        minBy(keySelector: (element: T) => T): T;
        sum(selector?: (element: T) => number): number;
        elementAt(index: number): T;
        elementAtOrDefault(index: number, defaultValue?: T): T;
        first(predicate?: (element: T, index: number) => Boolean): T;
        firstOrDefault(predicate?: (element: T, index: number) => Boolean, defaultValue?: T): T;
        last(predicate?: (element: T, index: number) => Boolean): T;
        lastOrDefault(predicate?: (element: T, index: number) => Boolean, defaultValue?: T): T;
        single(predicate?: (element: T, index: number) => Boolean): T;
        singleOrDefault(predicate?: (element: T, index: number) => Boolean, defaultValue?: T): T;
        skip(count: number): Enumerable<T>;
        skipWhile(predicate: (element: T, index: number) => Boolean): Enumerable<T>;
        take(count: number): Enumerable<T>;
        takeWhile(predicate: (element: T, index: number) => Boolean): Enumerable<T>;
        takeExceptLast(count?: number): Enumerable<T>;
        takeFromLast(count: number): Enumerable<T>;
        indexOf(item: T): number;
        indexOf(predicate: (element: T, index: number) => Boolean): number;
        lastIndexOf(item: T): number;
        lastIndexOf(predicate: (element: T, index: number) => Boolean): number;
        asEnumerable(): Enumerable<T>;
        toArray(): T[];
        toLookup(keySelector: (element: T) => T, elementSelector?: (element: T) => T, compareSelector?: (element: T) => T): Lookup<T>;
        toObject(keySelector: (element: T) => T, elementSelector?: (element: T) => T): Object;
        toDictionary<TKey, TValue>(keySelector: (element: T) => TKey, elementSelector: (element: T) => TValue): Dictionary<TKey, TValue>;
        toJSONString(replacer: (key: string, value: T) => T): string;
        toJSONString(replacer: T[]): string;
        toJSONString(replacer: (key: string, value: T) => T, space: T): string;
        toJSONString(replacer: T[], space: T): string;
        toJoinedString(separator?: string, selector?: (element: T, index: number) => T): string;
        doAction(action: (element: T, index: number) => void): Enumerable<T>;
        doAction(action: (element: T, index: number) => Boolean): Enumerable<T>;
        forEach(action: (element: T, index: number) => void): void;
        forEach(action: (element: T) => void): void;
        forEach(action: (element: T, index: number) => Boolean): void;
        forEach(action: (element: T) => Boolean): void;
        write(separator?: string, selector?: (element: T) => T): void;
        writeLine(selector?: (element: T) => T): void;
        force(): void;
        letBind(func: (source: Enumerable<T>) => T[]): Enumerable<T>;
        letBind(func: (source: Enumerable<T>) => { length: number;[x: number]: T; }): Enumerable<T>;
        letBind(func: (source: Enumerable<T>) => Enumerable<T>): Enumerable<T>;
        share(): DisposableEnumerable<T>;
        memoize(): DisposableEnumerable<T>;
        catchError(handler: (exception: T) => void): Enumerable<T>;
        finallyAction(finallyAction: () => void): Enumerable<T>;
        log(selector?: (element: T) => void): Enumerable<T>;
        trace(message?: string, selector?: (element: T) => void): Enumerable<T>;
    }

    interface OrderedEnumerable<T> extends Enumerable<T> {
        createOrderedEnumerable(keySelector: (element: T) => T, descending: Boolean): OrderedEnumerable<T>;
        thenBy(keySelector: (element: T) => T): OrderedEnumerable<T>;
        thenByDescending(keySelector: (element: T) => T): OrderedEnumerable<T>;
    }

    interface DisposableEnumerable<T> extends Enumerable<T> {
        dispose(): void;
    }

    export class Dictionary<TKey, TValue> {
        constructor();

        add(key: TKey, value: TValue): void;
        get(key: TKey): TValue;
        set(key: TKey, value: TValue): Boolean;
        contains(key: TKey): Boolean;
        clear(): void;
        remove(key: TKey): void;
        count(): number;
        toEnumerable(): Enumerable<KeyValuePair<TKey, TValue>>;
    }

    interface KeyValuePair<TKey, TValue> {
        key: TKey;
        value: TValue;
    }

    interface Lookup<T> {
        count(): number;
        get(key: T): Enumerable<T>;
        contains(key: T): Boolean;
        toEnumerable(): Enumerable<T>;
    }

    interface Grouping<TKey, TValue> extends Enumerable<TValue> {
        key(): TKey;
    }
}

// export definition
declare var Enumerable: linqjs.EnumerableStatic;