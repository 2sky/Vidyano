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
    toKebabCase(): string;
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
// Type definitions for Bignumber.js
// Project: bignumber.js
// Definitions by: Felix Becker https://github.com/felixfbecker

interface Format {
    /** the decimal separator */
    decimalSeparator?: string;
    /** the grouping separator of the integer part */
    groupSeparator?: string;
    /** the primary grouping size of the integer part */
    groupSize?: number;
    /** the secondary grouping size of the integer part */
    secondaryGroupSize?: number;
    /** the grouping separator of the fraction part */
    fractionGroupSeparator?: string;
    /** the grouping size of the fraction part */
    fractionGroupSize?: number;
}

interface Configuration {

    /**
     * integer, `0` to `1e+9` inclusive
     *
     * The maximum number of decimal places of the results of operations involving division, i.e. division, square root
     * and base conversion operations, and power operations with negative exponents.
     *
     * ```ts
     * BigNumber.config({ DECIMAL_PLACES: 5 })
     * BigNumber.config(5)    // equivalent
     * ```
     * @default 20
     */
    DECIMAL_PLACES?: number;

    /**
     * The rounding mode used in the above operations and the default rounding mode of round, toExponential, toFixed,
     * toFormat and toPrecision. The modes are available as enumerated properties of the BigNumber constructor.
     * @default [[RoundingMode.ROUND_HALF_UP]]
     */
    ROUNDING_MODE?: RoundingMode;

    /**
     *  - `number`: integer, magnitude `0` to `1e+9` inclusive
     *  - `number[]`: [ integer `-1e+9` to `0` inclusive, integer `0` to `1e+9` inclusive ]
     *
     * The exponent value(s) at which `toString` returns exponential notation.
     *
     * If a single number is assigned, the value
     * is the exponent magnitude.
     *
     * If an array of two numbers is assigned then the first number is the negative exponent
     * value at and beneath which exponential notation is used, and the second number is the positive exponent value at
     * and above which the same.
     *
     * For example, to emulate JavaScript numbers in terms of the exponent values at which
     * they begin to use exponential notation, use [-7, 20].
     *
     * ```ts
     * BigNumber.config({ EXPONENTIAL_AT: 2 })
     * new BigNumber(12.3)         // '12.3'        e is only 1
     * new BigNumber(123)          // '1.23e+2'
     * new BigNumber(0.123)        // '0.123'       e is only -1
     * new BigNumber(0.0123)       // '1.23e-2'
     *
     * BigNumber.config({ EXPONENTIAL_AT: [-7, 20] })
     * new BigNumber(123456789)    // '123456789'   e is only 8
     * new BigNumber(0.000000123)  // '1.23e-7'
     *
     * // Almost never return exponential notation:
     * BigNumber.config({ EXPONENTIAL_AT: 1e+9 })
     *
     * // Always return exponential notation:
     * BigNumber.config({ EXPONENTIAL_AT: 0 })
     * ```
     * Regardless of the value of `EXPONENTIAL_AT`, the `toFixed` method will always return a value in normal notation
     * and the `toExponential` method will always return a value in exponential form.
     *
     * Calling `toString` with a base argument, e.g. `toString(10)`, will also always return normal notation.
     *
     * @default `[-7, 20]`
     */
    EXPONENTIAL_AT?: number | [number, number];

    /**
     *  - number: integer, magnitude `1` to `1e+9` inclusive
     *  - number[]: [ integer `-1e+9` to `-1` inclusive, integer `1` to `1e+9` inclusive ]
     *
     * The exponent value(s) beyond which overflow to `Infinity` and underflow to zero occurs.
     *
     * If a single number is
     * assigned, it is the maximum exponent magnitude: values wth a positive exponent of greater magnitude become
     * Infinity and those with a negative exponent of greater magnitude become zero.
     *
     * If an array of two numbers is
     * assigned then the first number is the negative exponent limit and the second number is the positive exponent
     * limit.
     *
     * For example, to emulate JavaScript numbers in terms of the exponent values at which they become zero and
     * Infinity, use [-324, 308].
     *
     * ```ts
     * BigNumber.config({ RANGE: 500 })
     * BigNumber.config().RANGE     // [ -500, 500 ]
     * new BigNumber('9.999e499')   // '9.999e+499'
     * new BigNumber('1e500')       // 'Infinity'
     * new BigNumber('1e-499')      // '1e-499'
     * new BigNumber('1e-500')      // '0'
     * BigNumber.config({ RANGE: [-3, 4] })
     * new BigNumber(99999)         // '99999'      e is only 4
     * new BigNumber(100000)        // 'Infinity'   e is 5
     * new BigNumber(0.001)         // '0.01'       e is only -3
     * new BigNumber(0.0001)        // '0'          e is -4
     * ```
     *
     * The largest possible magnitude of a finite BigNumber is `9.999...e+1000000000`.
     *
     * The smallest possible magnitude of a non-zero BigNumber is `1e-1000000000`.
     *
     * @default `[-1e+9, 1e+9]`
     */
    RANGE?: number | [number, number];

    /**
     *
     * The value that determines whether BigNumber Errors are thrown. If ERRORS is false, no errors will be thrown.
     * `true`, `false`, `0` or `1`.
     * ```ts
     * BigNumber.config({ ERRORS: false })
     * ```
     *
     * @default `true`
     */
    ERRORS?: boolean | number;

    /**
     * `true`, `false`, `0` or  `1`.
     *
     * The value that determines whether cryptographically-secure pseudo-random number generation is used.
     *
     * If `CRYPTO` is set to `true` then the random method will generate random digits using `crypto.getRandomValues` in
     * browsers that support it, or `crypto.randomBytes` if using a version of Node.js that supports it.
     *
     * If neither function is supported by the host environment then attempting to set `CRYPTO` to `true` will fail, and
     * if [[Configuration.ERRORS]] is `true` an exception will be thrown.
     *
     * If `CRYPTO` is `false` then the source of randomness used will be `Math.random` (which is assumed to generate at
     * least 30 bits of randomness).
     *
     * See [[BigNumber.random]].
     *
     * ```ts
     * BigNumber.config({ CRYPTO: true })
     * BigNumber.config().CRYPTO       // true
     * BigNumber.random()              // 0.54340758610486147524
     * ```
     *
     * @default `false`
     */
    CRYPTO?: boolean | number;

    /**
     * The modulo mode used when calculating the modulus: `a mod n`.
     *
     * The quotient, `q = a / n`, is calculated according to
     * the [[Configuration.ROUNDING_MODE]] that corresponds to the chosen MODULO_MODE.
     *
     * The remainder, r, is calculated as: `r = a - n * q`.
     *
     * The modes that are most commonly used for the modulus/remainder operation are shown in the following table.
     * Although the other rounding modes can be used, they may not give useful results.
     *
     *  Property          | Value | Description
     * -------------------|:-----:|---------------------------------------------------------------------------------------
     *  `ROUND_UP`        |   0   | The remainder is positive if the dividend is negative, otherwise it is negative.
     *  `ROUND_DOWN`      |   1   | The remainder has the same sign as the dividend. This uses 'truncating division' and matches the behaviour of JavaScript's remainder operator `%`.
     *  `ROUND_FLOOR`     |   3   | The remainder has the same sign as the divisor.
     *                    |       | This matches Python's % operator.
     *  `ROUND_HALF_EVEN` |   6   | The IEEE 754 remainder function.
     *  `EUCLID`          |   9   | The remainder is always positive. Euclidian division: `q = sign(n) * floor(a / abs(n))`
     *
     * The rounding/modulo modes are available as enumerated properties of the BigNumber constructor.
     *
     * See [[BigNumber.modulo]]
     *
     * ```ts
     * BigNumber.config({ MODULO_MODE: BigNumber.EUCLID })
     * BigNumber.config({ MODULO_MODE: 9 })          // equivalent
     * ```
     *
     * @default [[RoundingMode.ROUND_DOWN]]
     */
    MODULO_MODE?: RoundingMode;

    /**
     * integer, `0` to `1e+9` inclusive.
     *
     * The maximum number of significant digits of the result of the power operation (unless a modulus is specified).
     *
     * If set to 0, the number of signifcant digits will not be limited.
     *
     * See [[BigNumber.toPower]]
     *
     * ```ts
     * BigNumber.config({ POW_PRECISION: 100 })
     * ```
     *
     * @default 100
     */
    POW_PRECISION?: number;

    /**
     * The FORMAT object configures the format of the string returned by the `toFormat` method. The example below shows
     * the properties of the FORMAT object that are recognised, and their default values. Unlike the other configuration
     * properties, the values of the properties of the FORMAT object will not be checked for validity. The existing
     * FORMAT object will simply be replaced by the object that is passed in. Note that all the properties shown below
     * do not have to be included.
     *
     * See `toFormat` for examples of usage.
     *
     * ```ts
     * BigNumber.config({
     *     FORMAT: {
     *         // the decimal separator
     *         decimalSeparator: '.',
     *         // the grouping separator of the integer part
     *         groupSeparator: ',',
     *         // the primary grouping size of the integer part
     *         groupSize: 3,
     *         // the secondary grouping size of the integer part
     *         secondaryGroupSize: 0,
     *         // the grouping separator of the fraction part
     *         fractionGroupSeparator: ' ',
     *         // the grouping size of the fraction part
     *         fractionGroupSize: 0
     *     }
     * });
     * ```
     */
    FORMAT?: Format;
}

/**
 * The library's enumerated rounding modes are stored as properties of the constructor.
 * (They are not referenced internally by the library itself.)
 * Rounding modes 0 to 6 (inclusive) are the same as those of Java's BigDecimal class.
 */
declare enum RoundingMode {
    /** Rounds away from zero */
    ROUND_UP = 0,
    /** Rounds towards zero */
    ROUND_DOWN = 1,
    /** Rounds towards Infinity */
    ROUND_CEIL = 2,
    /** Rounds towards -Infinity */
    ROUND_FLOOR = 3,
    /**
     * Rounds towards nearest neighbour. If equidistant, rounds away from zero
     */
    ROUND_HALF_UP = 4,
    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards zero
     */
    ROUND_HALF_DOWN = 5,
    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards even neighbour
     */
    ROUND_HALF_EVEN = 6,
    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards `Infinity`
     */
    ROUND_HALF_CEIL = 7,
    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards `-Infinity`
     */
    ROUND_HALF_FLOOR = 8,
    /**
     * The remainder is always positive. Euclidian division: `q = sign(n) * floor(a / abs(n))`
     */
    EUCLID = 9
}

interface BigNumber {
    /**
     * Coefficient: Array of base `1e14` numbers or `null`
     * @readonly
     */
    c: number[];

    /**
     * Exponent: Integer, `-1000000000` to `1000000000` inclusive or `null`
     * @readonly
     */
    e: number;

    /**
     * Sign: `-1`, `1` or `null`
     * @readonly
     */
    s: number;

    /**
     * Returns a BigNumber whose value is the absolute value, i.e. the magnitude, of the value of this BigNumber. The
     * return value is always exact and unrounded.
     * ```ts
     * x = new BigNumber(-0.8)
     * y = x.absoluteValue()           // '0.8'
     * z = y.abs()                     // '0.8'
     * ```
     * @alias [[BigNumber.abs]]
     */
    absoluteValue(): BigNumber;

    /**
     * See [[BigNumber.absoluteValue]]
     */
    abs(): BigNumber;

    /**
     * See [[plus]]
     */
    add(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber rounded to a whole number in the direction of
     * positive `Infinity`.
     *
     * ```ts
     * x = new BigNumber(1.3)
     * x.ceil()                        // '2'
     * y = new BigNumber(-1.8)
     * y.ceil()                        // '-1'
     * ```
     */
    ceil(): BigNumber;

    /**
     *  Returns |                                                               |
     * :-------:|---------------------------------------------------------------|
     *     1    | If the value of this BigNumber is greater than the value of n
     *    -1    | If the value of this BigNumber is less than the value of n
     *     0    | If this BigNumber and n have the same value
     *   null   | If the value of either this BigNumber or n is NaN
     *
     * ```ts
     * x = new BigNumber(Infinity)
     * y = new BigNumber(5)
     * x.comparedTo(y)                 // 1
     * x.comparedTo(x.minus(1))        // 0
     * y.cmp(NaN)                      // null
     * y.cmp('110', 2)                 // -1
     * ```
     *
     * @alias [[cmp]]
     */
    comparedTo(n: number | string | BigNumber, base?: number): number;

    /**
     * See [[comparedTo]]
     */
    cmp(n: number | string | BigNumber, base?: number): number;

    /**
     * Return the number of decimal places of the value of this BigNumber, or `null` if the value of this BigNumber is
     * `±Infinity` or `NaN`.
     *
     * ```ts
     * x = new BigNumber(123.45)
     * x.decimalPlaces()               // 2
     * y = new BigNumber('9.9e-101')
     * y.dp()                          // 102
     * ```
     *
     * @alias [[dp]]
     */
    decimalPlaces(): number;

    /**
     * See [[decimalPlaces]]
     */
    dp(): number;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber divided by n, rounded according to the current
     * DECIMAL_PLACES and ROUNDING_MODE configuration.
     *
     * ```ts
     * x = new BigNumber(355)
     * y = new BigNumber(113)
     * x.dividedBy(y)                  // '3.14159292035398230088'
     * x.div(5)                        // '71'
     * x.div(47, 16)                   // '5'
     * ```
     *
     * @alias [[div]]
     */
    dividedBy(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * See [[dividedBy]]
     */
    div(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * Return a BigNumber whose value is the integer part of dividing the value of this BigNumber by n.
     *
     * ```ts
     * x = new BigNumber(5)
     * y = new BigNumber(3)
     * x.dividedToIntegerBy(y)         // '1'
     * x.divToInt(0.7)                 // '7'
     * x.divToInt('0.f', 16)           // '5'
     * ```
     *
     * @alias [[divToInt]]
     */
    dividedToIntegerBy(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * See [[dividedToIntegerBy]]
     */
    divToInt(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * Returns true if the value of this BigNumber equals the value of `n`, otherwise returns `false`. As with JavaScript,
     * `NaN` does not equal `NaN`.
     *
     * Note: This method uses the [[comparedTo]] internally.
     *
     * ```ts
     * 0 === 1e-324                    // true
     * x = new BigNumber(0)
     * x.equals('1e-324')              // false
     * BigNumber(-0).eq(x)             // true  ( -0 === 0 )
     * BigNumber(255).eq('ff', 16)     // true
     *
     * y = new BigNumber(NaN)
     * y.equals(NaN)                   // false
     * ```
     *
     * @alias [[eq]]
     */
    equals(n: number | string | BigNumber, base?: number): boolean;

    /**
     * See [[equals]]
     */
    eq(n: number | string | BigNumber, base?: number): boolean;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber rounded to a whole number in the direction of
     * negative `Infinity`.
     *
     * ```ts
     * x = new BigNumber(1.8)
     * x.floor()                       // '1'
     * y = new BigNumber(-1.3)
     * y.floor()                       // '-2'
     * ```
     */
    floor(): BigNumber;

    /**
     * Returns `true` if the value of this BigNumber is greater than the value of `n`, otherwise returns `false`.
     *
     * Note: This method uses the comparedTo method internally.
     *
     * ```ts
     * 0.1 > (0.3 - 0.2)                           // true
     * x = new BigNumber(0.1)
     * x.greaterThan(BigNumber(0.3).minus(0.2))    // false
     * BigNumber(0).gt(x)                          // false
     * BigNumber(11, 3).gt(11.1, 2)                // true
     * ```
     *
     * @alias [[gt]]
     */
    greaterThan(n: number | string | BigNumber, base?: number): boolean;

    /**
     * See [[greaterThan]]
     */
    gt(n: number | string | BigNumber, base?: number): boolean;

    /**
     * Returns `true` if the value of this BigNumber is greater than or equal to the value of `n`, otherwise returns `false`.
     *
     * Note: This method uses the comparedTo method internally.
     *
     * @alias [[gte]]
     */
    greaterThanOrEqualTo(n: number | string | BigNumber, base?: number): boolean;

    /**
     * See [[greaterThanOrEqualTo]]
     */
    gte(n: number | string | BigNumber, base?: number): boolean;

    /**
     * Returns true if the value of this BigNumber is a finite number, otherwise returns false. The only possible
     * non-finite values of a BigNumber are `NaN`, `Infinity` and `-Infinity`.
     *
     * Note: The native method `isFinite()` can be used if `n <= Number.MAX_VALUE`.
     */
    isFinite(): boolean;

    /**
     * Returns true if the value of this BigNumber is a whole number, otherwise returns false.
     * @alias [[isInt]]
     */
    isInteger(): boolean;

    /**
     * See [[isInteger]]
     */
    isInt(): boolean;

    /**
     * Returns `true` if the value of this BigNumber is `NaN`, otherwise returns `false`.
     *
     * Note: The native method isNaN() can also be used.
     */
    isNaN(): boolean;

    /**
     * Returns true if the value of this BigNumber is negative, otherwise returns false.
     *
     * Note: `n < 0` can be used if `n <= * -Number.MIN_VALUE`.
     *
     * @alias [[isNeg]]
     */
    isNegative(): boolean;

    /**
     * See [[isNegative]]
     */
    isNeg(): boolean;

    /**
     * Returns true if the value of this BigNumber is zero or minus zero, otherwise returns false.
     *
     * Note: `n == 0` can be used if `n >= Number.MIN_VALUE`.
     */
    isZero(): boolean;

    /**
     * Returns true if the value of this BigNumber is less than the value of n, otherwise returns false.
     *
     * Note: This method uses [[comparedTo]] internally.
     *
     * @alias [[lt]]
     */
    lessThan(n: number | string | BigNumber, base?: number): boolean;

    /**
     * See [[lessThan]]
     */
    lt(n: number | string | BigNumber, base?: number): boolean;

    /**
     * Returns true if the value of this BigNumber is less than or equal the value of n, otherwise returns false.
     *
     * Note: This method uses [[comparedTo]] internally.
     */
    lessThanOrEqualTo(n: number | string | BigNumber, base?: number): boolean;

    /**
     * See [[lessThanOrEqualTo]]
     */
    lte(n: number | string | BigNumber, base?: number): boolean;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber minus `n`.
     *
     * The return value is always exact and unrounded.
     *
     * @alias [[sub]]
     */
    minus(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber modulo n, i.e. the integer remainder of dividing
     * this BigNumber by n.
     *
     * The value returned, and in particular its sign, is dependent on the value of the [[Configuration.MODULO_MODE]]
     * setting of this BigNumber constructor. If it is `1` (default value), the result will have the same sign as this
     * BigNumber, and it will match that of Javascript's `%` operator (within the limits of double precision) and
     * BigDecimal's remainder method.
     *
     * The return value is always exact and unrounded.
     *
     * ```ts
     * 1 % 0.9                         // 0.09999999999999998
     * x = new BigNumber(1)
     * x.modulo(0.9)                   // '0.1'
     * y = new BigNumber(33)
     * y.mod('a', 33)                  // '3'
     * ```
     *
     * @alias [[mod]]
     */
    modulo(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * See [[modulo]]
     */
    mod(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * See [[times]]
     */
    mul(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber negated, i.e. multiplied by -1.
     *
     * ```ts
     * x = new BigNumber(1.8)
     * x.negated()                     // '-1.8'
     * y = new BigNumber(-1.3)
     * y.neg()                         // '1.3'
     * ```
     *
     * @alias [[neg]]
     */
    negated(): BigNumber;

    /**
     * See [[negated]]
     */
    neg(): BigNumber;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber plus `n`.
     *
     * The return value is always exact and unrounded.
     *
     * @alias [[add]]
     */
    plus(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * If z is true or 1 then any trailing zeros of the integer part of a number are counted as significant digits,
     * otherwise they are not.
     *
     * @param z true, false, 0 or 1
     * @alias [[sd]]
     */
    precision(z?: boolean | number): number;

    /**
     * See [[precision]]
     */
    sd(z?: boolean | number): number;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber rounded by rounding mode rm to a maximum of dp
     * decimal places.
     *
     *  - if dp is omitted, or is null or undefined, the return value is n rounded to a whole number.
     *  - if rm is omitted, or is null or undefined, ROUNDING_MODE is used.
     *
     * ```ts
     * x = 1234.56
     * Math.round(x)                             // 1235
     * y = new BigNumber(x)
     * y.round()                                 // '1235'
     * y.round(1)                                // '1234.6'
     * y.round(2)                                // '1234.56'
     * y.round(10)                               // '1234.56'
     * y.round(0, 1)                             // '1234'
     * y.round(0, 6)                             // '1235'
     * y.round(1, 1)                             // '1234.5'
     * y.round(1, BigNumber.ROUND_HALF_EVEN)     // '1234.6'
     * y                                         // '1234.56'
     * ```
     *
     * @param dp integer, 0 to 1e+9 inclusive
     * @param rm integer, 0 to 8 inclusive
     */
    round(dp?: number, rm?: number): BigNumber;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber shifted n places.
     *
     * The shift is of the decimal point, i.e. of powers of ten, and is to the left if n is negative or to the right if
     * n is positive. The return value is always exact and unrounded.
     *
     * @param n integer, -9007199254740991 to 9007199254740991 inclusive
     */
    shift(n: number): BigNumber;

    /**
     * Returns a BigNumber whose value is the square root of the value of this BigNumber, rounded according to the
     * current DECIMAL_PLACES and ROUNDING_MODE configuration.
     *
     * The return value will be correctly rounded, i.e. rounded
     * as if the result was first calculated to an infinite number of correct digits before rounding.
     *
     * @alias [[sqrt]]
     */
    squareRoot(): BigNumber;

    /**
     * See [[squareRoot]]
     */
    sqrt(): BigNumber;

    /**
     * See [[minus]]
     */
    sub(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber times n.
     *
     * The return value is always exact and unrounded.
     *
     * @alias [[mul]]
     */
    times(n: number | string | BigNumber, base?: number): BigNumber;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber rounded to sd significant digits using rounding mode rm.
     *
     * If sd is omitted or is null or undefined, the return value will not be rounded.
     *
     * If rm is omitted or is null or undefined, ROUNDING_MODE will be used.
     *
     * ```ts
     * BigNumber.config({ precision: 5, rounding: 4 })
     * x = new BigNumber(9876.54321)
     *
     * x.toDigits()                          // '9876.5'
     * x.toDigits(6)                         // '9876.54'
     * x.toDigits(6, BigNumber.ROUND_UP)     // '9876.55'
     * x.toDigits(2)                         // '9900'
     * x.toDigits(2, 1)                      // '9800'
     * x                                     // '9876.54321'
     * ```
     *
     * @param sd integer, 1 to 1e+9 inclusive
     * @param rm integer, 0 to 8 inclusive
     */
    toDigits(sd?: number, rm?: number): BigNumber;

    /**
     * Returns a string representing the value of this BigNumber in exponential notation rounded using rounding mode rm
     * to dp decimal places, i.e with one digit before the decimal point and dp digits after it.
     *
     * If the value of this BigNumber in exponential notation has fewer than dp fraction digits, the return value will
     * be appended with zeros accordingly.
     *
     * If dp is omitted, or is null or undefined, the number of digits after the decimal point defaults to the minimum
     * number of digits necessary to represent the value exactly.
     *
     * If rm is omitted or is null or undefined, ROUNDING_MODE is used.
     *
     * ```ts
     * x = 45.6
     * y = new BigNumber(x)
     * x.toExponential()               // '4.56e+1'
     * y.toExponential()               // '4.56e+1'
     * x.toExponential(0)              // '5e+1'
     * y.toExponential(0)              // '5e+1'
     * x.toExponential(1)              // '4.6e+1'
     * y.toExponential(1)              // '4.6e+1'
     * y.toExponential(1, 1)           // '4.5e+1'  (ROUND_DOWN)
     * x.toExponential(3)              // '4.560e+1'
     * y.toExponential(3)              // '4.560e+1'
     * ```
     *
     * @param dp integer, 0 to 1e+9 inclusive
     * @param rm integer, 0 to 8 inclusive
     */
    toExponential(dp?: number, rm?: number): string;

    /**
     * Returns a string representing the value of this BigNumber in normal (fixed-point) notation rounded to dp decimal
     * places using rounding mode `rm`.
     *
     * If the value of this BigNumber in normal notation has fewer than `dp` fraction digits, the return value will be
     * appended with zeros accordingly.
     *
     * Unlike `Number.prototype.toFixed`, which returns exponential notation if a number is greater or equal to 10<sup>21</sup>, this
     * method will always return normal notation.
     *
     * If dp is omitted or is `null` or `undefined`, the return value will be unrounded and in normal notation. This is also
     * unlike `Number.prototype.toFixed`, which returns the value to zero decimal places.
     *
     * It is useful when fixed-point notation is required and the current `EXPONENTIAL_AT` setting causes toString to
     * return exponential notation.
     *
     * If `rm` is omitted or is `null` or `undefined`, `ROUNDING_MODE` is used.
     *
     * ```ts
     * x = 3.456
     * y = new BigNumber(x)
     * x.toFixed()                     // '3'
     * y.toFixed()                     // '3.456'
     * y.toFixed(0)                    // '3'
     * x.toFixed(2)                    // '3.46'
     * y.toFixed(2)                    // '3.46'
     * y.toFixed(2, 1)                 // '3.45'  (ROUND_DOWN)
     * x.toFixed(5)                    // '3.45600'
     * y.toFixed(5)                    // '3.45600'
     * ```
     *
     * @param dp integer, 0 to 1e+9 inclusive
     * @param rm integer, 0 to 8 inclusive
     */
    toFixed(dp?: number, rm?: number): string;

    /**
     * Returns a string representing the value of this BigNumber in normal (fixed-point) notation rounded to dp decimal
     * places using rounding mode `rm`, and formatted according to the properties of the FORMAT object.
     *
     * See the examples below for the properties of the `FORMAT` object, their types and their usage.
     *
     * If `dp` is omitted or is `null` or `undefined`, then the return value is not rounded to a fixed number of decimal
     * places.
     *
     * If `rm` is omitted or is `null` or `undefined`, `ROUNDING_MODE` is used.
     *
     * ```ts
     * format = {
     *     decimalSeparator: '.',
     *     groupSeparator: ',',
     *     groupSize: 3,
     *     secondaryGroupSize: 0,
     *     fractionGroupSeparator: ' ',
     *     fractionGroupSize: 0
     * }
     * BigNumber.config({ FORMAT: format })
     *
     * x = new BigNumber('123456789.123456789')
     * x.toFormat()                    // '123,456,789.123456789'
     * x.toFormat(1)                   // '123,456,789.1'
     *
     * // If a reference to the object assigned to FORMAT has been retained,
     * // the format properties can be changed directly
     * format.groupSeparator = ' '
     * format.fractionGroupSize = 5
     * x.toFormat()                    // '123 456 789.12345 6789'
     *
     * BigNumber.config({
     *     FORMAT: {
     *         decimalSeparator = ',',
     *         groupSeparator = '.',
     *         groupSize = 3,
     *         secondaryGroupSize = 2
     *     }
     * })
     *
     * x.toFormat(6)                   // '12.34.56.789,123'
     * ```
     *
     * @param dp integer, 0 to 1e+9 inclusive
     * @param rm integer, 0 to 8 inclusive
     */
    toFormat(dp?: number, rm?: number): string;

    /**
     * Returns a string array representing the value of this BigNumber as a simple fraction with an integer numerator
     * and an integer denominator. The denominator will be a positive non-zero value less than or equal to max.
     *
     * If a maximum denominator, max, is not specified, or is null or undefined, the denominator will be the lowest
     * value necessary to represent the number exactly.
     *
     * ```ts
     * x = new BigNumber(1.75)
     * x.toFraction()                  // '7, 4'
     *
     * pi = new BigNumber('3.14159265358')
     * pi.toFraction()                 // '157079632679,50000000000'
     * pi.toFraction(100000)           // '312689, 99532'
     * pi.toFraction(10000)            // '355, 113'
     * pi.toFraction(100)              // '311, 99'
     * pi.toFraction(10)               // '22, 7'
     * pi.toFraction(1)                // '3, 1'
     * ```
     *
     * @param max integer >= `1` and < `Infinity`
     */
    toFraction(max?: number | string | BigNumber): [string, string];

    /**
     * Same as [[valueOf]]
     *
     * ```ts
     * x = new BigNumber('177.7e+457')
     * y = new BigNumber(235.4325)
     * z = new BigNumber('0.0098074')
     *
     * // Serialize an array of three BigNumbers
     * str = JSON.stringify( [x, y, z] )
     * // "["1.777e+459","235.4325","0.0098074"]"
     *
     * // Return an array of three BigNumbers
     * JSON.parse(str, function (key, val) {
     *     return key === '' ? val : new BigNumber(val)
     * })
     * ```
     */
    toJSON(): string;

    /**
     * Returns the value of this BigNumber as a JavaScript number primitive.
     *
     * Type coercion with, for example, the unary plus operator will also work, except that a BigNumber with the value
     * minus zero will be converted to positive zero.
     *
     * ```ts
     * x = new BigNumber(456.789)
     * x.toNumber()                    // 456.789
     * +x                              // 456.789
     *
     * y = new BigNumber('45987349857634085409857349856430985')
     * y.toNumber()                    // 4.598734985763409e+34
     *
     * z = new BigNumber(-0)
     * 1 / +z                          // Infinity
     * 1 / z.toNumber()                // -Infinity
     * ```
     */
    toNumber(): number;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber raised to the power `n`, and optionally modulo `a`
     * modulus `m`.
     *
     * If `n` is negative the result is rounded according to the current [[Configuration.DECIMAL_PLACES]] and
     * [[Configuration.ROUNDING_MODE]] configuration.
     *
     * If `n` is not an integer or is out of range:
     *  - If `ERRORS` is `true` a BigNumber Error is thrown,
     *  - else if `n` is greater than `9007199254740991`, it is interpreted as `Infinity`;
     *  - else if n is less than `-9007199254740991`, it is interpreted as `-Infinity`;
     *  - else if `n` is otherwise a number, it is truncated to an integer;
     *  - else it is interpreted as `NaN`.
     *
     * As the number of digits of the result of the power operation can grow so large so quickly, e.g.
     * 123.456<sup>10000</sup> has over 50000 digits, the number of significant digits calculated is limited to the
     * value of the [[Configuration.POW_PRECISION]] setting (default value: `100`) unless a modulus `m` is specified.
     *
     * Set [[Configuration.POW_PRECISION]] to `0` for an unlimited number of significant digits to be calculated (this
     * will cause the method to slow dramatically for larger exponents).
     *
     * Negative exponents will be calculated to the number of decimal places specified by
     * [[Configuration.DECIMAL_PLACES]] (but not to more than [[Configuration.POW_PRECISION]] significant digits).
     *
     * If `m` is specified and the value of `m`, `n` and this BigNumber are positive integers, then a fast modular
     * exponentiation algorithm is used, otherwise if any of the values is not a positive integer the operation will
     * simply be performed as `x.toPower(n).modulo(m)` with a `POW_PRECISION` of `0`.
     *
     * ```ts
     * Math.pow(0.7, 2)                // 0.48999999999999994
     * x = new BigNumber(0.7)
     * x.toPower(2)                    // '0.49'
     * BigNumber(3).pow(-2)            // '0.11111111111111111111'
     * ```
     *
     * @param n integer, -9007199254740991 to 9007199254740991 inclusive
     * @alias [[pow]]
     */
    toPower(n: number, m?: number | string | BigNumber): BigNumber;

    /**
     * See [[toPower]]
     */
    pow(n: number, m?: number | string | BigNumber): BigNumber;

    /**
     * Returns a string representing the value of this BigNumber rounded to `sd` significant digits using rounding mode
     * rm.
     *
     *  - If `sd` is less than the number of digits necessary to represent the integer part of the value in normal
     *    (fixed-point) notation, then exponential notation is used.
     *  - If `sd` is omitted, or is `null` or `undefined`, then the return value is the same as `n.toString()`.
     *  - If `rm` is omitted or is `null` or `undefined`, `ROUNDING_MODE` is used.
     *
     * ```ts
     * x = 45.6
     * y = new BigNumber(x)
     * x.toPrecision()                 // '45.6'
     * y.toPrecision()                 // '45.6'
     * x.toPrecision(1)                // '5e+1'
     * y.toPrecision(1)                // '5e+1'
     * y.toPrecision(2, 0)             // '4.6e+1'  (ROUND_UP)
     * y.toPrecision(2, 1)             // '4.5e+1'  (ROUND_DOWN)
     * x.toPrecision(5)                // '45.600'
     * y.toPrecision(5)                // '45.600'
     * ```
     *
     * @param sd integer, 1 to 1e+9 inclusive
     * @param rm integer, 0 to 8 inclusive
     */
    toPrecision(sd?: number, rm?: number): string;

    /**
     * Returns a string representing the value of this BigNumber in the specified base, or base 10 if base is omitted or
     * is `null` or `undefined`.
     *
     * For bases above 10, values from 10 to 35 are represented by a-z (as with `Number.prototype.toString`), 36 to 61 by
     * A-Z, and 62 and 63 by `$` and `_` respectively.
     *
     * If a base is specified the value is rounded according to the current `DECIMAL_PLACES` and `ROUNDING_MODE`
     * configuration.
     *
     * If a base is not specified, and this BigNumber has a positive exponent that is equal to or greater than the
     * positive component of the current `EXPONENTIAL_AT` setting, or a negative exponent equal to or less than the
     * negative component of the setting, then exponential notation is returned.
     *
     * If base is `null` or `undefined` it is ignored.
     *
     * ```ts
     * x = new BigNumber(750000)
     * x.toString()                    // '750000'
     * BigNumber.config({ EXPONENTIAL_AT: 5 })
     * x.toString()                    // '7.5e+5'
     *
     * y = new BigNumber(362.875)
     * y.toString(2)                   // '101101010.111'
     * y.toString(9)                   // '442.77777777777777777778'
     * y.toString(32)                  // 'ba.s'
     *
     * BigNumber.config({ DECIMAL_PLACES: 4 });
     * z = new BigNumber('1.23456789')
     * z.toString()                    // '1.23456789'
     * z.toString(10)                  // '1.2346'
     * ```
     *
     * @param base integer, 2 to 64 inclusive
     */
    toString(base?: number): string;

    /**
     * Returns a BigNumber whose value is the value of this BigNumber truncated to a whole number.
     *
     * ```ts
     * x = new BigNumber(123.456)
     * x.truncated()                   // '123'
     * y = new BigNumber(-12.3)
     * y.trunc()                       // '-12'
     * ```
     *
     * @alias [[trunc]]
     */
    truncated(): BigNumber;

    /**
     * See [[truncated]]
     */
    trunc(): BigNumber;

    /**
     * As [[toString]], but does not accept a base argument and includes the minus sign for negative zero.`
     *
     * ```ts
     * x = new BigNumber('-0')
     * x.toString()                    // '0'
     * x.valueOf()                     // '-0'
     * y = new BigNumber('1.777e+457')
     * y.valueOf()                     // '1.777e+457'
     * ```
     */
    valueOf(): string;
}

declare var BigNumber: {
/** Rounds away from zero */
    ROUND_UP: RoundingMode;

    /** Rounds towards zero */
    ROUND_DOWN: RoundingMode;

    /** Rounds towards Infinity */
    ROUND_CEIL: RoundingMode;

    /** Rounds towards -Infinity */
    ROUND_FLOOR: RoundingMode;

    /**
     * Rounds towards nearest neighbour. If equidistant, rounds away from zero
     */
    ROUND_HALF_UP: RoundingMode;

    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards zero
     */
    ROUND_HALF_DOWN: RoundingMode;

    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards even neighbour
     */
    ROUND_HALF_EVEN: RoundingMode;

    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards `Infinity`
     */
    ROUND_HALF_CEIL: RoundingMode;

    /**
     * Rounds towards nearest neighbour. If equidistant, rounds towards `-Infinity`
     */
    ROUND_HALF_FLOOR: RoundingMode;

    /**
     * The remainder is always positive. Euclidian division: `q = sign(n) * floor(a / abs(n))`
     */
    EUCLID: RoundingMode;

    /**
     * Returns a new independent BigNumber constructor with configuration as described by `obj` (see `config`), or with
     * the default configuration if `obj` is `null` or `undefined`.
     *
     * ```ts
     * BigNumber.config({ DECIMAL_PLACES: 5 })
     * BN = BigNumber.another({ DECIMAL_PLACES: 9 })
     *
     * x = new BigNumber(1)
     * y = new BN(1)
     *
     * x.div(3)                        // 0.33333
     * y.div(3)                        // 0.333333333
     *
     * // BN = BigNumber.another({ DECIMAL_PLACES: 9 }) is equivalent to:
     * BN = BigNumber.another()
     * BN.config({ DECIMAL_PLACES: 9 })
     * ```
     */
    another(config?: Configuration): typeof BigNumber;

    /**
     * Configures the 'global' settings for this particular BigNumber constructor. Returns an object with the above
     * properties and their current values. If the value to be assigned to any of the above properties is `null` or
     * `undefined` it is ignored. See Errors for the treatment of invalid values.
     */
    config(config?: Configuration): Configuration;

    /**
     * Configures the 'global' settings for this particular BigNumber constructor. Returns an object with the above
     * properties and their current values. If the value to be assigned to any of the above properties is `null` or
     * `undefined` it is ignored. See Errors for the treatment of invalid values.
     */
    config(
        decimalPlaces?: number,
        roundingMode?: RoundingMode,
        exponentialAt?: number | [number, number],
        range?: number | [number, number],
        errors?: boolean | number,
        crypto?: boolean | number,
        moduloMode?: RoundingMode,
        powPrecision?: number,
        format?: Format
    ): Configuration;

    /**
     * Returns a BigNumber whose value is the maximum of `arg1`, `arg2`,... . The argument to this method can also be an
     * array of values. The return value is always exact and unrounded.
     *
     * ```ts
     * x = new BigNumber('3257869345.0378653')
     * BigNumber.max(4e9, x, '123456789.9')          // '4000000000'
     *
     * arr = [12, '13', new BigNumber(14)]
     * BigNumber.max(arr)                            // '14'
     * ```
     */
    max(...args: Array<number | string | BigNumber>): BigNumber;
    max(args: Array<number | string | BigNumber>): BigNumber;

    /**
     * See BigNumber for further parameter details. Returns a BigNumber whose value is the minimum of arg1, arg2,... .
     * The argument to this method can also be an array of values. The return value is always exact and unrounded.
     *
     * ```ts
     * x = new BigNumber('3257869345.0378653')
     * BigNumber.min(4e9, x, '123456789.9')          // '123456789.9'
     *
     * arr = [2, new BigNumber(-14), '-15.9999', -12]
     * BigNumber.min(arr)                            // '-15.9999'
     * ```
     */
    min(...args: Array<number | string | BigNumber>): BigNumber;
    min(args: Array<number | string | BigNumber>): BigNumber;

    /**
     * Returns a new BigNumber with a pseudo-random value equal to or greater than 0 and less than 1.
     *
     * The return value
     * will have dp decimal places (or less if trailing zeros are produced). If dp is omitted then the number of decimal
     * places will default to the current `DECIMAL_PLACES` setting.
     *
     * Depending on the value of this BigNumber constructor's
     * `CRYPTO` setting and the support for the crypto object in the host environment, the random digits of the return
     * value are generated by either `Math.random` (fastest), `crypto.getRandomValues` (Web Cryptography API in recent
     * browsers) or  `crypto.randomBytes` (Node.js).
     *
     * If `CRYPTO` is true, i.e. one of the crypto methods is to be used, the
     * value of a returned BigNumber should be cryptographically-secure and statistically indistinguishable from a
     * random value.
     *
     * ```ts
     * BigNumber.config({ DECIMAL_PLACES: 10 })
     * BigNumber.random()              // '0.4117936847'
     * BigNumber.random(20)            // '0.78193327636914089009'
     * ```
     *
     * @param dp integer, `0` to `1e+9` inclusive
     */
    random(dp?: number): BigNumber;

    /**
     * Returns a new instance of a BigNumber object. If a base is specified, the value is rounded according to the
     * current [[Configuration.DECIMAL_PLACES]] and [[Configuration.ROUNDING_MODE]] configuration. See Errors for the treatment of an invalid value or base.
     *
     * ```ts
     * x = new BigNumber(9)                       // '9'
     * y = new BigNumber(x)                       // '9'
     *
     * // 'new' is optional if ERRORS is false
     * BigNumber(435.345)                         // '435.345'
     *
     * new BigNumber('5032485723458348569331745.33434346346912144534543')
     * new BigNumber('4.321e+4')                  // '43210'
     * new BigNumber('-735.0918e-430')            // '-7.350918e-428'
     * new BigNumber(Infinity)                    // 'Infinity'
     * new BigNumber(NaN)                         // 'NaN'
     * new BigNumber('.5')                        // '0.5'
     * new BigNumber('+2')                        // '2'
     * new BigNumber(-10110100.1, 2)              // '-180.5'
     * new BigNumber(-0b10110100.1)               // '-180.5'
     * new BigNumber('123412421.234324', 5)       // '607236.557696'
     * new BigNumber('ff.8', 16)                  // '255.5'
     * new BigNumber('0xff.8')                    // '255.5'
     * ```
     *
     * The following throws `not a base 2 number` if [[Configuration.ERRORS]] is true, otherwise it returns a BigNumber with value `NaN`.
     *
     * ```ts
     * new BigNumber(9, 2)
     * ```
     *
     * The following throws `number type has more than 15 significant digits` if [[Configuration.ERRORS]] is true, otherwise it returns a BigNumber with value `96517860459076820`.
     *
     * ```ts
     * new BigNumber(96517860459076817.4395)
     * ```
     *
     * The following throws `not a number` if [[Configuration.ERRORS]] is true, otherwise it returns a BigNumber with value `NaN`.
     *
     * ```ts
     * new BigNumber('blurgh')
     * ```
     *
     * A value is only rounded by the constructor if a base is specified.
     *
     * ```ts
     * BigNumber.config({ DECIMAL_PLACES: 5 })
     * new BigNumber(1.23456789)                  // '1.23456789'
     * new BigNumber(1.23456789, 10)              // '1.23457'
     * ```
     *
     * @param value A numeric value.
     *
     * Legitimate values include `±0`, `±Infinity` and `NaN`.
     *
     * Values of type `number` with more than 15 significant digits are considered invalid (if [[Configuration.ERRORS]]
     * is `true`) as calling `toString` or `valueOf` on such numbers may not result in the intended value.
     *
     * There is no limit to the number of digits of a value of type `string` (other than that of JavaScript's maximum
     * array size).
     *
     * Decimal string values may be in exponential, as well as normal (fixed-point) notation. Non-decimal values must be
     * in normal notation. String values in hexadecimal literal form, e.g. `'0xff'`, are valid, as are string values
     * with the octal and binary prefixs `'0o'` and `'0b'`.
     *
     * String values in octal literal form without the prefix will be interpreted as decimals, e.g. `'011'` is
     * interpreted as 11, not 9.
     *
     * Values in any base may have fraction digits.
     *
     * For bases from 10 to 36, lower and/or upper case letters can be used to represent values from 10 to 35.
     *
     * For bases above 36, a-z represents values from 10 to 35, A-Z from 36 to 61, and $ and _ represent 62 and 63
     * respectively (this can be changed by editing the ALPHABET variable near the top of the source file).
     *
     * @param base integer, 2 to 64 inclusive
     *
     * The base of value. If base is omitted, or is `null` or `undefined`, base 10 is assumed.
     */
    new(value: number | string | BigNumber, base?: number): BigNumber;
}; 
declare namespace idb {
    /** This is a tiny library that mirrors IndexedDB, but replaces IDBRequest objects with promises.
     * This is your entry point to the API. It's exposed to the global scope unless you're using a module system such as browserify, in which case it's the exported object. */
    export interface IDBStatic {

        /** This method returns a promise that resolves to a DB.
         * @param name The name of the database.
         * @param version Optional. The version to open the database with. If the version is not provided and the database exists, then a connection to the database will be opened without changing its version. If the version is not provided and the database does not exist, then it will be created with version 1.
         * @param upgradeCallback Optional. Called if version is greater than the version last opened. It's similar to IDB's onupgradeneeded. The callback receives an instance of UpgradeDB.
         * @returns A Promise that passes the DB once it has been opened. */
        open(name: string, version?: number, upgradeCallback?: (db: UpgradeDB) => void): Promise<DB>;

        /** Behaves like indexedDB.deleteDatabase, but returns a promise.
         * @param name The name of the database.
         * @returns A Promise that completes once the DB has been removed. */
        delete(name: string): Promise<void>;
    }

    /** Similar to equivalent IDBDatabase. */
    export interface DB {
        /** A DOMString that contains the name of the connected database. */
        readonly name: string;

        /** A 64-bit integer that contains the version of the connected database. When a database is first created, this attribute is an empty string. */
        readonly version: number;

        /** A DOMStringList that contains a list of the names of the object stores currently in the connected database. */
        readonly objectStoreNames: DOMStringList;

        /** Returns immediately and closes the connection to a database in a separate thread. */
        close(): void;

        /** Immediately returns a transaction object (Transaction) containing the IDBTransaction.objectStore method, which you can use to access your object store. Runs in a separate thread.
         * @param storeNames The names of object stores and indexes that are in the scope of the new transaction, declared as an array of strings. Specify only the object stores that you need to access.
         * If you need to access only one object store, you can specify its name as a string.
         * @param mode Optional. The types of access that can be performed in the transaction. Transactions are opened in one of three modes: 'readonly' or 'readwrite'. 'versionchange' mode can't be specified here. If you don't provide the parameter, the default access mode is readonly. To avoid slowing things down, don't open a readwrite transaction unless you actually need to write into the database.
         * @returns The transaction object. */
        transaction(storeNames: string | string[], mode?: 'readonly' | 'readwrite'): Transaction;
    }

    /** Represent the equivalent IDBDatabase during an upgrade. */
    export interface UpgradeDB {
        /** A DOMString that contains the name of the connected database. */
        readonly name: string;

        /** A 64-bit integer that contains the version of the connected database. When a database is first created, this attribute is an empty string. */
        readonly version: number;

        /** The previous version of the DB seen by the browser, or 0 if it's new */
        readonly oldVersion: number;

        /** A DOMStringList that contains a list of the names of the object stores currently in the connected database. */
        readonly objectStoreNames: DOMStringList;

        /** This is a property rather than a method. It's a Transaction representing the upgrade transaction */
        readonly transaction: Transaction;

        /** Creates and returns a new object store or index.
         * @param name The name of the new object store to be created. Note that it is possible to create an object store with an empty name.
         * @param optionalParameters Optional. An options object whose attributes are optional parameters to the method.
         * @returns The new object store. */
        createObjectStore<TValue=any, TKey=any>(name: string, optionalParameters?: IDBObjectStoreParameters): ObjectStore<TValue, TKey>;

        /** Destroys the object store with the given name in the connected database, along with any indexes that reference it.
         * @param name The name of the object store to be removed. */
        deleteObjectStore(name: string): void;
    }

    /** Wrapper of IDBTransaction that presents the asynchronous operations as a Promise. */
    export interface Transaction {
        /** Resolves when transaction completes, rejects if transaction aborts or errors. */
        readonly complete: Promise<void>;

        /** Returns a DOMStringList of the names of IDBObjectStore objects. */
        readonly objectStoreNames: DOMStringList;

        /** The mode for isolating access to data in the object stores that are in the scope of the transaction. For possible values, see the Constants section below. The default value is readonly. */
        readonly mode: 'readonly' | 'readwrite' | 'versionchange';

        /** Rolls back all the changes to objects in the database associated with this transaction. If this transaction has been aborted or completed, then this method throws an error event. */
        abort(): void;

        /** Returns an ObjectStore object representing an object store that is part of the scope of this transaction.
         * @param name The name of the requested object store.
         * @returns The object store in the context of the transaction. */
        objectStore<TValue=any, TKey=any>(name: string): ObjectStore<TValue, TKey>;
    }

    /** Common interface for ObjectStore and Index, since bothe provide these cursor methods */
    export interface HasCursor<TValue, TKey> {
        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves a new cursor object.
         * Used for iterating through an object store by primary key with a cursor.
         * @param range Optional. A key or IDBKeyRange to be queried. If a single valid key is passed, this will default to a range containing only that key. If nothing is passed, this will default to a key range that selects all the records in this object store.
         * @param direction Optional. An IDBCursorDirection telling the cursor what direction to travel. Defaults to "next".
         * @returns A promise that resolves with the cursor once it has been opened. */
        openCursor(range?: IDBKeyRange | IDBValidKey | null, direction?: 'next' | 'nextunique' | 'prev' | 'prevunique'): Promise<Cursor<TValue, TKey>>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves a new cursor object.
         * Used for iterating through an object store with a key.
         * @param range Optional. A key or IDBKeyRange to be queried. If a single valid key is passed, this will default to a range containing only that key. If nothing is passed, this will default to a key range that selects all the records in this object store.
         * @param direction Optional. An IDBCursorDirection telling the cursor what direction to travel. Defaults to "next".
         * @returns A promise that resolves with the cursor once it has been opened. */
        openKeyCursor(range?: IDBKeyRange | IDBValidKey | null, direction?: 'next' | 'nextunique' | 'prev' | 'prevunique'): Promise<Cursor<TValue, TKey>>;

        /** Due to the microtask issues in some browsers, iterating over a cursor using promises doesn't always work.
         * So in the mean time, iterateCursor maps to openCursor, takes identical arguments, plus an additional callback that receives an IDBCursor */
        iterateCursor(callback: (c: Cursor<TValue, TKey>) => void): void;
        iterateCursor(range: IDBKeyRange | IDBValidKey | null, callback: (c: Cursor<TValue, TKey>) => void): void;
        iterateCursor(range: IDBKeyRange | IDBValidKey | null, direction: 'next' | 'nextunique' | 'prev' | 'prevunique', callback: (c: Cursor<TValue, TKey>) => void): void;

        /** Due to the microtask issues in some browsers, iterating over a cursor using promises doesn't always work.
         * So in the mean time, iterateKeyCursor maps to openKeyCursor, takes identical arguments, plus an additional callback that receives an IDBCursor */
        iterateKeyCursor(callback: (c: Cursor<TValue, TKey>) => void): void;
        iterateKeyCursor(range: IDBKeyRange | IDBValidKey | null, callback: (c: Cursor<TValue, TKey>) => void): void;
        iterateKeyCursor(range: IDBKeyRange | IDBValidKey | null, direction: 'next' | 'nextunique' | 'prev' | 'prevunique', callback: (c: Cursor<TValue, TKey>) => void): void;
    }

    /** Wrapper of IDBObjectStore that presents the asynchronous operations as Promises. */
    export interface ObjectStore<TValue, TKey> extends HasCursor<TValue, TKey> {
        /** The name of this object store. Settable only during upgrades. */
        name: string;

        /** The key path of this object store. If this attribute is null, the application must provide a key for each modification operation. */
        readonly keyPath: string | string[];

        /** A list of the names of indexes on objects in this object store. */
        readonly indexNames: DOMStringList;

        /** The value of the auto increment flag for this object store. */
        readonly autoIncrement: boolean;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) creates a structured clone of the value, and updates the cloned value in the object store.
         * This is for updating existing records in an object store when the transaction's mode is readwrite.
         * @param value The value to be stored.
         * @param key Optional. The key to use to identify the record. If unspecified, it results to null.
         * @returns A promise that resolves with the new key when the underlying put IDBRequest is successful. */
        put(value: TValue, key?: IDBKeyRange | IDBValidKey): Promise<IDBValidKey>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) creates a structured clone of the value, and stores the cloned value in the object store.
         * This is for adding new records to an object store.
         * @param value The value to be stored.
         * @param key Optional. The key to use to identify the record. If unspecified, it results to null.
         * @returns A promise that resolves with the new key when the underlying add IDBRequest is successful. */
        add(value: TValue, key?: IDBKeyRange | IDBValidKey): Promise<IDBValidKey>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) deletes the store object specified.
         * This is for deleting individual records out of an object store.
         * @param key The key of the record to be deleted, or an IDBKeyRange to delete all records with keys in range.
         * @returns A promise that resolves when the underlying delete IDBRequest is successful. */
        delete(key: IDBKeyRange | IDBValidKey): Promise<void>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) clears the object store.
         * This is for deleting all current records out of an object store.
         * @returns A promise that resolves when the underlying clear IDBRequest is successful.  */
        clear(): Promise<void>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves with the store object store selected by the specified key.
         * This is for retrieving specific records from an object store.
         * @param key The key or key range that identifies the record to be retrieved.
         * @returns A promise that resolves with the item when the underlying get IDBRequest is successful. */
        get(key: TKey): Promise<TValue>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves with the objects in the object store matching the specified parameter or all objects in the store if no parameters are given.
         * @param query Optional. A key or IDBKeyRange to be queried. If nothing is passed, this will default to a key range that selects all the records in this object store.
         * @param count Optional. Specifies the number of values to return if more than one is found. If it is lower than 0 or greater than 232-1 a TypeError exception will be thrown.
         * @returns A promise that resolves with the items when the underlying getAll IDBRequest is successful. */
        getAll(query?: IDBKeyRange | IDBValidKey, count?: number): Promise<TValue[]>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) finds either the given key or the primary key, if key is an IDBKeyRange.
         * @param key The key or key range that identifies the record to be retrieved.
         * @returns A promise that resolves with the item when the underlying get IDBRequest is successful. */
        getKey(key: IDBKeyRange | IDBValidKey): Promise<TKey>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves with record keys for all the objects matching the specified parameter or all record keys in the store if no parameters are given.
         * @param query Optional. A key or IDBKeyRange to be queried. If nothing is passed, this will default to a key range that selects all the records in this object store.
         * @param count Optional. Specifies the number of values to return if more than one is found. If it is lower than 0 or greater than 232-1 a TypeError exception will be thrown.
         * @returns A promise that resolves with the record keys when the underlying getAllKeys IDBRequest is successful. */
        getAllKeys(query?: IDBKeyRange, count?: number): Promise<TKey[]>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) counts the matching records.
         * If no arguments are provided, it returns the total number of records in the store.
         * @param key A key or IDBKeyRange object that specifies a range of records you want to count.
         * @returns A promise that resolves with the total when the underlying count IDBRequest is successful. */
        count(key?: IDBKeyRange | IDBValidKey): Promise<number>;

        /** Creates a new index during a version upgrade, returning a new Index object in the connected database.
         * @param name The name of the index to create. It is possible to create an index with an empty name.
         * @param keyPath The key path for the index to use. It is possible to create an index with an empty keyPath, and also to pass in an array as a keyPath.
         * @param optionalParameters Additional options: unique and multiEntry.
         * @returns The newly created index. */
        createIndex<TKey=any>(name: string, keyPath: string | string[], optionalParameters?: IDBIndexParameters): Index<TValue, TKey>;

        /** Destroys the specified index in the connected database, used during a version upgrade.
         * @param indexName The name of the existing index to remove. */
        deleteIndex(indexName: string): void;

        /** Opens an index from this object store after which it can, for example, be used to return a sequence of records sorted by that index using a cursor.
         * @param name The name of the existing index to get.
         * @returns The specified index. */
        index<TKey=any>(name: string): Index<TValue, TKey>;
    }

    /** Wrapper of IDBIndex that presents the asynchronous operations as Promises. */
    export interface Index<TValue, TKey> extends HasCursor<TValue, TKey> {
        /** The name of this index. */
        readonly name: string;

        /** The key path of this index. If null, this index is not auto-populated. */
        readonly keyPath: string | string[];

        /** Affects how the index behaves when the result of evaluating the index's key path yields an array.
         * If true, there is one record in the index for each item in an array of keys.
         * If false, then there is one record for each key that is an array. */
        readonly multiEntry: boolean;

        /** If true, this index does not allow duplicate values for a key. */
        readonly unique: boolean;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) counts the matching records.
         * If no arguments are provided, it returns the total number of records in the store.
         * @param key A key or IDBKeyRange object that specifies a range of records you want to count.
         * @returns A promise that resolves with the total when the underlying count IDBRequest is successful. */
        count(key?: IDBKeyRange | IDBValidKey): Promise<number>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves with the store object store selected by the specified key.
         * This is for retrieving specific records from an object store.
         * @param key The key or key range that identifies the record to be retrieved.
         * @returns A promise that resolves with the item when the underlying get IDBRequest is successful. */
        get(key: IDBKeyRange | IDBValidKey): Promise<TValue>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) finds either the given key or the primary key, if key is an IDBKeyRange.
         * @param key The key or key range that identifies the record to be retrieved.
         * @returns A promise that resolves with the item when the underlying get IDBRequest is successful. */
        getKey(key: IDBKeyRange | IDBValidKey): Promise<TValue>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves with the objects in the object store matching the specified parameter or all objects in the store if no parameters are given.
         * @param query Optional. A key or IDBKeyRange to be queried. If nothing is passed, this will default to a key range that selects all the records in this object store.
         * @param count Optional. Specifies the number of values to return if more than one is found. If it is lower than 0 or greater than 232-1 a TypeError exception will be thrown.
         * @returns A promise that resolves with the items when the underlying getAll IDBRequest is successful. */
        getAll(query?: IDBKeyRange | IDBValidKey, count?: number): Promise<TValue[]>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) resolves with record keys for all the objects matching the specified parameter or all record keys in the store if no parameters are given.
         * @param query Optional. A key or IDBKeyRange to be queried. If nothing is passed, this will default to a key range that selects all the records in this object store.
         * @param count Optional. Specifies the number of values to return if more than one is found. If it is lower than 0 or greater than 232-1 a TypeError exception will be thrown.
         * @returns A promise that resolves with the record keys when the underlying getAllKeys IDBRequest is successful. */
        getAllKeys(query?: IDBKeyRange, count?: number): Promise<TKey[]>;
    }

    /** Wrapper of IDBCursor that presents the asynchronous operations as Promises. */
    export interface Cursor<TValue, TKey> {
        /** The key for the record at the cursor's position. If the cursor is outside its range, this is set to undefined. The cursor's key can be any data type. */
        readonly key: IDBKeyRange | IDBValidKey;

        /** The cursor's current effective primary key. If the cursor is currently being iterated or has iterated outside its range, this is set to undefined. The cursor's primary key can be any data type. */
        readonly primaryKey: TKey | undefined;

        /** The direction of traversal of the cursor. */
        readonly direction: 'next' | 'nextunique' | 'prev' | 'prevunique';

        /** The current value under the cursor. */
        readonly value: TValue;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) deletes the record at the cursor's position, without changing the cursor's position.
         * This can be used to delete specific records.
         * @returns A promise that resolves when the underlying delete IDBRequest is successful. */
        delete(): Promise<void>;

        /** Returns a Promise of an IDBRequest object that (in a separate thread) updates the value at the current position of the cursor in the object store.
         * This can be used to update specific records.
         * @param value The value to write over the current cursor location.
         * @returns A promise that resolves when the underlying update IDBRequest is successful. */
        update(value: TValue): Promise<void>;

        /** Sets the number times a cursor should move its position forward.
         * @param count The number of times to move the cursor forward.
         * @returns The cursor after having been moved forward the specified number of times. */
        advance(count: number): Promise<Cursor<TValue, TKey>>;

        /** Advances the cursor to the next position along its direction, to the item whose key matches the optional key parameter.
         * @param key Optional. The key to position the cursor at. If no key is specified, the cursor advances to the immediate next position, based on the its direction.
         * @returns The cursor after having been continued to the next or specified record. */
        continue(key?: IDBKeyRange | IDBValidKey): Promise<Cursor<TValue, TKey>>;

        /** Sets the cursor to the given index key and primary key given as arguments.
         * @param key The key to position the cursor at.
         * @param primaryKey The primary key to position the cursor at.
         * @returns The cursor after having been continued to the next or specified record. */
        continuePrimaryKey(key?: IDBKeyRange | IDBValidKey, primaryKey?: TKey): Promise<Cursor<TValue, TKey>>;
    }
}

/** This is your entry point to the API. It's exposed to the global scope unless you're using a module system such as browserify, in which case it's the exported object. */
declare var idb: idb.IDBStatic;
interface Array<T> {
    distinct<T, U>(this: T[], selector?: (element: T) => T | U): U[];
    groupBy<T>(this: T[], selector: (element: T) => string): KeyValuePair<string, T[]>[];
    groupBy<T>(this: T[], selector: (element: T) => number): KeyValuePair<number, T[]>[];
    orderBy<T>(this: T[], selector: (element: T) => number | string): T[];
    orderBy<T>(this: T[], property: string): T[];
    orderByDescending<T>(this: T[], selector: (element: T) => number): T[];
    orderByDescending<T>(this: T[], property: string): T[];
    min<T>(this: T[], selector: (element: T) => number): number;
    max<T>(this: T[], selector: (element: T) => number): number;
    sum<T>(this: T[], selector: (element: T) => number): number;
}
interface ArrayConstructor {
    range(start: number, end: number, step?: number): number[];
}
declare type KeyValuePair<T, U> = {
    key: T;
    value: U;
};
declare type KeyValue<T> = {
    [key: string]: T;
};
declare type NamedArray<T> = Array<T> & {
    [name: string]: T;
};
declare namespace Vidyano {
    class CultureInfo {
        name: string;
        numberFormat: ICultureInfoNumberFormat;
        dateFormat: ICultureInfoDateFormat;
        static currentCulture: CultureInfo;
        static invariantCulture: CultureInfo;
        static cultures: KeyValue<CultureInfo>;
        constructor(name: string, numberFormat: ICultureInfoNumberFormat, dateFormat: ICultureInfoDateFormat);
    }
    interface ICultureInfoNumberFormat {
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
    interface ICultureInfoDateFormat {
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
declare namespace Vidyano {
    abstract class DataType {
        static isDateTimeType(type: string): boolean;
        static isNumericType(type: string): boolean;
        static isBooleanType(type: string): boolean;
        private static _getDate;
        private static _getServiceTimeString;
        static fromServiceString(value: string, type: string): any;
        static toServiceString(value: any, type: string): string;
    }
}
declare namespace Vidyano.Service {
    type KeyValue<T> = {
        [key: string]: T;
    };
    type KeyValueString = KeyValue<string>;
    type NotificationType = "" | "OK" | "Notice" | "Warning" | "Error";
    type SortDirection = "" | "ASC" | "DESC";
    type Request = {
        userName?: string;
        authToken?: string;
        clientVersion?: string;
        environment: "Web" | "Web,ServiceWorker";
        environmentVersion: string;
    };
    type Response = {
        authToken?: string;
        exception?: string;
    };
    type GetApplicationRequest = {
        password?: string;
    } & Request;
    type GetQueryRequest = {
        id: string;
    } & Request;
    type GetQueryResponse = {
        query: Query;
    } & Response;
    type GetPersistentObjectRequest = {
        persistentObjectTypeId: string;
        objectId?: string;
        isNew?: boolean;
        parent?: PersistentObject;
    } & Request;
    type GetPersistentObjectResponse = {
        result: PersistentObject;
    } & Response;
    type ExecuteActionParameters = {
        [key: string]: string;
    };
    type ExecuteActionRequest = {
        action: string;
        parameters: ExecuteActionParameters;
    } & Request;
    type ExecuteActionRefreshParameters = {
        RefreshedPersistentObjectAttributeId: string;
    } & ExecuteActionParameters;
    type ExecuteQueryActionRequest = {
        parent: PersistentObject;
        query: Query;
        selectedItems: QueryResultItem[];
    } & ExecuteActionRequest;
    type ExecuteQueryFilterActionRequest = {
        query: Query;
    } & ExecuteActionRequest;
    type ExecutePersistentObjectActionRequest = {
        parent: PersistentObject;
    } & ExecuteActionRequest;
    type ExecuteActionResponse = {
        result: PersistentObject;
    } & Response;
    type ExecuteQueryRequest = {
        query: Query;
        parent: PersistentObject;
    } & Request;
    type ExecuteQueryResponse = {
        result: QueryResult;
    } & Response;
    type ProviderParameters = {
        label: string;
        description: string;
        requestUri: string;
        signOutUri: string;
        redirectUri: string;
        registerPersistentObjectId?: string;
        registerUser?: string;
        forgotPassword?: boolean;
        getCredentialType?: boolean;
    };
    type ClientData = {
        defaultUser: string;
        exception: string;
        languages: Languages;
        providers: {
            [name: string]: {
                parameters: ProviderParameters;
            };
        };
        windowsAuthentication: boolean;
    };
    type Languages = {
        [culture: string]: Language;
    };
    type Language = {
        name: string;
        isDefault: boolean;
        messages: KeyValueString;
    };
    type ApplicationResponse = {
        application: PersistentObject;
        userCultureInfo: string;
        userLanguage: string;
        userName: string;
        hasSensitive: boolean;
    } & Response;
    type PersistentObject = {
        actions: string[];
        attributes: PersistentObjectAttribute[];
        breadcrumb?: string;
        dialogSaveAction: string;
        fullTypeName: string;
        id: string;
        isBreadcrumbSensitive: boolean;
        isNew?: boolean;
        isSystem: boolean;
        label: string;
        newOptions: string;
        notification: string;
        notificationType: NotificationType;
        notificationDuration: number;
        objectId: string;
        queries: Query[];
        queryLayoutMode: string;
        securityToken: never;
        stateBehavior: "OpenInEdit" | "StayInEdit" | "AsDialog";
        tabs: PersistentObjectTab[];
        type: string;
    };
    type PersistentObjectAttribute = {
        name: string;
        type: string;
        group: string;
        tab: string;
        label: string;
        value: string;
        isReadOnly?: boolean;
        isRequired?: boolean;
        isSensitive?: boolean;
        isValueChanged?: boolean;
        offset: number;
        rules?: string;
        visibility: string;
    };
    type PersistentObjectAttributeWithReference = {
        displayAttribute: string;
        lookup: Query;
        objectId: string;
    } & PersistentObjectAttribute;
    type PersistentObjectTab = {
        columnCount: number;
        id: string;
        name: string;
    };
    type Query = {
        actionLabels?: KeyValueString;
        actions: string[];
        allowTextSearch: boolean;
        allSelected: boolean;
        allSelectedInversed: boolean;
        autoQuery: boolean;
        canRead: boolean;
        columns: QueryColumn[];
        disableBulkEdit: boolean;
        enableSelectAll: boolean;
        filters: PersistentObject;
        groupedBy: string;
        id: string;
        label: string;
        name: string;
        notification: string;
        notificationType: NotificationType;
        notificationDuration: number;
        pageSize: number;
        persistentObject: PersistentObject;
        result: QueryResult;
        sortOptions: string;
        textSearch: string;
    };
    type QueryColumn = {
        canFilter: boolean;
        canGroupBy: boolean;
        canListDistincts: boolean;
        canSort: boolean;
        id: string;
        isHidden: boolean;
        isSensitive?: boolean;
        label: string;
        name: string;
        offset: number;
        persistentObjectId: string;
        type: string;
    };
    type QueryResult = {
        charts: QueryChart[];
        columns: QueryColumn[];
        continuation?: string;
        groupedBy?: string;
        groupingInfo?: QueryGroupingInfo;
        items: QueryResultItem[];
        notification?: string;
        notificationDuration?: number;
        notificationType?: NotificationType;
        pageSize?: number;
        sortOptions: string;
        totalItem?: QueryResultItem;
        totalItems?: number;
    };
    type QueryResultItem = {
        id: string;
        values: QueryResultItemValue[];
        typeHints?: KeyValueString;
    };
    type QueryResultItemValue = {
        key: string;
        value: string;
        objectId?: string;
        typeHints?: KeyValueString;
    };
    type QueryGroupingInfo = {
        groupedBy: string;
        groups?: QueryResultItemGroup[];
    };
    type QueryResultItemGroup = {
        name: string;
        count: number;
    };
    type QueryChart = {
        label: string;
        name: string;
        type: string;
        options: any;
    };
    type RetryAction = {
        cancelOption?: number;
        defaultOption?: number;
        message: string;
        options: string[];
        persistentObject?: PersistentObject;
        title: string;
    };
    type ProfilerRequest = {
        method: string;
        profiler: Profiler;
        request: any;
        response: any;
        transport: number;
        when: Date;
    };
    type Profiler = {
        elapsedMilliseconds: number;
        entries: ProfilerEntry[];
        exceptions: {
            id: string;
            message: string;
        }[];
        sql: ProfilerSql[];
        taskId: number;
    };
    type ProfilerEntry = {
        arguments: any[];
        elapsedMilliseconds: number;
        entries: ProfilerEntry[];
        exception: string;
        hasNPlusOne?: boolean;
        methodName: string;
        sql: string[];
        started: number;
    };
    type ProfilerSql = {
        commandId: string;
        commandText: string;
        elapsedMilliseconds: number;
        parameters: ProfilerSqlParameter[];
        recordsAffected: number;
        taskId: number;
        type: string;
    };
    type ProfilerSqlParameter = {
        name: string;
        type: string;
        value: string;
    };
}
declare namespace Vidyano {
    abstract class IndexedDB {
        private readonly name;
        private readonly version;
        constructor(name: string, version: number);
        protected abstract initialize(upgrade: idb.UpgradeDB): any;
        private _open;
        transaction(callback: (transaction: IndexedDBTransaction) => Promise<any>, storeName: string, ...additionalStoreNames: string[]): Promise<any>;
    }
    class IndexedDBTransaction {
        private readonly _transaction;
        constructor(_transaction: idb.Transaction);
        clear(storeName: string): Promise<void>;
        exists(storeName: string, key: string | string[]): Promise<boolean>;
        saveChanges(): Promise<void>;
        save(storeName: string, entry?: any): Promise<void>;
        saveAll(storeName: string, entries: any[]): Promise<void>;
        add(storeName: string, entry: any): Promise<void>;
        addAll(storeName: string, entries: any[]): Promise<void>;
        load(storeName: string, key: string | string[]): Promise<any>;
        loadAll(storeName: string, indexName?: string, key?: any): Promise<any[]>;
        deleteAll<K extends keyof string>(storeName: string, condition: (item: any) => boolean): Promise<number>;
        deleteAll<K extends keyof string>(storeName: string, index: string, indexKey: IDBValidKey, condition: (item: any) => boolean): Promise<number>;
    }
    class IndexedDBVidyano extends IndexedDB {
        constructor();
        protected initialize(upgrade: idb.UpgradeDB): void;
        setting(key: string, value?: string): Promise<string>;
        getClientData(): Promise<Service.ClientData>;
        saveClientData(clientData: Service.ClientData): Promise<void>;
        getApplication(): Promise<Service.ApplicationResponse>;
        saveApplication(application: Service.ApplicationResponse): Promise<void>;
    }
}
declare namespace Vidyano {
    const version = "latest";
    interface IFetcher {
        payload?: any;
        request?: Request;
        response?: Response;
        fetch: () => Promise<any>;
    }
    abstract class ServiceWorker<T extends IndexedDB> {
        protected readonly name: string;
        private _db;
        private _vidyanoDb;
        private _resourceCacheName;
        private _lastConnectionState;
        protected readonly serviceUri: string;
        constructor(name: string);
        protected abstract onCreateDatabase(): T;
        get db(): T;
        private get vidyanoDb();
        private _log;
        protected getPreloadFiles(): string[];
        private _onInstall;
        protected onInstall(): Promise<any>;
        private _onActivate;
        protected onActivate(): Promise<any>;
        private _onFetch;
        private _onFetchVidyano;
        protected onFetch(fetcher: IFetcher): Promise<Response>;
        protected onCacheMiss(request: Request): Promise<Response>;
        protected onGetClientData(): Promise<Service.ClientData>;
        protected onCacheClientData(clientData: Service.ClientData): Promise<void>;
        protected onGetApplication(): Promise<Service.ApplicationResponse>;
        protected onCacheApplication(application: Service.ApplicationResponse): Promise<void>;
        protected cache(request: Request, response: Response, cache: Cache): Promise<void>;
        protected setConnectionState(online: boolean): Promise<void>;
        sendMessageToClients(message: string): Promise<void>;
        protected createFetcher(originalRequest: Request): Promise<IFetcher>;
        protected createRequest(data: any, request: Request): Request;
        protected createResponse(data: any, response?: Response): Response;
        protected createOfflineResponse(): Response;
    }
}
declare namespace Vidyano {
    const vidyanoFiles: string[];
}
