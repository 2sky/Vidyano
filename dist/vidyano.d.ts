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
        range<T>(start: number, count: number, step?: number): Enumerable<T>;
        rangeDown<T>(start: number, count: number, step?: number): Enumerable<T>;
        rangeTo<T>(start: number, to: number, step?: number): Enumerable<T>;
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
        distinct(compareSelector?: (element: T) => T): Enumerable<T>;
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
declare var Enumerable: linqjs.EnumerableStatic;interface MaskedInputOptions {
}

declare class MaskedInput {
	constructor(args: MaskedInputOptions);
}// Type definitions for Moment.js 2.8.0
// Project: https://github.com/timrwood/moment
// Definitions by: Michael Lakerveld <https://github.com/Lakerfield>, Aaron King <https://github.com/kingdango>, Hiroki Horiuchi <https://github.com/horiuchi>, Dick van den Brink <https://github.com/DickvdBrink>, Adi Dahiya <https://github.com/adidahiya>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module moment {

    interface MomentInput {

        years?: number;
        y?: number;

        months?: number;
        M?: number;

        weeks?: number;
        w?: number;

        days?: number;
        d?: number;

        hours?: number;
        h?: number;

        minutes?: number;
        m?: number;

        seconds?: number;
        s?: number;

        milliseconds?: number;
        ms?: number;

    }

    interface Duration {

        humanize(withSuffix?: boolean): string;

        as(units: string): number;

        milliseconds(): number;
        asMilliseconds(): number;

        seconds(): number;
        asSeconds(): number;

        minutes(): number;
        asMinutes(): number;

        hours(): number;
        asHours(): number;

        days(): number;
        asDays(): number;

        months(): number;
        asMonths(): number;

        years(): number;
        asYears(): number;

        add(n: number, p: string): Duration;
        add(n: number): Duration;
        add(d: Duration): Duration;

        subtract(n: number, p: string): Duration;
        subtract(n: number): Duration;
        subtract(d: Duration): Duration;

        toISOString(): string;

    }

    interface Moment {

        format(format: string): string;
        format(): string;

        fromNow(withoutSuffix?: boolean): string;

        startOf(unitOfTime: string): Moment;
        endOf(unitOfTime: string): Moment;

        /**
         * Mutates the original moment by adding time. (deprecated in 2.8.0)
         *
         * @param unitOfTime the unit of time you want to add (eg "years" / "hours" etc)
         * @param amount the amount you want to add
         */
        add(unitOfTime: string, amount: number): Moment;
        /**
         * Mutates the original moment by adding time.
         *
         * @param amount the amount you want to add
         * @param unitOfTime the unit of time you want to add (eg "years" / "hours" etc)
         */
        add(amount: number, unitOfTime: string): Moment;
        /**
         * Mutates the original moment by adding time. Note that the order of arguments can be flipped.
         *
         * @param amount the amount you want to add
         * @param unitOfTime the unit of time you want to add (eg "years" / "hours" etc)
         */
        add(amount: string, unitOfTime: string): Moment;
        /**
         * Mutates the original moment by adding time.
         *
         * @param objectLiteral an object literal that describes multiple time units {days:7,months:1}
         */
        add(objectLiteral: MomentInput): Moment;
        /**
         * Mutates the original moment by adding time.
         *
         * @param duration a length of time
         */
        add(duration: Duration): Moment;

        /**
         * Mutates the original moment by subtracting time. (deprecated in 2.8.0)
         *
         * @param unitOfTime the unit of time you want to subtract (eg "years" / "hours" etc)
         * @param amount the amount you want to subtract
         */
        subtract(unitOfTime: string, amount: number): Moment;
        /**
         * Mutates the original moment by subtracting time.
         *
         * @param unitOfTime the unit of time you want to subtract (eg "years" / "hours" etc)
         * @param amount the amount you want to subtract
         */
        subtract(amount: number, unitOfTime: string): Moment;
        /**
         * Mutates the original moment by subtracting time. Note that the order of arguments can be flipped.
         *
         * @param amount the amount you want to add
         * @param unitOfTime the unit of time you want to subtract (eg "years" / "hours" etc)
         */
        subtract(amount: string, unitOfTime: string): Moment;
        /**
         * Mutates the original moment by subtracting time.
         *
         * @param objectLiteral an object literal that describes multiple time units {days:7,months:1}
         */
        subtract(objectLiteral: MomentInput): Moment;
        /**
         * Mutates the original moment by subtracting time.
         *
         * @param duration a length of time
         */
        subtract(duration: Duration): Moment;

        calendar(): string;
        calendar(start: Moment): string;

        clone(): Moment;

        /**
         * @return Unix timestamp, or milliseconds since the epoch.
         */
        valueOf(): number;

        local(): Moment; // current date/time in local mode

        utc(): Moment; // current date/time in UTC mode

        isValid(): boolean;

        year(y: number): Moment;
        year(): number;
        quarter(): number;
        quarter(q: number): Moment;
        month(M: number): Moment;
        month(M: string): Moment;
        month(): number;
        day(d: number): Moment;
        day(d: string): Moment;
        day(): number;
        date(d: number): Moment;
        date(): number;
        hour(h: number): Moment;
        hour(): number;
        hours(h: number): Moment;
        hours(): number;
        minute(m: number): Moment;
        minute(): number;
        minutes(m: number): Moment;
        minutes(): number;
        second(s: number): Moment;
        second(): number;
        seconds(s: number): Moment;
        seconds(): number;
        millisecond(ms: number): Moment;
        millisecond(): number;
        milliseconds(ms: number): Moment;
        milliseconds(): number;
        weekday(): number;
        weekday(d: number): Moment;
        isoWeekday(): number;
        isoWeekday(d: number): Moment;
        weekYear(): number;
        weekYear(d: number): Moment;
        isoWeekYear(): number;
        isoWeekYear(d: number): Moment;
        week(): number;
        week(d: number): Moment;
        weeks(): number;
        weeks(d: number): Moment;
        isoWeek(): number;
        isoWeek(d: number): Moment;
        isoWeeks(): number;
        isoWeeks(d: number): Moment;
        weeksInYear(): number;
        isoWeeksInYear(): number;
        dayOfYear(): number;
        dayOfYear(d: number): Moment;

        from(f: Moment): string;
        from(f: Moment, suffix: boolean): string;
        from(d: Date): string;
        from(s: string): string;
        from(date: number[]): string;

        diff(b: Moment): number;
        diff(b: Moment, unitOfTime: string): number;
        diff(b: Moment, unitOfTime: string, round: boolean): number;

        toArray(): number[];
        toDate(): Date;
        toISOString(): string;
        toJSON(): string;
        unix(): number;

        isLeapYear(): boolean;
        zone(): number;
        zone(b: number): Moment;
        zone(b: string): Moment;
        daysInMonth(): number;
        isDST(): boolean;

        isBefore(): boolean;
        isBefore(b: Moment): boolean;
        isBefore(b: string): boolean;
        isBefore(b: Number): boolean;
        isBefore(b: Date): boolean;
        isBefore(b: number[]): boolean;
        isBefore(b: Moment, granularity: string): boolean;
        isBefore(b: String, granularity: string): boolean;
        isBefore(b: Number, granularity: string): boolean;
        isBefore(b: Date, granularity: string): boolean;
        isBefore(b: number[], granularity: string): boolean;

        isAfter(): boolean;
        isAfter(b: Moment): boolean;
        isAfter(b: string): boolean;
        isAfter(b: Number): boolean;
        isAfter(b: Date): boolean;
        isAfter(b: number[]): boolean;
        isAfter(b: Moment, granularity: string): boolean;
        isAfter(b: String, granularity: string): boolean;
        isAfter(b: Number, granularity: string): boolean;
        isAfter(b: Date, granularity: string): boolean;
        isAfter(b: number[], granularity: string): boolean;

        isSame(b: Moment): boolean;
        isSame(b: string): boolean;
        isSame(b: Number): boolean;
        isSame(b: Date): boolean;
        isSame(b: number[]): boolean;
        isSame(b: Moment, granularity: string): boolean;
        isSame(b: String, granularity: string): boolean;
        isSame(b: Number, granularity: string): boolean;
        isSame(b: Date, granularity: string): boolean;
        isSame(b: number[], granularity: string): boolean;

        // Deprecated as of 2.8.0.
        lang(language: string): Moment;
        lang(reset: boolean): Moment;
        lang(): MomentLanguage;

        locale(language: string): Moment;
        locale(reset: boolean): Moment;
        locale(): string;

        localeData(language: string): Moment;
        localeData(reset: boolean): Moment;
        localeData(): MomentLanguage;

        // Deprecated as of 2.7.0.
        max(date: Date): Moment;
        max(date: number): Moment;
        max(date: any[]): Moment;
        max(date: string): Moment;
        max(date: string, format: string): Moment;
        max(clone: Moment): Moment;

        // Deprecated as of 2.7.0.
        min(date: Date): Moment;
        min(date: number): Moment;
        min(date: any[]): Moment;
        min(date: string): Moment;
        min(date: string, format: string): Moment;
        min(clone: Moment): Moment;

        get(unit: string): number;
        set(unit: string, value: number): Moment;

    }

    interface MomentCalendar {

		lastDay: any;
		sameDay: any;
		nextDay: any;
		lastWeek: any;
		nextWeek: any;
		sameElse: any;

    }

    interface MomentLanguage {

		months?: any;
		monthsShort?: any;
		weekdays?: any;
		weekdaysShort?: any;
		weekdaysMin?: any;
		longDateFormat?: MomentLongDateFormat;
		relativeTime?: MomentRelativeTime;
		meridiem?: (hour: number, minute: number, isLowercase: boolean) => string;
		calendar?: MomentCalendar;
		ordinal?: (num: number) => string;

    }

    interface MomentLongDateFormat {

		L: string;
		LL: string;
		LLL: string;
		LLLL: string;
		LT: string;
		l?: string;
		ll?: string;
		lll?: string;
		llll?: string;
		lt?: string;

    }

    interface MomentRelativeTime {

		future: any;
		past: any;
		s: any;
		m: any;
		mm: any;
		h: any;
		hh: any;
		d: any;
		dd: any;
		M: any;
		MM: any;
		y: any;
		yy: any;

    }

    interface MomentStatic {

        version: string;

        (): Moment;
        (date: number): Moment;
        (date: number[]): Moment;
        (date: string, format?: string, strict?: boolean): Moment;
        (date: string, format?: string, language?: string, strict?: boolean): Moment;
        (date: string, formats: string[], strict?: boolean): Moment;
        (date: string, formats: string[], language?: string, strict?: boolean): Moment;
        (date: string, specialFormat: () => void, strict?: boolean): Moment;
        (date: string, specialFormat: () => void, language?: string, strict?: boolean): Moment;
        (date: string, formatsIncludingSpecial: any[], strict?: boolean): Moment;
        (date: string, formatsIncludingSpecial: any[], language?: string, strict?: boolean): Moment;
        (date: Date): Moment;
        (date: Moment): Moment;
        (date: Object): Moment;

        utc(): Moment;
        utc(date: number): Moment;
        utc(date: number[]): Moment;
        utc(date: string, format?: string, strict?: boolean): Moment;
        utc(date: string, format?: string, language?: string, strict?: boolean): Moment;
        utc(date: string, formats: string[], strict?: boolean): Moment;
        utc(date: string, formats: string[], language?: string, strict?: boolean): Moment;
        utc(date: Date): Moment;
        utc(date: Moment): Moment;
        utc(date: Object): Moment;

        unix(timestamp: number): Moment;

        invalid(parsingFlags?: Object): Moment;
        isMoment(): boolean;
        isMoment(m: any): boolean;
        isDuration(): boolean;
        isDuration(d: any): boolean;

        // Deprecated in 2.8.0.
        lang(language?: string): string;
        lang(language?: string, definition?: MomentLanguage): string;

        locale(language?: string): string;
        locale(language?: string[]): string;
        locale(language?: string, definition?: MomentLanguage): string;

        localeData(language?: string): MomentLanguage;

        longDateFormat: any;
        relativeTime: any;
        meridiem: (hour: number, minute: number, isLowercase: boolean) => string;
        calendar: any;
        ordinal: (num: number) => string;

        duration(milliseconds: Number): Duration;
        duration(num: Number, unitOfTime: string): Duration;
        duration(input: MomentInput): Duration;
        duration(object: any): Duration;
        duration(): Duration;

        parseZone(date: string): Moment;

        months(): string[];
        months(index: number): string;
        months(format: string): string[];
        months(format: string, index: number): string;
        monthsShort(): string[];
        monthsShort(index: number): string;
        monthsShort(format: string): string[];
        monthsShort(format: string, index: number): string;

        weekdays(): string[];
        weekdays(index: number): string;
        weekdays(format: string): string[];
        weekdays(format: string, index: number): string;
        weekdaysShort(): string[];
        weekdaysShort(index: number): string;
        weekdaysShort(format: string): string[];
        weekdaysShort(format: string, index: number): string;
        weekdaysMin(): string[];
        weekdaysMin(index: number): string;
        weekdaysMin(format: string): string[];
        weekdaysMin(format: string, index: number): string;

        min(moments: Moment[]): Moment;
        max(moments: Moment[]): Moment;

        normalizeUnits(unit: string): string;
        relativeTimeThreshold(threshold: string, limit: number): void;

        /**
         * Constant used to enable explicit ISO_8601 format parsing.
         */
        ISO_8601(): void;

    }

}

declare var moment: moment.MomentStatic;

declare module 'moment' {
    export = moment;
}declare module Vidyano {
    export interface Route {
        enter(fnc: Function): Route;
        to(fnc: Function): Route;
        exit(fnc: Function): Route;
        params: any;
        path: string;
    }

    export interface PathRescueArguments {
        current: string;
    }

    export interface PathArguments {
        path: string;
        params: { [key: string]: string };
    }

    export interface PathStatic {
        map(path: string): Route;
        root(path: string): void;
        routes: {
            current: string;
            defined: {
                [key: string]: Route
            };
        };
        listen(): void;
        rescue(fnc: Function): void;
        history: {
            pushState(state: any, title: string, path: string);
            replaceState(state: any, title: string, path: string);
            listen();
        };
        match(path: string, parameterize: boolean): Route;
    }

    export var Path: PathStatic;
}interface PolymerProperties {
    [name: string]: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor | {
        type: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor;
        computed?: string;
        reflectToAttribute?: boolean;
        readOnly?: boolean;
        observer?: string;
    };
}

interface PolymerDomApiClassList {
    add(className: string): void;
    remove(className: string): void;
    toggle(className: string): void;
}

interface PolymerDomApi {
    getDistributedNodes(): HTMLElement[];
    getDestinationInsertionPoints(): HTMLElement[];
    flush(): void;
    childNodes: Node[];
    children: HTMLElement[];
    classList: PolymerDomApiClassList;
    firstChild: Node;
    firstElementChild: Element;
    innerHTML: string;
    lastChild: Node;
    lastElementChild: Element;
    nextElementSibling: Element;
    nextSibling: Node;
    node: Node;
    parentNode: Node;
    previousElementSibling: Element;
    previousSibling: Node;
    textContent: string;
    insertBefore(newChild: Node | Vidyano.WebComponents.WebComponent, refChild?: Node | Vidyano.WebComponents.WebComponent): Node;
    removeAttribute(name?: string): void;
    setAttribute(name?: string, value?: string): void;
    querySelector(selectors: string): Element | Vidyano.WebComponents.WebComponent;
    querySelectorAll(selectors: string): NodeList;
    appendChild(newChild: Node | Vidyano.WebComponents.WebComponent): Node | Vidyano.WebComponents.WebComponent;
    removeChild(oldChild: Node | Vidyano.WebComponents.WebComponent): Node | Vidyano.WebComponents.WebComponent;
    replaceChild(newChild: Node | Vidyano.WebComponents.WebComponent, oldChild: Node | Vidyano.WebComponents.WebComponent): Node;
}

interface PolymerTrackEvent extends CustomEvent {
    detail: {
        sourceEvent?: Event;
    }
}

interface PolymerTrackDetail {
    /**
    state - a string indicating the tracking state:
        - start - fired when tracking is first detected (finger/button down and moved past a pre-set distance threshold)
        - track - fired while tracking
        - end - fired when tracking ends
    */
    state: string;
    /** clientX coordinate for event */
    x: number;
    /** clientY coordinate for event */
    y: number;
    /** change in pixels horizontally since the first track event */
    dx: number;
    /** change in pixels vertically since the first track event */
    dy: number;
    /** change in pixels horizontally since last track event */
    ddx: number;
    /** change in pixels vertically since last track event */
    ddy: number;
    /** a function that may be called to determine the element currently being hovered */
    hover(): Element | Vidyano.WebComponents.WebComponent;
}

interface TemplateInstance {
    item: any;
    index: number;
}

interface TapEvent extends CustomEvent {
    detail: {
        x: number;
        y: number;
        sourceEvent: Event;
    };

    model?: TemplateInstance | any;
}

declare var Polymer: {
    (polymer: any): void;
    dom(element: Node | Vidyano.WebComponents.WebComponent): PolymerDomApi;
    getRegisteredPrototype(tagName: string): any;

    whenReady(callback: () => void): void;

    /**
     * no-operation function for handy stubs
     */
    nop(): void;

    api: any;
};
declare var CustomElements: {
    registry: {
        [tag: string]: {
            ctor: any;
        }
    }

    ready: boolean;
    useNative: boolean;
};
declare class Queue {
    constructor(maxConcurrentPromises: number, maxQueuedPromises?: number);
    add<T>(work: () => Promise<T>): Promise<T>;
    getQueueLength(): number;
}
interface ISortable {
	destroy(): void;
	option(name: string, value?: any): any;
}

interface SortableOptions {
	group?: string;
	handle?: string;
	ghostClass?: string;
	draggable?: string;
	animation?: number;
	onSort?: Function;
}

interface SortableStatic {
    create(el: HTMLElement | Node, options?: SortableOptions): ISortable;
}

declare var Sortable: SortableStatic;interface String {
    asDataUri(): string;
    contains(str: string): boolean;
    endsWith(suffix: string): boolean;
    insert(str: string, index: number): string;
    padLeft(width: number, str?: string): string;
    padRight(width: number, str?: string): string;
    startsWith(prefix: string): boolean;
    trimEnd(c: string): string;
    trimStart(c: string): string;
}

interface Date {
    netType(value: string);
    netType(): string;

    netOffset(value: string);
    netOffset(): string;
}

interface Number {
	format(format: string): string;
}

interface ExpressionParserStatic {
    alwaysTrue: (count: number) => boolean;
    get(expression: string): (count: number) => boolean;
}

declare var ExpressionParser: ExpressionParserStatic;

interface UniqueStatic {
    get(): string;
}

declare var Unique: UniqueStatic;

interface StringEx {
    isNullOrEmpty(str: string): boolean;
    isNullOrWhiteSpace(str: string): boolean;
    format(format: string, ...args: any[]): string;
}

declare var StringEx: StringEx;


interface BooleanEx {
    parse(str: string): boolean;
}

declare var BooleanEx: BooleanEx;

interface Array<T> {
    remove(s: T): boolean;
    removeAll(f: (t: T) => boolean, thisObject?: any): void;
}

interface BigNumber {
    toNumber(): number;
}

declare var BigNumber: {
    new (number: number | string): BigNumber;
}
declare var unwrap: <TNode extends Node>(node: TNode) => TNode;

interface Node {
    /**
    * Appends the WebComponent to this component.
    */
    appendChild<TWebComponent extends Vidyano.WebComponents.WebComponent>(component: TWebComponent): TWebComponent;

    /**
    * Appends the Node to this component.
    */
    appendChild<TNode extends Node>(node: TNode): TNode;
}// Type definitions for es6-promises
// Project: https://github.com/jakearchibald/ES6-Promises
// Definitions by: François de Campredon <https://github.com/fdecampredon/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


interface Thenable<R> {
    then<U>(onFulfilled: (value: R) => Thenable<U>,  onRejected: (error: any) => Thenable<U>): Thenable<U>;
    then<U>(onFulfilled: (value: R) => Thenable<U>, onRejected?: (error: any) => U): Thenable<U>;
    then<U>(onFulfilled: (value: R) => U, onRejected: (error: any) => Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => U): Thenable<U>;
	
}

declare class Promise<R> implements Thenable<R> {
    /**
     * If you call resolve in the body of the callback passed to the constructor, 
     * your promise is fulfilled with result object passed to resolve.
     * If you call reject your promise is rejected with the object passed to resolve. 
     * For consistency and debugging (eg stack traces), obj should be an instanceof Error. 
     * Any errors thrown in the constructor callback will be implicitly passed to reject().
     */
	constructor(callback: (resolve : (result: R) => void, reject: (error: any) => void) => void);
    /**
     * If you call resolve in the body of the callback passed to the constructor, 
     * your promise will be fulfilled/rejected with the outcome of thenable passed to resolve.
     * If you call reject your promise is rejected with the object passed to resolve. 
     * For consistency and debugging (eg stack traces), obj should be an instanceof Error. 
     * Any errors thrown in the constructor callback will be implicitly passed to reject().
     */
	constructor(callback: (resolve : (thenable: Thenable<R>) => void, reject: (error: any) => void) => void);
	
    
    /**
     * onFulFill is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * 
     * @param onFulFill called when/if "promise" resolves
     * @param onReject called when/if "promise" rejects
     */
	then<U>(onFulfill: (value: R) => Thenable<U>,  onReject: (error: any) => Thenable<U>): Promise<U>;
    /**
     * onFulFill is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * 
     * @param onFulFill called when/if "promise" resolves
     * @param onReject called when/if "promise" rejects
     */
    then<U>(onFulfill: (value: R) => Thenable<U>, onReject?: (error: any) => U): Promise<U>;
    /**
     * onFulFill is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * 
     * @param onFulFill called when/if "promise" resolves
     * @param onReject called when/if "promise" rejects
     */
    then<U>(onFulfill: (value: R) => U, onReject: (error: any) => Thenable<U>): Promise<U>;
    /**
     * onFulFill is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * 
     * @param onFulFill called when/if "promise" resolves
     * @param onReject called when/if "promise" rejects
     */
    then<U>(onFulfill?: (value: R) => U, onReject?: (error: any) => U): Promise<U>;
    
    
    /**
     * Sugar for promise.then(undefined, onRejected)
     * 
     * @param onReject called when/if "promise" rejects
     */
	catch<U>(onReject?: (error: any) => Thenable<U>): Promise<U>;
    /**
     * Sugar for promise.then(undefined, onRejected)
     * 
     * @param onReject called when/if "promise" rejects
     */
	catch<U>(onReject?: (error: any) => U): Promise<U>;
}

declare module Promise {
	
	/**
	 * Returns promise (only if promise.constructor == Promise)
	 */
	function cast<R>(promise: Promise<R>): Promise<R>;
    /**
	 * Make a promise that fulfills to obj.
	 */
	function cast<R>(object?: R): Promise<R>;
    
	
    /**
     * Make a new promise from the thenable. 
     * A thenable is promise-like in as far as it has a "then" method. 
     * This also creates a new promise if you pass it a genuine JavaScript promise, making it less efficient for casting than Promise.cast.
     */
	function resolve<R>(thenable: Thenable<R>): Promise<R>;
    /**
     * Make a promise that fulfills to obj. Same as Promise.cast(obj) in this situation.
     */
	function resolve<R>(object?: R): Promise<R>;
    
	/**
	 * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
	 */
	function reject(error?: any): Promise<any>;
	
    /**
     * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects. 
     * the array passed to all can be a mixture of promise-like objects and other objects. 
     * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
     */
	function all<R>(promises: Promise<R>[]): Promise<R[]>;
	
    /**
     * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
     */
	function race<R>(promises: Promise<R>[]): Promise<R>;
}
declare module Vidyano {
    class CultureInfo {
        name: string;
        numberFormat: CultureInfoNumberFormat;
        dateFormat: CultureInfoDateFormat;
        static currentCulture: CultureInfo;
        static invariantCulture: CultureInfo;
        static cultures: linqjs.Dictionary<string, CultureInfo>;
        constructor(name: string, numberFormat: CultureInfoNumberFormat, dateFormat: CultureInfoDateFormat);
    }
    interface CultureInfoNumberFormat {
        naNSymbol: string;
        negativeSign: string;
        positiveSign: string;
        negativeInfinityText: string;
        positiveInfinityText: string;
        percentSymbol: string;
        percentGroupSizes: Array<number>;
        percentDecimalDigits: number;
        percentDecimalSeparator: string;
        percentGroupSeparator: string;
        percentPositivePattern: string;
        percentNegativePattern: string;
        currencySymbol: string;
        currencyGroupSizes: Array<number>;
        currencyDecimalDigits: number;
        currencyDecimalSeparator: string;
        currencyGroupSeparator: string;
        currencyNegativePattern: string;
        currencyPositivePattern: string;
        numberGroupSizes: Array<number>;
        numberDecimalDigits: number;
        numberDecimalSeparator: string;
        numberGroupSeparator: string;
    }
    interface CultureInfoDateFormat {
        amDesignator: string;
        pmDesignator: string;
        dateSeparator: string;
        timeSeparator: string;
        gmtDateTimePattern: string;
        universalDateTimePattern: string;
        sortableDateTimePattern: string;
        dateTimePattern: string;
        longDatePattern: string;
        shortDatePattern: string;
        longTimePattern: string;
        shortTimePattern: string;
        yearMonthPattern: string;
        firstDayOfWeek: number;
        dayNames: Array<string>;
        shortDayNames: Array<string>;
        minimizedDayNames: Array<string>;
        monthNames: Array<string>;
        shortMonthNames: Array<string>;
    }
}
declare var unescape: any;
declare var Windows: any;
declare module Vidyano {
    enum NotificationType {
        Error = 0,
        Notice = 1,
        OK = 2,
        Warning = 3,
    }
    interface Language {
        culture: string;
        name: string;
        isDefault: boolean;
        messages: {
            [key: string]: string;
        };
    }
    interface ProviderParameters {
        label: string;
        description: string;
        requestUri: string;
        signOutUri: string;
        redirectUri: string;
    }
    function extend(target: any, ...sources: any[]): any;
    function cookie(key: string, value?: any, options?: {
        force?: boolean;
        raw?: boolean;
        path?: string;
        domain?: string;
        secure?: boolean;
        expires?: number | Date;
    }): any;
    function _debounce(func: Function, wait: number, immediate?: boolean): Function;
    module Common {
        interface KeyValuePair {
            key: any;
            value: string;
        }
        interface SubjectNotifier<TSource, TDetail> {
            notify: (source: TSource, detail?: TDetail) => void;
        }
        class PropertyChangedArgs {
            propertyName: string;
            newValue: any;
            oldValue: any;
            constructor(propertyName: string, newValue: any, oldValue: any);
        }
        interface SubjectDisposer {
            (): void;
        }
        class Subject<TSource, TDetail> {
            private _observers;
            constructor(notifier: SubjectNotifier<TSource, TDetail>);
            attach(observer: SubjectObserver<TSource, TDetail>): SubjectDisposer;
            private _detach(observerId);
        }
        interface SubjectObserver<TSource, TDetail> {
            (sender: TSource, detail: TDetail): void;
        }
        class Observable<T> {
            private _propertyChangedNotifier;
            propertyChanged: Vidyano.Common.Subject<T, Vidyano.Common.PropertyChangedArgs>;
            constructor();
            protected notifyPropertyChanged(propertyName: string, newValue: any, oldValue?: any): void;
        }
        interface PropertyChangedObserver<T> extends SubjectObserver<T, Vidyano.Common.PropertyChangedArgs> {
        }
    }
    module ClientOperations {
        interface ClientOperation {
            type: string;
        }
        interface RefreshOperation extends ClientOperation {
            delay?: number;
            queryId?: string;
            fullTypeName?: string;
            objectId?: string;
        }
        interface ExecuteMethodOperation extends ClientOperation {
            name: string;
            arguments: any[];
        }
        interface OpenOperation extends ClientOperation {
            persistentObject: any;
            replace?: boolean;
        }
        function navigate(hooks: ServiceHooks, path: string, replaceCurrent?: boolean): void;
        function reloadPage(): void;
        function showMessageBox(hooks: ServiceHooks, title: string, message: string, html?: boolean, delay?: number): void;
    }
    interface ServiceClientData {
        defaultUser: string;
        exception: string;
        languages: {
            [code: string]: {
                name: string;
                isDefault: boolean;
                messages: {
                    [key: string]: string;
                };
            };
        };
        providers: {
            [name: string]: {
                parameters: ProviderParameters;
            };
        };
    }
    class Service extends Vidyano.Common.Observable<Service> {
        serviceUri: string;
        hooks: ServiceHooks;
        private _forceUser;
        private static _base64KeyStr;
        private _lastAuthTokenUpdate;
        private _isUsingDefaultCredentials;
        private _clientData;
        private _language;
        private _languages;
        private _windowsAuthentication;
        private _providers;
        private _isSignedIn;
        private _application;
        staySignedIn: boolean;
        icons: linqjs.Dictionary<string, string>;
        actionDefinitions: linqjs.Dictionary<string, ActionDefinition>;
        environment: string;
        environmentVersion: string;
        ignoreMobile: boolean;
        constructor(serviceUri: string, hooks?: ServiceHooks, _forceUser?: string);
        private _createUri(method);
        private _createData(method, data?);
        private _postJSON(url, data);
        private _getJSON(url);
        private static _decodeBase64(input);
        private static _getServiceTimeString;
        _getStream(obj: PersistentObject, action?: string, parent?: PersistentObject, query?: Query, selectedItems?: Array<QueryResultItem>, parameters?: any): void;
        application: Application;
        private _setApplication(application);
        language: Language;
        isSignedIn: boolean;
        private _setIsSignedIn(val);
        languages: Language[];
        windowsAuthentication: boolean;
        providers: {
            [name: string]: ProviderParameters;
        };
        isUsingDefaultCredentials: boolean;
        private _setIsUsingDefaultCredentials(val);
        userName: string;
        private _setUserName(val);
        defaultUserName: string;
        private authToken;
        getTranslatedMessage(key: string, ...params: string[]): string;
        initialize(skipDefaultCredentialLogin?: boolean): Promise<Application>;
        signInExternal(providerName: string): void;
        signInUsingCredentials(userName: string, password: string): Promise<Application>;
        signInUsingDefaultCredentials(): Promise<Application>;
        signOut(): void;
        private _getApplication(data?);
        getQuery(id: string, asLookup?: boolean): Promise<Query>;
        getPersistentObject(parent: PersistentObject, id: string, objectId?: string): Promise<PersistentObject>;
        executeQuery(parent: PersistentObject, query: Query, asLookup?: boolean): Promise<any>;
        executeAction(action: string, parent: PersistentObject, query: Query, selectedItems: Array<QueryResultItem>, parameters?: any, skipHooks?: boolean): Promise<PersistentObject>;
        static getDate: (yearString: string, monthString: string, dayString: string, hourString: string, minuteString: string, secondString: string, msString: string) => Date;
        static fromServiceString(value: string, typeName: string): any;
        static toServiceString(value: any, typeName: string): string;
        static numericTypes: string[];
        static isNumericType(type: string): boolean;
        static dateTimeTypes: string[];
        static isDateTimeType(type: string): boolean;
    }
    class ServiceHooks {
        private _service;
        service: Vidyano.Service;
        createData(data: any): void;
        setNotification(notification: string, type: NotificationType): void;
        onInitialize(clientData: ServiceClientData): void;
        onSessionExpired(): void;
        onAction(args: ExecuteActionArgs): Promise<any>;
        onOpen(obj: ServiceObject, replaceCurrent?: boolean, fromAction?: boolean): void;
        onClose(obj: ServiceObject): void;
        onConstructPersistentObject(service: Service, po: any): PersistentObject;
        onConstructPersistentObjectAttributeTab(service: Service, groups: linqjs.Enumerable<PersistentObjectAttributeGroup>, key: string, id: string, name: string, layout: any, parent: PersistentObject, columnCount: number): PersistentObjectAttributeTab;
        onConstructPersistentObjectQueryTab(service: Service, query: Query): PersistentObjectQueryTab;
        onConstructPersistentObjectAttributeGroup(service: Service, key: string, attributes: linqjs.Enumerable<PersistentObjectAttribute>, parent: PersistentObject): PersistentObjectAttributeGroup;
        onConstructPersistentObjectAttribute(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttribute;
        onConstructPersistentObjectAttributeWithReference(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeWithReference;
        onConstructPersistentObjectAttributeAsDetail(service: Service, attr: any, parent: PersistentObject): PersistentObjectAttributeAsDetail;
        onConstructQuery(service: Service, query: any, parent?: PersistentObject, asLookup?: boolean, maxSelectedItems?: number): Query;
        onConstructQueryResultItem(service: Service, item: any, query: Query): QueryResultItem;
        onConstructQueryResultItemValue(service: Service, value: any): QueryResultItemValue;
        onConstructQueryColumn(service: Service, col: any, query: Query): QueryColumn;
        onConstructAction(service: Service, action: Action): Action;
        onMessageDialog(title: string, message: string, html: boolean, ...actions: string[]): Promise<number>;
        onNavigate(path: string, replaceCurrent?: boolean): void;
        onClientOperation(operation: ClientOperations.ClientOperation): void;
    }
    class ExecuteActionArgs {
        private service;
        persistentObject: PersistentObject;
        query: Query;
        selectedItems: Array<QueryResultItem>;
        parameters: any;
        private _action;
        action: string;
        isHandled: boolean;
        result: PersistentObject;
        constructor(service: Service, action: string, persistentObject: PersistentObject, query: Query, selectedItems: Array<QueryResultItem>, parameters: any);
        executeServiceRequest(): Promise<PersistentObject>;
    }
    interface ServiceObjectPropertyChangedObserver extends Common.PropertyChangedObserver<ServiceObject> {
    }
    class ServiceObject extends Vidyano.Common.Observable<ServiceObject> {
        service: Service;
        constructor(service: Service);
        copyProperties(propertyNames: Array<string>, includeNullValues?: boolean, result?: any): any;
    }
    class ServiceObjectWithActions extends ServiceObject {
        private _actionNames;
        private _queue;
        private _isBusy;
        notification: string;
        notificationType: NotificationType;
        actions: Action[];
        constructor(service: Service, _actionNames?: string[]);
        isBusy: boolean;
        private _setIsBusy(val);
        setNotification(notification?: string, type?: NotificationType): void;
        queueWork<T>(work: () => Promise<T>, blockActions?: boolean): Promise<T>;
        protected _initializeActions(): void;
        private _blockActions(block);
    }
    enum PersistentObjectLayoutMode {
        FullPage = 0,
        MasterDetail = 1,
    }
    class PersistentObject extends ServiceObjectWithActions {
        private _isSystem;
        private backupSecurityToken;
        private securityToken;
        private _isEditing;
        private _isDirty;
        private _inputs;
        private _id;
        private _type;
        private _breadcrumb;
        private _isDeleted;
        fullTypeName: string;
        label: string;
        objectId: string;
        isHidden: boolean;
        isNew: boolean;
        isReadOnly: boolean;
        queryLayoutMode: PersistentObjectLayoutMode;
        newOptions: string;
        ignoreCheckRules: boolean;
        stateBehavior: string;
        parent: PersistentObject;
        ownerDetailAttribute: PersistentObjectAttributeAsDetail;
        ownerAttributeWithReference: PersistentObjectAttributeWithReference;
        ownerPersistentObject: PersistentObject;
        ownerQuery: Query;
        bulkObjectIds: string;
        queriesToRefresh: Array<string>;
        attributes: PersistentObjectAttribute[];
        attributesByName: {
            [key: string]: PersistentObjectAttribute;
        };
        private _tabs;
        private _serviceTabs;
        queries: Query[];
        queriesByName: {
            [key: string]: Query;
        };
        constructor(service: Service, po: any);
        private _createPersistentObjectAttribute(attr);
        id: string;
        isSystem: boolean;
        type: string;
        isBulkEdit: boolean;
        tabs: PersistentObjectTab[];
        isEditing: boolean;
        private setIsEditing(value);
        breadcrumb: string;
        private _setBreadcrumb(breadcrumb);
        isDirty: boolean;
        private _setIsDirty(value);
        isDeleted: boolean;
        getAttribute(name: string): PersistentObjectAttribute;
        getAttributeValue(name: string): any;
        getQuery(name: string): Query;
        beginEdit(): void;
        cancelEdit(): void;
        save(waitForOwnerQuery?: boolean): Promise<boolean>;
        getRegisteredInputs(): linqjs.Enumerable<linqjs.KeyValuePair<string, HTMLInputElement>>;
        hasRegisteredInput(attributeName: string): boolean;
        registerInput(attributeName: string, input: HTMLInputElement): void;
        clearRegisteredInputs(attributeName?: string): void;
        toServiceObject(skipParent?: boolean): any;
        refreshFromResult(result: PersistentObject): void;
        triggerDirty(): void;
        _triggerAttributeRefresh(attr: PersistentObjectAttribute): Promise<boolean>;
        _prepareAttributesForRefresh(sender: PersistentObjectAttribute): void;
    }
    class PersistentObjectAttribute extends ServiceObject {
        parent: PersistentObject;
        private _isSystem;
        private _lastParsedValue;
        private _cachedValue;
        private _serviceValue;
        private _serviceOptions;
        private _displayValueSource;
        private _displayValue;
        private _validationError;
        private _tab;
        private _tabKey;
        private _group;
        private _groupKey;
        private _isRequired;
        private _isReadOnly;
        private _isValueChanged;
        private _backupData;
        protected _queueRefresh: boolean;
        private _refreshValue;
        id: string;
        name: string;
        label: string;
        options: string[] | Common.KeyValuePair[];
        offset: number;
        type: string;
        toolTip: string;
        rules: string;
        visibility: string;
        typeHints: any;
        editTemplateKey: string;
        templateKey: string;
        disableSort: boolean;
        triggersRefresh: boolean;
        column: number;
        columnSpan: number;
        constructor(service: Service, attr: any, parent: PersistentObject);
        groupKey: string;
        group: PersistentObjectAttributeGroup;
        tabKey: string;
        tab: PersistentObjectAttributeTab;
        isSystem: boolean;
        isVisible: boolean;
        validationError: string;
        isRequired: boolean;
        private _setIsRequired(isRequired);
        isReadOnly: boolean;
        private _setIsReadOnly(isReadOnly);
        displayValue: string;
        value: any;
        setValue(val: any, allowRefresh?: boolean): Promise<any>;
        isValueChanged: boolean;
        backup(): void;
        restore(): void;
        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        getRegisteredInput(): HTMLInputElement;
        registerInput(input: HTMLInputElement): void;
        clearRegisteredInput(): void;
        _toServiceObject(): any;
        _refreshFromResult(resultAttr: PersistentObjectAttribute): boolean;
        protected _triggerAttributeRefresh(): Promise<any>;
        private _setOptions(options);
    }
    class PersistentObjectAttributeWithReference extends PersistentObjectAttribute {
        parent: PersistentObject;
        lookup: Query;
        objectId: string;
        displayAttribute: string;
        canAddNewReference: boolean;
        selectInPlace: boolean;
        constructor(service: Service, attr: any, parent: PersistentObject);
        addNewReference(): void;
        changeReference(selectedItems: QueryResultItem[] | string[]): Promise<boolean>;
        getPersistentObject(): Promise<Vidyano.PersistentObject>;
        _refreshFromResult(resultAttr: PersistentObjectAttribute): boolean;
    }
    class PersistentObjectAttributeAsDetail extends PersistentObjectAttribute {
        parent: PersistentObject;
        private _objects;
        details: Query;
        lookupAttribute: string;
        constructor(service: Service, attr: any, parent: PersistentObject);
        objects: Vidyano.PersistentObject[];
        private _setObjects(objects);
        _refreshFromResult(resultAttr: PersistentObjectAttribute): boolean;
        _toServiceObject(): any;
        onChanged(allowRefresh: boolean): Promise<any>;
        restore(): void;
    }
    class PersistentObjectTab extends Common.Observable<PersistentObjectTab> {
        service: Service;
        name: string;
        label: string;
        target: ServiceObjectWithActions;
        parent: PersistentObject;
        private _isVisible;
        tabGroupIndex: number;
        constructor(service: Service, name: string, label: string, target: ServiceObjectWithActions, parent?: PersistentObject, _isVisible?: boolean);
        isVisible: boolean;
    }
    class PersistentObjectAttributeTab extends PersistentObjectTab {
        private _groups;
        key: string;
        id: string;
        private _layout;
        columnCount: number;
        private _attributes;
        constructor(service: Service, _groups: PersistentObjectAttributeGroup[], key: string, id: string, name: string, _layout: any, po: PersistentObject, columnCount: number);
        layout: any;
        private _setLayout(layout);
        attributes: PersistentObjectAttribute[];
        groups: PersistentObjectAttributeGroup[];
        saveLayout(layout: any): Promise<any>;
        private _updateAttributes();
    }
    class PersistentObjectQueryTab extends PersistentObjectTab {
        query: Query;
        constructor(service: Service, query: Query);
    }
    class PersistentObjectAttributeGroup {
        service: Service;
        key: string;
        attributes: PersistentObjectAttribute[];
        parent: PersistentObject;
        label: string;
        index: number;
        constructor(service: Service, key: string, attributes: PersistentObjectAttribute[], parent: PersistentObject);
    }
    enum SortDirection {
        None = 0,
        Ascending = 1,
        Descending = 2,
    }
    interface SortOption {
        column: QueryColumn;
        direction: SortDirection;
    }
    class Query extends ServiceObjectWithActions {
        parent: PersistentObject;
        maxSelectedItems: number;
        private _asLookup;
        private _isSelectionModifying;
        private _totalItems;
        private _labelWithTotalItems;
        private _sortOptions;
        private _queriedPages;
        private _filters;
        private _canFilter;
        private _lastSearched;
        persistentObject: PersistentObject;
        columns: QueryColumn[];
        id: string;
        name: string;
        autoQuery: boolean;
        canRead: boolean;
        isHidden: boolean;
        hasSearched: boolean;
        label: string;
        singularLabel: string;
        offset: number;
        textSearch: string;
        pageSize: number;
        skip: number;
        top: number;
        totalItem: QueryResultItem;
        items: QueryResultItem[];
        allSelected: boolean;
        groupingInfo: {
            groupedBy: string;
            type: string;
            groups: {
                name: string;
                start: number;
                count: number;
                end: number;
            }[];
        };
        constructor(service: Service, query: any, parent?: PersistentObject, asLookup?: boolean, maxSelectedItems?: number);
        filters: PersistentObject;
        canFilter: boolean;
        selectedItems: QueryResultItem[];
        selectRange(from: number, to: number): boolean;
        asLookup: boolean;
        totalItems: number;
        labelWithTotalItems: string;
        sortOptions: SortOption[];
        private _setSortOptionsFromService(options);
        private _setTotalItems(items);
        _toServiceObject(): any;
        _setResult(result: any): void;
        getColumn(name: string): QueryColumn;
        getItemsInMemory(start: number, length: number): QueryResultItem[];
        getItems(start: number, length: number): Promise<QueryResultItem[]>;
        search(delay?: number): Promise<QueryResultItem[]>;
        clone(asLookup?: boolean): Query;
        private _updateColumns(_columns?);
        private _updateItems(items, reset?);
        private _notifyItemSelectionChanged(item);
    }
    class QueryColumn extends ServiceObject {
        query: Query;
        private displayAttribute;
        private _sortDirection;
        disableSort: boolean;
        canFilter: boolean;
        includes: string[];
        excludes: string[];
        distincts: QueryColumnDistincts;
        label: string;
        name: string;
        offset: number;
        type: string;
        isPinned: boolean;
        isHidden: boolean;
        width: string;
        typeHints: any;
        constructor(service: Service, col: any, query: Query);
        isSorting: boolean;
        sortDirection: SortDirection;
        private _setSortDirection(direction);
        _toServiceObject(): any;
        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        refreshDistincts(): Promise<QueryColumnDistincts>;
        sort(direction: SortDirection, multiSort?: boolean): void;
        private _queryPropertyChanged(sender, args);
    }
    interface QueryColumnDistincts {
        matching: string[];
        remaining: string[];
        isDirty: boolean;
    }
    class QueryResultItem extends ServiceObject {
        query: Query;
        id: string;
        breadcrumb: string;
        rawValues: linqjs.Enumerable<QueryResultItemValue>;
        typeHints: any;
        private _fullValuesByName;
        private _values;
        private _isSelected;
        constructor(service: Service, item: any, query: Query);
        values: any;
        isSelected: boolean;
        getValue(key: string): any;
        getFullValue(key: string): QueryResultItemValue;
        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        getPersistentObject(): Promise<PersistentObject>;
        _toServiceObject(): any;
    }
    class QueryResultItemValue extends ServiceObject {
        key: string;
        value: string;
        typeHints: any;
        persistentObjectId: string;
        objectId: string;
        constructor(service: Service, value: any);
        getTypeHint(name: string, defaultValue?: string, typeHints?: any): string;
        _toServiceObject(): any;
    }
    class Action extends ServiceObject {
        service: Service;
        definition: ActionDefinition;
        owner: ServiceObjectWithActions;
        private _targetType;
        private _target;
        private _query;
        private _parent;
        private _isVisible;
        private _canExecute;
        private _block;
        private _parameters;
        private _offset;
        protected _isPinned: boolean;
        skipOpen: boolean;
        selectionRule: (count: number) => boolean;
        displayName: string;
        options: Array<string>;
        dependentActions: any[];
        constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        parent: PersistentObject;
        query: Query;
        offset: number;
        name: string;
        canExecute: boolean;
        block: boolean;
        isVisible: boolean;
        isPinned: boolean;
        execute(option?: number, parameters?: any, selectedItems?: QueryResultItem[], throwExceptions?: boolean): Promise<PersistentObject>;
        _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        _getParameters(parameters: any, option: any): any;
        _onParentIsEditingChanged(isEditing: boolean): void;
        _onParentIsDirtyChanged(isDirty: boolean): void;
        private _setNotification(notification?, notificationType?);
        static get(service: Service, name: string, owner: ServiceObjectWithActions): Action;
        static addActions(service: Service, owner: ServiceObjectWithActions, actions: Action[], actionNames: string[]): void;
    }
    module Actions {
        class RefreshQuery extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<any>;
        }
        class Filter extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        }
        class Edit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onParentIsEditingChanged(isEditing: boolean): void;
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class EndEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onParentIsEditingChanged(isEditing: boolean): void;
            _onParentIsDirtyChanged(isDirty: boolean): void;
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class Save extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class CancelSave extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class CancelEdit extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onParentIsEditingChanged(isEditing: boolean): void;
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class ExportToExcel extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class ShowHelp extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
            _onExecute(option?: number, parameters?: any, selectedItems?: QueryResultItem[]): Promise<PersistentObject>;
        }
        class viSearch extends Action {
            constructor(service: Service, definition: ActionDefinition, owner: ServiceObjectWithActions);
        }
    }
    class ActionDefinition {
        private _name;
        private _displayName;
        private _isPinned;
        private _refreshQueryOnCompleted;
        private _offset;
        private _iconData;
        private _reverseIconData;
        private _options;
        private _selectionRule;
        constructor(service: Service, item: QueryResultItem);
        name: string;
        displayName: string;
        isPinned: boolean;
        refreshQueryOnCompleted: boolean;
        offset: number;
        iconData: string;
        reverseIconData: string;
        options: Array<string>;
        selectionRule: (count: number) => boolean;
    }
    class Application extends PersistentObject {
        private _userId;
        private _friendlyUserName;
        private _feedbackId;
        private _userSettingsId;
        private _globalSearchId;
        private _analyticsKey;
        private _userSettings;
        private _hasManagement;
        private _session;
        programUnits: ProgramUnit[];
        constructor(service: Service, po: any);
        userId: string;
        friendlyUserName: string;
        feedbackId: string;
        userSettingsId: string;
        globalSearchId: string;
        analyticsKey: string;
        userSettings: any;
        hasManagement: boolean;
        session: Vidyano.PersistentObject;
        _updateSession(session: any): void;
    }
    class ProgramUnitItem extends ServiceObject {
        path: string;
        id: string;
        title: string;
        name: string;
        constructor(service: Service, unitItem: any, path?: string);
    }
    class ProgramUnit extends ProgramUnitItem {
        private _id;
        offset: number;
        openFirst: boolean;
        items: ProgramUnitItem[];
        constructor(service: Service, unit: any);
        private _createItem(itemData);
    }
    class ProgramUnitItemGroup extends ProgramUnitItem {
        items: ProgramUnitItem[];
        constructor(service: Service, unitItem: any, items: ProgramUnitItem[]);
    }
    class ProgramUnitItemQuery extends ProgramUnitItem {
        queryId: string;
        constructor(service: Service, unitItem: any, parent: ProgramUnit);
    }
    class ProgramUnitItemPersistentObject extends ProgramUnitItem {
        persistentObjectId: string;
        persistentObjectObjectId: string;
        constructor(service: Service, unitItem: any, parent: ProgramUnit);
    }
    class NoInternetMessage {
        private language;
        title: string;
        message: string;
        tryAgain: string;
        static messages: linqjs.Dictionary<string, NoInternetMessage>;
        constructor(language: string, title: string, message: string, tryAgain: string);
        private static _getMessages();
    }
}
declare module Vidyano.WebComponents {
    class ActionBar extends WebComponent {
        accent: boolean;
        serviceObject: Vidyano.ServiceObjectWithActions;
        pinnedActions: Vidyano.Action[];
        unpinnedActions: Vidyano.Action[];
        canSearch: boolean;
        private _serviceObjectChanged();
        executeAction(e: Event, details: any, sender: HTMLElement): void;
        filterActions(actions: Vidyano.Action[], pinned: boolean): Vidyano.Action[];
        private _search();
        private _computePinnedActions();
        private _computeUnpinnedActions();
        private _computeCanSearch(serviceObject);
        private _computeNoActions(pinnedActions, unpinnedActions);
    }
}
declare module Vidyano.WebComponents {
    class ActionButton extends WebComponent {
        private _propertyChangedObserver;
        action: Vidyano.Action;
        item: Vidyano.QueryResultItem;
        canExecute: boolean;
        hasOptions: boolean;
        private _setCanExecute;
        private _setHidden;
        private _executeWithoutOptions(e);
        private _executeWithOption(e);
        private _execute(option?);
        private _updateCanExecuteHook();
        private _computeIcon(action);
        private _computeHasOptions(action);
    }
}
declare module Vidyano.WebComponents {
    class AppConfig extends WebComponent {
        private _defaultAttributeConfig;
        private _attributeConfigs;
        private _tabConfigs;
        attached(): void;
        getAttributeConfig(attr: Vidyano.PersistentObjectAttribute): PersistentObjectAttributeConfig;
        getTabConfig(tab: Vidyano.PersistentObjectTab): PersistentObjectTabConfig;
        private _getConfigs<T>(type);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectAttributeConfig extends WebComponent {
        private _calculateHeight;
        private _calculateWidth;
        private height;
        private width;
        type: string;
        name: string;
        parentId: string;
        parentObjectId: string;
        component: string;
        wrapAround: boolean;
        template: any;
        private _setTemplate;
        attached(): void;
        calculateHeight(attr: Vidyano.PersistentObjectAttribute): number;
        calculateWidth(attr: Vidyano.PersistentObjectAttribute): number;
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectTabConfig extends WebComponent {
        name: string;
        type: string;
        objectId: string;
        template: any;
        private _setTemplate;
        attached(): void;
    }
}
declare module Vidyano.WebComponents {
    class AppRoute extends WebComponent {
        route: string;
        component: string;
        private _constructor;
        private _constructorChanged;
        private _parameters;
        active: boolean;
        private _setActive;
        constructor(route: string, component: string);
        attached(): void;
        activate(parameters?: {
            [key: string]: string;
        }): boolean;
        deactivate(): void;
        parameters: any;
        private _componentChanged();
    }
    class AppCacheEntry {
        id: string;
        constructor(id: string);
        isMatch(entry: AppCacheEntry): boolean;
    }
    class PersistentObjectAppCacheEntry extends AppCacheEntry {
        objectId: string;
        private _persistentObject;
        selectedMasterTab: Vidyano.PersistentObjectTab;
        selectedDetailTab: Vidyano.PersistentObjectTab;
        constructor(idOrPo: string | Vidyano.PersistentObject, objectId?: string);
        persistentObject: Vidyano.PersistentObject;
        isMatch(entry: PersistentObjectAppCacheEntry): boolean;
    }
    class PersistentObjectFromActionAppCacheEntry extends PersistentObjectAppCacheEntry {
        fromActionId: string;
        fromActionIdReturnPath: string;
        constructor(po: Vidyano.PersistentObject, fromActionId?: string, fromActionIdReturnPath?: string);
        isMatch(entry: PersistentObjectFromActionAppCacheEntry): boolean;
    }
    class QueryAppCacheEntry extends AppCacheEntry {
        query: Vidyano.Query;
        constructor(idOrQuery: string | Vidyano.Query);
        isMatch(entry: QueryAppCacheEntry): boolean;
    }
    class App extends WebComponent {
        private _cache;
        private _initializationError;
        private _routeMap;
        private _keybindingRegistrations;
        private routeMapVersion;
        private _configuration;
        service: Vidyano.Service;
        programUnit: ProgramUnit;
        currentRoute: AppRoute;
        initializing: boolean;
        uri: string;
        hooks: string;
        noHistory: boolean;
        path: string;
        cacheSize: number;
        noMenu: boolean;
        label: string;
        keys: string;
        private _setInitializing;
        private _setRouteMapVersion;
        private _setKeys;
        private _setProgramUnit;
        private _setCurrentRoute;
        attached(): void;
        configuration: AppConfig;
        private _setConfiguration(config);
        changePath(path: string, replaceCurrent?: boolean): void;
        getUrlForPersistentObject(id: string, objectId: string, pu?: ProgramUnit): string;
        getUrlForQuery(id: string, pu?: ProgramUnit): string;
        getUrlForFromAction(id: string, pu?: ProgramUnit): string;
        cache(entry: Vidyano.WebComponents.AppCacheEntry): Vidyano.WebComponents.AppCacheEntry;
        cachePing(entry: Vidyano.WebComponents.AppCacheEntry): Vidyano.WebComponents.AppCacheEntry;
        cacheRemove(key: Vidyano.WebComponents.AppCacheEntry): void;
        cacheClear(): void;
        createServiceHooks(): ServiceHooks;
        redirectToSignIn(keepUrl?: boolean): void;
        showMessageDialog(options: MessageDialogOptions): Promise<number>;
        private _computeService(uri, user);
        private _onInitialized();
        private _updateRoute(path);
        private _computeProgramUnit(application, path);
        private _computeShowMenu(isSignedIn, noMenu);
        private _start(initializing, path);
        private _appRouteAdded(e, detail);
        private _registerKeybindings(registration);
        private _unregisterKeybindings(registration);
        private _keysPressed(e);
        static stripHashBang(path: string): string;
    }
    class AppServiceHooks extends Vidyano.ServiceHooks {
        app: App;
        constructor(app: App);
        onAction(args: ExecuteActionArgs): Promise<any>;
        onOpen(obj: ServiceObject, replaceCurrent?: boolean, fromAction?: boolean): Promise<any>;
        onClose(parent: Vidyano.ServiceObject): void;
        onMessageDialog(title: string, message: string, html: boolean, ...actions: string[]): Promise<number>;
        onSessionExpired(): void;
        onNavigate(path: string, replaceCurrent?: boolean): void;
        onClientOperation(operation: ClientOperations.ClientOperation): void;
    }
}
declare module Vidyano.WebComponents {
    class AttachedNotifier extends WebComponent {
        attached(): void;
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeAsDetail extends WebComponents.Attributes.PersistentObjectAttribute {
        private _inlineAddHeight;
        private _lastComputedWidths;
        attribute: Vidyano.PersistentObjectAttributeAsDetail;
        newAction: Vidyano.Action;
        newActionPinned: boolean;
        private _setInitializing;
        private _setWidth;
        private _setHeight;
        private _setNewAction;
        private _setDeleteAction;
        private _isColumnVisible(column);
        private _rowSizechanged(e, detail);
        private _computeColumns(columns);
        private _computeCanDelete(editing, deleteAction, objects);
        private _computeNewActionPinned(height, newAction);
        private _updateActions(actions, editing);
        private _updateWidths(columns, width, deleteAction, editing, isAttached);
        private _rowAdded(e);
        private _add(e);
        private _delete(e);
    }
    class PersistentObjectAttributeAsDetailRow extends WebComponents.WebComponent {
        private _isColumnVisible(column);
        private _getDisplayValue(obj, column);
        private _getAttributeForColumn(obj, column);
        private _scrollNewDetailRowIntoView(serviceObject, columns, editing, isAttached);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeBinaryFile extends WebComponents.Attributes.PersistentObjectAttribute {
        private _inputContainer;
        private _inputAttribute;
        private _change(e);
        private _registerInput(attribute, isAttached);
        private _clear();
        private _computeCanClear(value, readOnly);
        private _computeFileName(value);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
    }
    class PersistentObjectAttributeNullableBoolean extends WebComponents.Attributes.PersistentObjectAttribute {
        options: Common.KeyValuePair[];
        attached(): void;
        protected _valueChanged(newValue: any): void;
        private _notNull(value);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeComboBox extends WebComponents.Attributes.PersistentObjectAttribute {
        comboBoxOptions: string[];
        newValue: string;
        private _setComboBoxOptions;
        protected _editingChanged(): void;
        protected _optionsChanged(): void;
        private _add();
        private _computeCanAdd(newValue, options);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeCommonMark extends PersistentObjectAttribute {
        private _setMarkedElementLoaded;
        constructor();
        private _editTextAreaBlur();
        private _computeNotEditing(markedElementLoaded, editing);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeDateTime extends WebComponents.Attributes.PersistentObjectAttribute {
        private _dateInput;
        private _timeInput;
        private _syncedSelectedDate;
        private _lastRenderedSelectedDate;
        private _isDateFilled;
        private _isTimeFilled;
        hasTimeComponent: boolean;
        hasInvalidTime: boolean;
        hasDateComponent: boolean;
        hasInvalidDate: boolean;
        selectedDate: Date;
        private _setHasInvalidTime;
        private _setHasInvalidDate;
        private _dateComponentAttached();
        private _timeComponentAttached();
        protected _editingChanged(): void;
        protected _valueChanged(newValue: any): void;
        private _selectedDateChanged();
        private _clear();
        private _renderSelectedDate(forceDate?, forceTime?);
        private _dateFilled(e, detail);
        private _timeChanged(e, detail);
        private _timeFilled(e, detail);
        private _updateSelectedDate(date, time?);
        private _computeHasComponent(target, component);
        private _computeDateFormat();
        private _computeDateSeparator();
        private _computeTimeFormat();
        private _computeTimeSeparator();
        private _computeCanClear(value, required);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeDropDown extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any): void;
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeFlagsEnum extends WebComponents.Attributes.PersistentObjectAttribute {
    }
    class PersistentObjectAttributeFlagsEnumFlag extends WebComponents.WebComponent {
        private _skipCheckedChanged;
        attribute: Vidyano.PersistentObjectAttribute;
        checked: boolean;
        label: string;
        option: Vidyano.Common.KeyValuePair;
        private _checkedChanged();
        private _computeLabel(option);
        private _valueChanged(value, label);
        private _values(value);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeImage extends WebComponents.Attributes.PersistentObjectAttribute {
        private _pasteListener;
        _attributeChanged(): void;
        detached(): void;
        private _change(e);
        private _clear();
        private _computeCanClear(value);
        private _computeImage(value);
        private _pasteAuto(e);
        private _pasteCreateImage(source);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeKeyValueList extends WebComponents.Attributes.PersistentObjectAttribute {
        protected _valueChanged(newValue: any): void;
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeMultiLineString extends PersistentObjectAttribute {
        maxlength: number;
        height: string;
        protected _attributeChanged(): void;
        private _editTextAreaBlur();
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeNumeric extends WebComponents.Attributes.PersistentObjectAttribute {
        private _allowDecimal;
        private _isNullable;
        private _decimalSeparator;
        private _dataType;
        private static _decimalTypes;
        private static _unsignedTypes;
        _attributeChanged(): void;
        protected _attributeValueChanged(): void;
        protected _valueChanged(newValue: any): void;
        private _editInputBlur(e);
        private _canParse(value);
        private _between(value, minValue, maxValue);
        private _setCarretIndex(input, carretIndex);
        private _keypress(e);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributePassword extends WebComponents.Attributes.PersistentObjectAttribute {
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeReference extends WebComponents.Attributes.PersistentObjectAttribute {
        objectId: string;
        attribute: Vidyano.PersistentObjectAttributeWithReference;
        href: string;
        filter: string;
        private _setCanClear;
        private _setCanAddNewReference;
        private _setCanBrowseReference;
        attached(): void;
        protected _attributeChanged(): void;
        protected _valueChanged(newValue: any): void;
        private _objectIdChanged();
        private _filterBlur();
        protected _editingChanged(): void;
        private _browseReference(throwExceptions?);
        private _addNewReference(e);
        private _clearReference(e);
        private _update();
        private _open(e);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeString extends PersistentObjectAttribute {
        characterCasing: string;
        editInputStyle: string;
        inputtype: string;
        maxlength: number;
        suggestions: string[];
        private _setEditInputStyle;
        protected _attributeChanged(): void;
        private _editInputBlur();
        protected _valueChanged(): void;
        private _characterCasingChanged(casing);
        private _changeCasing(val);
    }
}
declare module Vidyano.WebComponents.Attributes {
    interface TranslatedString {
        key: string;
        label: string;
        value: string;
    }
    class PersistentObjectAttributeTranslatedString extends PersistentObjectAttribute {
        private _defaultLanguage;
        strings: TranslatedString[];
        private _setStrings;
        protected _optionsChanged(): void;
        protected _valueChanged(newValue: string): void;
        private _editInputBlur();
        private _computeMultiLine(attribute);
        private _computeCanShowDialog(readOnly, strings);
        private _showLanguagesDialog();
    }
    class PersistentObjectAttributeTranslatedStringDialog extends WebComponent {
        private _dialog;
        label: string;
        strings: TranslatedString[];
        show(): Promise<any>;
        private _ok();
        private _cancel();
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttributeUser extends WebComponents.Attributes.PersistentObjectAttribute {
        private _browseReference();
        private _clearReference();
        private _setNewUser(id, name);
        private _computeFriendlyName(options);
        private _computeCanClear(isRequired, value);
        private _computeCanBrowseReference(isReadOnly);
    }
}
declare module Vidyano.WebComponents.Attributes {
    class PersistentObjectAttribute extends WebComponent {
        static typeSynonyms: {
            [key: string]: string[];
        };
        attribute: Vidyano.PersistentObjectAttribute;
        value: any;
        editing: boolean;
        readOnly: boolean;
        protected _attributeValueChanged(): void;
        protected _optionsChanged(): void;
        protected _attributeChanged(): void;
        protected _editingChanged(): void;
        protected _valueChanged(newValue: any): void;
        private _computeHasError(validationError);
        static registerAttribute(obj: any, info?: WebComponentRegistrationInfo, finalized?: (ctor: any) => void): void;
    }
    class PersistentObjectAttributeEdit extends WebComponent {
        private _setFocus;
        attribute: Vidyano.PersistentObjectAttribute;
        private _focus(e);
        private _blur(e);
        private _showError();
        private _computeHasError(validationError);
    }
}
declare module Vidyano.WebComponents {
    class Button extends WebComponents.WebComponent {
        private _setCustomLayout;
        attached(): void;
    }
}
declare module Vidyano.WebComponents {
    class Checkbox extends WebComponents.WebComponent {
        checked: boolean;
        label: string;
        disabled: boolean;
        toggle(): void;
        private _computeIsNull(checked);
    }
}
declare module Vidyano.WebComponents {
    class DatePicker extends WebComponent {
        private _today;
        private _daysBody;
        private _monthsAndYearsBody;
        private _dayCells;
        private _monthsAndYearsCells;
        private _currentDate;
        private _minYears;
        header: string;
        zoom: string;
        selectedDate: Date;
        attached(): void;
        private _zoomChanged();
        private _selectedDateChanged();
        private _render(zoom?);
        private _getDayClass(day, month, year, baseClass?);
        private _forward(e);
        private _fastForward(e);
        private _backward(e);
        private _fastBackward(e);
        private _zoomOut(e);
        private _select(e);
        private _catchClick(e);
    }
}
declare module Vidyano.WebComponents {
    interface DialogOptions {
        autoSize?: boolean;
    }
    class DialogInstance {
        options: DialogOptions;
        result: Promise<any>;
        private _resolve;
        private _reject;
        constructor(options: DialogOptions, result: Promise<any>, _resolve: Function, _reject: Function);
        resolve(result?: any): void;
        reject(error?: any): void;
    }
    class Dialog extends WebComponent {
        private _translate;
        private _instance;
        private _setShown;
        private _setAutoSize;
        private _setDragging;
        private _set_translate;
        show(options?: DialogOptions): DialogInstance;
        private _close();
        private _track(e, detail);
        private _translateChanged();
    }
}
declare module Vidyano.WebComponents {
    class InputSearch extends WebComponent {
        value: string;
        focused: boolean;
        collapsed: boolean;
        private _searchKeypressed(e);
        private _searchClick(e?);
        private _input_focused();
        private _input_blurred();
        private _stop_tap(e);
        focus(): void;
    }
}
declare module Vidyano.WebComponents {
    class MaskedInput extends WebComponent {
        format: string;
        separator: string;
        private _initialize(format, separator, isAttached);
    }
}
declare module Vidyano.WebComponents {
    class Menu extends WebComponent {
        filter: string;
        filtering: boolean;
        programUnit: ProgramUnit;
        collapsed: boolean;
        attached(): void;
        private _filterChanged();
        private _search();
        private _toggleCollapse();
        private _hasGroupItems(programUnitItems);
        private _countItems(programUnitItems);
    }
    class MenuItem extends WebComponent {
        item: Vidyano.ProgramUnitItem;
        programUnit: Vidyano.ProgramUnit;
        expand: boolean;
        filter: string;
        filtering: boolean;
        hide: boolean;
        filterParent: ProgramUnitItem;
        private _setExpand;
        private _tap(e);
        private _filterChanged();
        private _hasMatch(item, search);
        private _programUnitChanged();
        private _updateItemTitle(item, filter, filtering, collapsed);
        private _computedHasItems(item);
        private _computedHref(item);
    }
}
declare module Vidyano.WebComponents {
    interface MessageDialogOptions extends DialogOptions {
        noClose?: boolean;
        title?: string;
        titleIcon?: string;
        actions?: string[];
        actionTypes?: string[];
        message: string;
        extraClasses?: string[];
        html?: boolean;
    }
    class MessageDialog extends WebComponent {
        private _dialog;
        options: MessageDialogOptions;
        private _setOptions;
        show(options: MessageDialogOptions): Promise<any>;
        private _close();
        private _hasHeaderIcon(options);
        private _getActionType(options, index);
        private _onSelectAction(e);
        private _isFirst(index);
    }
}
declare module Vidyano.WebComponents {
    class Notification extends WebComponent {
        serviceObject: Vidyano.ServiceObjectWithActions;
        isOverflowing: boolean;
        type: string;
        text: string;
        private _setIsOverflowing;
        private _close();
        private _moreInfo(e);
        private _trackerSizeChanged(e);
        private _textChanged();
        private _setTextOverflow();
        private _computeText(notification);
        private _computeShown(text);
        private _getIconType(type);
        private _computeIcon(type);
    }
}
declare module Vidyano.WebComponents {
    class Overflow extends WebComponent {
        private _overflownChildren;
        private _visibibleSizeChangedSkip;
        hasOverflow: boolean;
        private _setHasOverflow;
        private _visibleSizeChanged(e, detail);
        protected _getChildren(): linqjs.Enumerable<HTMLElement>;
        private _popupOpening();
        private _popupClosed();
        private _popup(e);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObject extends WebComponent {
        private _uniqueId;
        private _parameters;
        private _styleElement;
        private _styles;
        private _cacheEntry;
        persistentObject: Vidyano.PersistentObject;
        layout: string;
        masterWidth: string;
        masterTabs: Vidyano.PersistentObjectTab[];
        selectedMasterTab: Vidyano.PersistentObjectTab;
        detailTabs: Vidyano.PersistentObjectTab[];
        selectedDetailTab: Vidyano.PersistentObjectTab;
        attached(): void;
        detached(): void;
        private _persistentObjectChanged(persistentObject, isAttached);
        private _masterWidthChanged();
        private _setStyle(name, ...css);
        private _computeMasterTabs(persistentObject, tabs);
        private _computeDetailTabs(persistentObject, tabs);
        private _detailTabsChanged();
        private _masterTabsChanged();
        private _selectedMasterTabChanged();
        private _selectedDetailTabChanged();
        private _computeLayout(persistentObject, masterTabs?, detailTabs?);
        private _disableTabScrolling(tab);
        private _hasMasterTabs(tabs);
        private _hasDetailTabs(tabs);
        private _trackSplitter(e, detail);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectAttributePresenter extends WebComponent {
        private static _attributeImports;
        private _templatePresenter;
        attribute: Vidyano.PersistentObjectAttribute;
        private _setLoading;
        private _attributeChanged(attribute, isAttached);
        private _getAttributeTypeImportInfo(type);
        private _renderAttribute(attribute, attributeType);
        private _computeRequired(required, value);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectDialog extends WebComponent {
        private _dialog;
        private _saveHook;
        persistentObject: Vidyano.PersistentObject;
        tab: Vidyano.PersistentObjectAttributeTab;
        private _setPersistentObject;
        show(persistentObject: Vidyano.PersistentObject, save?: (po: Vidyano.PersistentObject) => Promise<any>): Promise<any>;
        private _save();
        private _cancel();
        private _computeTab(persistentObject);
        private _onSelectAction(e);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectGroup extends WebComponent {
        group: Vidyano.PersistentObjectAttributeGroup;
        private _computeLabel(group);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectPresenter extends WebComponent {
        private static _persistentObjectComponentLoader;
        private _cacheEntry;
        persistentObjectId: string;
        persistentObjectObjectId: string;
        persistentObject: Vidyano.PersistentObject;
        private _setLoading;
        private _setError;
        private _activating(e, detail);
        private _computePersistentObject();
        private _computeHasError(error);
        private _persistentObjectChanged(persistentObject, oldPersistentObject);
        private _renderPersistentObject(persistentObject);
        private _edit();
        private _save();
        private _cancelSave();
    }
}
declare module Vidyano.WebComponents {
    interface Position {
        x: number;
        y: number;
    }
    interface Size {
        width: number;
        height: number;
    }
    class PersistentObjectTabItem extends Vidyano.Common.Observable<PersistentObjectTabItem> implements Position {
        target: any;
        private _x;
        private _y;
        private _width;
        private _height;
        constructor(target: any);
        x: number;
        y: number;
        width: number;
        height: number;
    }
    class PersistentObjectTab extends WebComponent {
        private _itemDragTargetPosition;
        private _itemDragTargetSize;
        private _lastArrangedColumnCount;
        tab: Vidyano.PersistentObjectAttributeTab;
        designMode: boolean;
        cells: PersistentObjectTabCell[][];
        items: PersistentObjectTabItem[];
        columns: number;
        rows: number;
        width: number;
        height: number;
        cellWidth: number;
        cellHeight: number;
        private _setItems;
        private _setWidth;
        private _setHeight;
        private _setCellWidth;
        private _setCellHeight;
        private _setRows;
        private _setItemDragging;
        private _computeIsDesignModeAvailable(tab);
        private _computeDesignModeCells(items, columns, rows);
        private _computeColumns(width, defaultColumnCount);
        private _arrangeAutoLayout(tab, groups, columns);
        private _sizeChanged(e, detail);
        private _cellsForEach(fnc, cells?);
        private _itemDragStart(e, detail);
        private _itemDragEnd(e, detail);
        private _itemDrag(e, detail);
        private _toggleDesignMode(e);
    }
    class PersistentObjectTabCell extends WebComponent {
        x: number;
        y: number;
        constructor(x: number, y: number);
    }
    class PersistentObjectTabItemPresenter extends WebComponent {
        private _renderedItem;
        private _itemObserver;
        private _position;
        private _size;
        cellWidth: number;
        cellHeight: number;
        item: PersistentObjectTabItem;
        designMode: boolean;
        private _setDragging;
        private _computeLayout();
        private _itemPropertyChanged(sender, args);
        private _setPosition(x, y);
        private _setSize(width?, height?);
        private _track(e, detail);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectTabBar extends WebComponent {
        private _observeDisposer;
        tabs: Vidyano.PersistentObjectTab[];
        selectedTab: Vidyano.PersistentObjectTab;
        private _hookObservers();
        private _tabSelected(e, detail);
        private isInline(mode);
        private isDropDown(mode);
        private _isVisible(tab);
    }
    class PersistentObjectTabBarItem extends WebComponent {
        tab: Vidyano.PersistentObjectTab;
        private _select();
        private _computeIsSelected(tab, selectedTab);
        private _computeHasBadge(badge);
    }
}
declare module Vidyano.WebComponents {
    class PersistentObjectTabPresenter extends WebComponent {
        private static _persistentObjectTabComponentLoader;
        private _templatePresenter;
        private _renderedTab;
        tab: Vidyano.PersistentObjectTab;
        templated: boolean;
        scroll: boolean;
        private _setLoading;
        private _setTemplated;
        private _renderTab(tab, isAttached);
    }
}
declare module Vidyano.WebComponents {
    class Popup extends WebComponent {
        private static _openPopups;
        private _tapHandler;
        private _enterHandler;
        private _leaveHandler;
        private _resolver;
        private _closeOnMoveoutTimer;
        private _currentOrientation;
        private _header;
        disabled: boolean;
        contentAlign: string;
        orientation: string;
        sticky: boolean;
        open: boolean;
        autoSizeContent: boolean;
        openOnHover: boolean;
        private _setOpen(val);
        popup(): Promise<any>;
        private _hookTapAndHoverEvents();
        private _tap(e);
        private _onOpen(e);
        private _open(orientation?);
        close(): void;
        protected _findParentPopup(): Popup;
        private _toggleSizeChanged(e, detail);
        private _catchContentClick(e?);
        private _contentMouseEnter(e);
        private _contentMouseLeave(e);
        private _hasHeader(header);
        static closeAll(parent?: HTMLElement | WebComponent): void;
        private static _isDescendant(parent, child);
    }
}
declare module Vidyano.WebComponents {
    class PopupMenu extends WebComponent {
        private _openContextEventListener;
        contextMenuOnly: boolean;
        shiftKey: boolean;
        ctrlKey: boolean;
        rightAlign: boolean;
        openOnHover: boolean;
        popup(): Promise<any>;
        private _hookContextMenu(isAttached, contextMenu);
        private _openContext(e);
        private _alignmentChanged();
        private _mouseenter();
        private _mousemove(e);
    }
    class PopupMenuItem extends WebComponent {
        label: string;
        split: boolean;
        attached(): void;
        private _splitTap(e);
    }
    class PopupMenuItemSeparator extends WebComponent {
    }
}
declare module Vidyano.WebComponents {
    class ProgramUnitPresenter extends WebComponent {
    }
}
declare module Vidyano.WebComponents {
    class Query extends WebComponent {
        private _cacheEntry;
        query: Vidyano.Query;
        attached(): void;
        private _queryChanged();
        private _computeNoActions(actions);
        private _computeSearchOnHeader(noActions, query);
    }
}
declare module Vidyano.WebComponents {
    class QueryGridCellBoolean extends QueryGridCell {
        private _resource;
        protected _render(dom: HTMLElement): void;
    }
    var QueryGridCellNullableBoolean: typeof QueryGridCellBoolean;
    var QueryGridCellYesNo: typeof QueryGridCellBoolean;
    class QueryGridCellImage extends QueryGridCell {
        private _img;
        private _hasImage;
        protected _render(dom: HTMLElement): void;
    }
}
declare module Vidyano.WebComponents {
    class QueryGridFilters extends WebComponent {
        private _dialog;
        private _preventColumnFilterChangedListener;
        query: Vidyano.Query;
        currentFilter: string;
        filters: string[];
        private _setCurrentFilter;
        private _setFilters;
        private _setFiltering;
        private _queryChanged(query);
        private _currentFilterChanged();
        private _computeFilters(filters);
        private _computeCanOpen(filters, filtering);
        private _columnFilterChangedListener(e);
        private _updateFiltering();
        private _getFilterObject(name);
        private _getColumnsFilterData(query);
        private _save();
        private _saveCurrent();
        private _reset();
        private _edit(e);
        private _load(e);
        private _delete(e);
        private _ok();
        private _cancel();
        private _getCurrentFilterSave(currentFilter);
    }
}
declare module Vidyano.WebComponents {
    interface QueryGridItemClickEventArgs {
        item: QueryResultItem;
        column?: QueryColumn;
    }
    interface QueryGridColumnHosts {
        header: HTMLElement;
        pinned: HTMLElement;
        unpinned: HTMLElement;
    }
    interface Viewport {
        width: number;
        height: number;
    }
    class QueryGrid extends WebComponent {
        static _isChrome: boolean;
        static _isSafari: boolean;
        private _queuedUnattachedWork;
        private _uniqueId;
        private _rows;
        private _horizontalScrollPanels;
        private _pinnedColumns;
        private _unpinnedColumns;
        private _styles;
        private _itemOpening;
        private _lastSelectedItemIndex;
        private remainderWidth;
        private verticalScrollOffset;
        private horizontalScrollOffset;
        viewport: Viewport;
        query: Vidyano.Query;
        initializing: boolean;
        disableSelect: boolean;
        disableInlineActions: boolean;
        asLookup: boolean;
        _setInitializing: (val: boolean) => void;
        _setViewport: (viewport: Viewport) => void;
        private _setDisableSelect;
        attached(): void;
        detached(): void;
        pinnedColumns: QueryGridColumn[];
        unpinnedColumns: QueryGridColumn[];
        headers: QueryGridColumnHeaders;
        filters: QueryGridColumnFilters;
        items: QueryGridItems;
        private _style;
        private _columnsChanged(columns);
        private _itemsChanged(items, isAttached, viewport);
        private _updateHorizontalSpacer();
        private _measureColumnsListener(e);
        private _columnWidthUpdatedListener(e, detail);
        private _updateColumnWidthsStyle(columns);
        private _itemSelectListener(e, detail);
        private _filterChangedListener(e);
        private _columnFilterChangedListener(e);
        private _sizeChanged(e, detail);
        private _verticalScrollOffsetChanged(verticalScrollOffset);
        private _horizontalScrollOffsetChanged(horizontalScrollOffset);
        private _onScrollHorizontal(e);
        private _updateHoverRow(e);
        private _itemsTap(e, detail);
        private _sortingStart(e);
        private _sortingEnd(e);
        private _updateColumnPinning(e, detail, sender);
        private _updateColumnOffset();
        private _computeDisableInlineActions(actions);
        private _computeDisableSelect(actions);
        private _computeRemainderWidth();
        private _itemsMouseenter();
        private _itemsMouseleave();
    }
    class QueryGridColumn {
        private _column;
        private _safeName;
        currentWidth: number;
        isAttached: boolean;
        constructor(_column: QueryColumn);
        column: QueryColumn;
        safeName: string;
        name: string;
    }
    class QueryGridRow {
        private _grid;
        private _hosts;
        private _remainder;
        private _columnsOrder;
        constructor(_grid: QueryGrid, _hosts: QueryGridColumnHosts);
        hosts: QueryGridColumnHosts;
        grid: QueryGrid;
        updateColumns(pinned: QueryGridColumn[], unpinned: QueryGridColumn[]): void;
        getColumnWidth(gridColumn: QueryGridColumn): number;
        protected _createRemainder(): HTMLElement;
        protected _createColumnElement(column: QueryGridColumn): Element;
        protected _removedColumnElement(element: Element): void;
        protected _getColumnNameForElement(element: Element): string;
        protected _updateColumns(gridColumns: QueryGridColumn[], host: HTMLElement): void;
    }
    class QueryGridColumnHeaders extends QueryGridRow {
        protected _createRemainder(): HTMLElement;
        protected _createColumnElement(column: QueryGridColumn): Element;
        protected _getColumnNameForElement(element: Element): string;
    }
    class QueryGridColumnFilters extends QueryGridRow {
        private _filterMenu;
        updateColumns(pinned: QueryGridColumn[], unpinned: QueryGridColumn[]): void;
        refreshColumns(): void;
        refreshHeader(): void;
        protected _createRemainder(): HTMLElement;
        protected _createColumnElement(column: QueryGridColumn): Element;
        protected _getColumnNameForElement(element: Element): string;
    }
    class QueryGridItems extends QueryGridRow {
        private _items;
        private _measuredRowWidths;
        private _rowHeight;
        private _fireColumnMeasurement;
        private _viewportEndRowIndex;
        private _viewportStartRowIndex;
        private _pendingNewRowsStartIndex;
        private _rowsStartIndex;
        private _virtualHeight;
        private _dataTop;
        private _currentHoverRowIndex;
        private _lastKnownMouseYPosition;
        private _debouncedGetItems;
        private _data;
        private _verticalSpacer;
        constructor(grid: QueryGrid, hosts: QueryGridColumnHosts);
        detached(): void;
        data: Scroller;
        verticalSpacer: HTMLElement;
        virtualHeight: number;
        protected _createRemainder(): HTMLElement;
        getColumnWidth(column: QueryGridColumn): number;
        getItem(row: HTMLElement): QueryResultItem;
        updateRows(): void;
        updateColumns(pinned: QueryGridColumn[], unpinned: QueryGridColumn[]): void;
        updateTablePosition(forceRender?: boolean, skipSearch?: boolean): void;
        updateHoverRow(yPosition?: number): void;
        onScroll(verticalScrollOffset: number): void;
    }
    class QueryGridItemActions extends WebComponent {
        private _updateActionItems;
        item: QueryResultItem;
        private _popupOpening();
        private _itemChanged();
        private _mousemove(e);
        popup(): Promise<any>;
    }
    class QueryGridItemSelector extends WebComponent {
        private _selectedItemsObserver;
        private _query;
        item: QueryResultItem;
        isSelected: boolean;
        private _setIsSelected;
        detached(): void;
        private _updateIsSelected(isAttached, item);
        private _selectedItemsChanged(source, detail);
        private _select(e);
    }
    class QueryGridColumnHeader extends WebComponent {
        private _grid;
        private _resizeX;
        private _resizeStartWidth;
        private _resizeMinWidth;
        gridColumn: QueryGridColumn;
        column: QueryColumn;
        private _setGridColumn;
        constructor(column: QueryGridColumn);
        attached(): void;
        private _sort(e);
        private _resizeStart(e);
        private _resizeMove(e);
        private _resizeEnd(e);
        private _getIsSorting(direction);
        private _getSortingIcon(direction);
    }
    class QueryGridColumnFilter extends WebComponent {
        private static _selector;
        private _popupOpening;
        private _grid;
        gridColumn: QueryGridColumn;
        searchText: string;
        filtered: boolean;
        label: string;
        inversed: boolean;
        private _setGridColumn;
        private _setLoading;
        private _setInversed;
        constructor(column: QueryGridColumn);
        attached(): void;
        refresh(): void;
        private _getTargetCollection();
        private _distinctClick(e);
        private __popupOpening(e);
        private _addDistinctValue(target, value, className?);
        private _getDistinctDisplayValue(value);
        private _updateDistincts();
        private _renderDistincts(target?);
        private _search();
        private _closePopup();
        private _updateFiltered();
        private _inverse(e);
        private _clear(e);
        private _catchClick(e);
    }
    class QueryGridCell {
        private _dom;
        private _host;
        private _item;
        private _gridColumn;
        private _foreground;
        private _fontWeight;
        private _textAlign;
        private _extraClass;
        private _typeHints;
        initialize(column: QueryGridColumn): QueryGridCell;
        host: HTMLTableDataCellElement;
        gridColumn: QueryGridColumn;
        width: number;
        private _type;
        item: QueryResultItem;
        protected _render(dom: HTMLElement): void;
        protected _getTypeHint(name: string, defaultValue?: string): string;
    }
}
declare module Vidyano.WebComponents {
    class QueryItemsPresenter extends WebComponent {
        private static _queryGridComponentLoader;
        private _content;
        query: Vidyano.Query;
        private _queryChanged(query, oldQuery);
        private _renderGrid(query);
        private _refresh();
        private _new();
        private _delete();
        private _bulkEdit();
    }
}
declare module Vidyano.WebComponents {
    class QueryPresenter extends WebComponent {
        private static _queryComponentLoader;
        private _cacheEntry;
        queryId: string;
        query: Vidyano.Query;
        private _setLoading;
        private _setError;
        private _activating(e, detail);
        private _computeQuery();
        private _queryChanged(query, oldQuery);
        private _renderQuery(query);
    }
}
declare module Vidyano.WebComponents {
    class Resource extends WebComponent {
        private _loadedSource;
        name: string;
        source: string;
        icon: boolean;
        model: any;
        hasResource: boolean;
        attached(): void;
        private _nameChanged();
        private _setIcon(value);
        private _setHasResource(value);
        private _load();
        static Load(source: string | Resource): DocumentFragment;
        static LoadResource(source: string): Resource;
        static Exists(name: string): boolean;
    }
}
declare module Vidyano.WebComponents {
    class Scroller extends WebComponent {
        private static _minBarSize;
        private _setHovering;
        private _setScrolling;
        private _scrollbarWidth;
        private _verticalScrollHeight;
        private _verticalScrollTop;
        private _verticalScrollSpace;
        private _horizontalScrollWidth;
        private _horizontalScrollLeft;
        private _horizontalScrollSpace;
        private _trackStart;
        outerWidth: number;
        outerHeight: number;
        innerWidth: number;
        innerHeight: number;
        horizontal: boolean;
        noHorizontal: boolean;
        vertical: boolean;
        noVertical: boolean;
        horizontalScrollOffset: number;
        verticalScrollOffset: number;
        forceScrollbars: boolean;
        private _setOuterWidth;
        private _setOuterHeight;
        private _setInnerWidth;
        private _setInnerHeight;
        private _setHorizontal;
        private _setVertical;
        private _setScrollTopShadow;
        private _setScrollBottomShadow;
        private _setHiddenScrollbars;
        scrollToTop(): void;
        scrollToBottom(): void;
        private _outerSizeChanged(e, detail);
        private _innerSizeChanged(e, detail);
        private _updateVerticalScrollbar(outerHeight, innerHeight, verticalScrollOffset, noVertical);
        private _updateHorizontalScrollbar(outerWidth, innerWidth, horizontalScrollOffset, noHorizontal);
        private _trackVertical(e, detail);
        private _trackHorizontal(e, detail);
        private _trapEvent(e);
        private _scroll(e);
        private _updateScrollOffsets();
        private _verticalScrollOffsetChanged(newVerticalScrollOffset);
        private _horizontalScrollOffsetChanged(newHorizontalScrollOffset);
        private _mouseenter();
        private _mouseleave();
        private _verticalScrollbarParentTap(e);
        private _horizontalScrollbarParentTap(e);
    }
}
declare module Vidyano.WebComponents {
    class Select extends WebComponent {
        private items;
        private filteredItems;
        private selectedItem;
        private suggestion;
        private filtering;
        private _lastMatchedInputValue;
        private _inputValue;
        private _pendingSelectedOption;
        options: string[] | Common.KeyValuePair[];
        selectedOption: string;
        private _setSuggestion;
        private _setSelectedItem;
        private _setFiltering;
        private popup;
        private _keydown(e);
        private _keyup(e);
        private _openPopup();
        private _popupOpened();
        private _popupClosed();
        private _scrollItemIntoView();
        private _computeItems(options);
        private _computeFilteredItems(items, inputValue, filtering, selectedOption);
        private _computeSuggestionFeedback(inputValue, suggestion, filtering);
        private _setSelectedOption(option, force?);
        private _selectedItemChanged();
        private _selectedOptionChanged();
        private _suggestionChanged();
        private _getItem(key, items?);
        private _optionTap(e, detail);
        private _equals(item1, item2);
        private _isReadonlyInput(readonly, disableFiltering);
    }
}
declare module Vidyano.WebComponents {
    class SelectReferenceDialog extends WebComponent {
        private _grid;
        private _itemClickCallback;
        private _dialog;
        canSelect: boolean;
        query: Vidyano.Query;
        detached(): void;
        show(): Promise<any>;
        private _selectedItemsChanged();
        private _invalidateCanSelect(selectedItems?);
        private _queryPropertyChanged(sender, detail);
        private _select();
        private _cancel();
        private _search(e, detail);
        private _selectReference(e);
    }
}
declare module Vidyano.WebComponents {
    class SessionPresenter extends WebComponent {
        private _templatePresenter;
        private _computeApplication(isAttached);
        private _computeSession(session);
    }
}
declare module Vidyano.WebComponents {
    class SignIn extends WebComponent {
        error: string;
        vidyanoOnly: boolean;
        image: string;
        private _setVidyanoOnly;
        private _activating(e, detail);
        private _imageChanged();
    }
    class SignInProvider extends WebComponent {
        private _signInButton;
        private _signInButtonWidth;
        private _signingInMessage;
        name: string;
        userName: string;
        password: string;
        staySignedIn: boolean;
        isVidyano: boolean;
        expand: boolean;
        signingIn: boolean;
        signingInCounter: number;
        private _setExpand;
        private _setSigningIn;
        private _vidyanoSignInAttached();
        private _keydown(e);
        private _computeLabel();
        private _computeDescription();
        private _computeIsVidyano();
        private _tap();
        private _autoFocus();
        private _signIn();
        private _computeSigninButtonLabel(signingIn, signingInCounter);
    }
}
declare module Vidyano.WebComponents {
    class SizeTracker extends WebComponent {
        private _resizeTimer;
        private _resizeTimerQueuedElements;
        private _resizeLast;
        private _resizeRAF;
        private _scrollListener;
        deferred: boolean;
        attached(): void;
        detached(): void;
        measure(): void;
        private _onScroll(e);
        private _triggerSizeChanged();
        private _resizeTimerMicroTask();
        private _resetTriggers(element);
    }
}
declare module Vidyano.WebComponents {
    class Sortable extends WebComponent {
        private _sortable;
        private _isDragging;
        private _isGroupDragging;
        group: string;
        filter: string;
        disabled: boolean;
        attached(): void;
        detached(): void;
        groupChanged(): void;
        filterChanged(): void;
        disabledChanged(): void;
        private _create();
        private _destroy();
    }
}
declare module Vidyano.WebComponents {
    class Spinner extends WebComponent {
    }
}
declare module Vidyano.WebComponents {
    class Style extends Vidyano.WebComponents.WebComponent {
        private _uniqueId;
        private _styleElement;
        private _styles;
        key: string;
        attached(): void;
        detached(): void;
        setStyle(name: string, ...css: string[]): void;
    }
}
declare module Vidyano.WebComponents {
    class TemplatePresenter extends WebComponent {
        private _sourceTemplate;
        dataContextName: string;
        dataContext: any;
        private _domBindTemplate;
        constructor(_sourceTemplate: any, dataContextName?: string, dataContext?: any);
        private _render(dataContextName, dataContext);
    }
}
declare module Vidyano.WebComponents {
    class TimePicker extends WebComponent {
        hours: number;
        minutes: number;
        state: string;
        time: Date;
        private _setHours;
        private _setMinutes;
        attached(): void;
        private _timeChanged();
        private _tap(e, detail, sender);
        private _switch(e, detail);
        private _updateTime();
        private _catchClick(e);
        private _zeroPrefix(n);
    }
}
declare module Vidyano.WebComponents {
    class User extends WebComponent {
        private service;
        isSignedIn: boolean;
        collapsed: boolean;
        private _setService;
        private _setIsSignedIn;
        private _setCanFeedback;
        private _setCanUserSettings;
        private _setUserName;
        attached(): void;
        signIn(): void;
        signOut(): void;
        feedback(): void;
        userSettings(): void;
        private _signedInChanged();
    }
}
declare module Vidyano.WebComponents {
    enum PathObserverState {
        Unopened = 0,
        Opened = 1,
        Closed = 2,
        Resetting = 3,
    }
    module Keyboard {
        enum KeyCodes {
            backspace = 8,
            tab = 9,
            enter = 13,
            shift = 16,
            control = 17,
            alt = 18,
            pause = 19,
            break = 19,
            capslock = 20,
            escape = 27,
            pageup = 33,
            pagedown = 34,
            end = 35,
            home = 36,
            leftarrow = 37,
            uparrow = 38,
            rightarrow = 39,
            downarrow = 40,
            comma = 44,
            subtract = 45,
            period = 46,
            zero = 48,
            one = 49,
            two = 50,
            three = 51,
            four = 52,
            five = 53,
            six = 54,
            seven = 55,
            eight = 56,
            nine = 57,
        }
        var KeyIdentifiers: {
            "0": string;
            "1": string;
            "2": string;
            "3": string;
            "4": string;
            "5": string;
            "6": string;
            "7": string;
            "8": string;
            "9": string;
            "tab": string;
            "esc": string;
            "space": string;
            "*": string;
            "a": string;
            "b": string;
            "c": string;
            "d": string;
            "e": string;
            "f": string;
            "g": string;
            "h": string;
            "i": string;
            "j": string;
            "k": string;
            "l": string;
            "m": string;
            "n": string;
            "o": string;
            "p": string;
            "q": string;
            "r": string;
            "s": string;
            "t": string;
            "u": string;
            "v": string;
            "w": string;
            "x": string;
            "y": string;
            "z": string;
            "del": string;
        };
        interface Event extends KeyboardEvent {
            keyIdentifier: string;
        }
        interface KeysEvent extends CustomEvent {
            detail: {
                combo: string;
                key: string;
                shiftKey?: boolean;
                ctrlKey?: boolean;
                altKey?: boolean;
                metaKey?: boolean;
                event: string;
                keyboardEvent: Event;
            };
        }
        interface KeybindingRegistration {
            keys: string[];
            element: HTMLElement;
            listener: (e: KeysEvent) => void;
            nonExclusive: boolean;
            priority?: number;
            appRoute?: Vidyano.WebComponents.AppRoute;
        }
    }
    var scrollbarWidth: () => number;
    interface WebComponentKeybindingInfo {
        [keys: string]: {
            listener: string;
            /**
            * if nonExclusive is set to true then the observer will also be called when there are other observers bound to any of the same keys.
            */
            nonExclusive?: boolean;
        } | string;
    }
    interface WebComponentRegistrationInfo {
        properties?: PolymerProperties;
        hostAttributes?: {
            [name: string]: any;
        };
        listeners?: {
            [eventName: string]: string;
        };
        observers?: string[];
        extends?: string;
        /**
        * Binds keys to local observer functions
        */
        keybindings?: WebComponentKeybindingInfo;
        /**
        * forwardObservers is used to forward Vidyano.Common.Observable notifications to Polymer notifyPath
        */
        forwardObservers?: string[];
    }
    interface ObserveChainDisposer {
        (): void;
    }
    class WebComponent {
        /**
         * $ contains all names of elements in the shady DOM with an id attribute.
         */
        $: {
            [id: string]: HTMLElement;
        };
        /**
        * Convenience method to run `querySelector` on this local DOM scope.
        */
        $$: (selector: string) => HTMLElement | WebComponents.WebComponent;
        /**
         * Shady DOM entry point.
         */
        root: HTMLElement | WebComponent;
        /**
          * Invokes a function asynchronously. The context of the callback
          * function is bound to 'this' automatically.
          * @method async
          * @param {Function|String} method
          * @param {any|Array} args
          * @param {number} timeout
          */
        async: {
            (method: string, args?: any, timeout?: number): number;
            (method: Function, args?: any, timeout?: number): number;
        };
        /**
         * Cancels the async function call.
         */
        cancelAsync: (handle: number) => void;
        /**
          * Fire an event.
          * @method fire
          * @returns {Object} event
          * @param {string} type An event name.
          * @param {any} detail
          * @param {Node} onNode Target node.
          */
        fire: (type: string, detail: any, options?: {
            onNode?: Node;
            bubbles?: boolean;
            cancelable?: boolean;
        }) => CustomEvent;
        /**
          * Adds new elements to the end of an array, returns the new length and notifies Polymer that the array has changed.
        **/
        push: (path: string, ...items: any[]) => number;
        /**
          * Removes the last element of an array, returns that element and notifies Polymer that the array has changed.
        **/
        pop: (path: string) => any;
        /**
          * Adds new elements to the beginning of an array, returns the new length and notifies Polymer that the array has changed.
        **/
        unshift: (path: string, items: any[]) => number;
        /**
          * Removes the first element of an array, returns that element and notifies Polymer that the array has changed.
        **/
        shift: (path: string) => any;
        /**
          * Adds/Removes elements from an array and notifies Polymer that the array has changed.
        **/
        splice: (path: string, index: number, removeCount?: number, items?: any[]) => any[];
        /**
         * Dynamically imports an HTML document.
         */
        importHref: (href: string, onLoad?: (e: CustomEvent) => void, onFail?: (e: CustomEvent) => void) => void;
        /**
         * Takes a URL relative to the <dom-module> of an imported Polymer element, and returns a path relative to the current document.
         * This method can be used, for example, to refer to an asset delivered alongside an HTML import.
         */
        resolveUrl: (href: string) => string;
        set: (path: string, value: any, root?: WebComponent) => void;
        notifyPath: (path: string, value: any, fromAbove?: boolean) => void;
        /**
         * Appends the node or webComponent to this component.
         */
        appendChild: {
            <TNode extends Node>(node: TNode): TNode;
            <TWebComponent>(component: TWebComponent): TWebComponent;
        };
        /**
         * Gets the attribute value with the specified name.
         */
        getAttribute: (name?: string) => string;
        className: string;
        classList: DOMTokenList;
        tagName: string;
        style: CSSStyleDeclaration;
        isAttached: boolean;
        app: Vidyano.WebComponents.App;
        private _setIsAttached;
        private _appRequested;
        protected translations: any;
        protected _setApp: (app: Vidyano.WebComponents.App) => void;
        asElement: HTMLElement;
        attached(): void;
        detached(): void;
        attributeChanged(attribute?: string, oldValue?: any, newValue?: any): void;
        empty(): void;
        findParent<T>(type: any): T;
        translateMessage(key: string, ...params: string[]): string;
        protected escapeHTML(val: string): string;
        protected _forwardObservable(source: Vidyano.Common.Observable<any> | Array<any>, path: string, pathPrefix: string, callback?: (path: string) => void): ObserveChainDisposer;
        private _forwardComputed(value);
        private _forwardNegate(value);
        static getName(fnc: Function): string;
        static register(obj: any, ns?: any, prefix?: string, info?: WebComponentRegistrationInfo, finalized?: (ctor: any) => void): void;
    }
}
