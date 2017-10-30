interface String {
    asDataUri(): string;
    contains(str: string): boolean;
    endsWith(suffix: string): boolean;
    insert(str: string, index: number): string;
    padLeft(width: number, str?: string): string;
    padRight(width: number, str?: string): string;
    startsWith(prefix: string): boolean;
    trimEnd(c: string): string;
    trimStart(c: string): string;
    localeFormat(format: string, useDefault: boolean): string;
}

interface Date {
    netType(value: string);
    netType(): string;

    netOffset(value: string);
    netOffset(): string;

    format(format: string): string;
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

declare namespace Vidyano {
    export function noop();
    export function extend(target: any, ...sources: any[]);
    export function splitWithTail(value: string, separator: string | RegExp, limit?: number): string[]
    export function _debounce(func: Function, wait: number, immediate?: boolean): Function;
}