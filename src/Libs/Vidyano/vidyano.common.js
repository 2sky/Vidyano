///////////////////////////////////////////////////////////////
/// String extentions /////////////////////////////////////////
///////////////////////////////////////////////////////////////

var StringEx;
if (!StringEx)
    StringEx = {};

StringEx.isNullOrEmpty = function (str) {
    return str == null || str.length == 0;
};

StringEx.isNullOrWhiteSpace = function (str) {
    return str == null || !(/\S/.test(str));
};

String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};

String._formatRE = /(\{[^\}^\{]+\})/g;
String._format = function String$_format(format, values, useLocale) {
    return format.replace(String._formatRE,
        function (str, m) {
            var index = parseInt(m.substr(1), 10);
            var value = values[index + 1];
            if (value == null)
                return '';
            if (value.format) {
                var formatSpec = null;
                var formatIndex = m.indexOf(':');
                if (formatIndex > 0) {
                    formatSpec = m.substring(formatIndex + 1, m.length - 1);
                }
                return useLocale ? value.localeFormat(formatSpec) : value.format(formatSpec);
            }
            else
                return useLocale ? (value.localeFormat ? value.localeFormat() : value.toLocaleString()) : value.toString();
        });
};

StringEx.format = function String$format(format) {
    return String._format(format, arguments, /* useLocale */true);
};

String.fromChar = function String$fromChar(ch, count) {
    var s = ch;
    for (var i = 1; i < count; i++) {
        s += ch;
    }
    return s;
};

String.prototype.padLeft = function String$padLeft(totalWidth, ch) {
    if (this.length < totalWidth) {
        return String.fromChar(ch || ' ', totalWidth - this.length) + this;
    }
    return this.substring(0, this.length);
};

String.prototype.padRight = function String$padRight(totalWidth, ch) {
    if (this.length < totalWidth) {
        return this + String.fromChar(ch || ' ', totalWidth - this.length);
    }
    return this.substring(0, this.length);
};

String.prototype.endsWith = function String$endsWith(suffix) {
    if (!suffix.length) {
        return true;
    }
    if (suffix.length > this.length) {
        return false;
    }
    return (this.substr(this.length - suffix.length) == suffix);
};

String.prototype.startsWith = function String$startsWith(prefix) {
    if (!prefix.length) {
        return true;
    }
    if (prefix.length > this.length) {
        return false;
    }
    return (this.substr(0, prefix.length) == prefix);
};

String.prototype.insert = function String$insert(value, index) {
    var length = this.length;

    if (index == length) {
        return this.substring(0, index) + value;
    }
    return this.substring(0, index) + value + this.substring(index, length);
};

String.prototype.trimStart = function String$trimStart(c) {
    if (this.length == 0)
        return '';

    c = c || ' ';
    var i = 0;
    for (; this.charAt(i) == c && i < this.length; i++);
    return this.substring(i);
};

String.prototype.trimEnd = function String$trimEnd(c) {
    if (this.length == 0)
        return '';

    c = c ? c : ' ';
    var i = this.length - 1;
    for (; i >= 0 && this.charAt(i) == c; i--);
    return this.substring(0, i + 1);
};

String.prototype.asDataUri = function String$asDataUri() {
    if (/^iVBOR/.test(this))
        return "data:image/png;base64," + this;
    if (/^\/9j\//.test(this))
        return "data:image/jpeg;base64," + this;
    if (/^R0lGOD/.test(this))
        return "data:image/gif;base64," + this;
    if (/^Qk/.test(this))
        return "data:image/bmp;base64," + this;
    if (/^PD94/.test(this))
        return "data:image/svg+xml;base64," + this;

    return "";
};

///////////////////////////////////////////////////////////////
/// Number Extensions /////////////////////////////////////////
///////////////////////////////////////////////////////////////

Number.parse = function Number$parse(s) {
    if (!s || !s.length) {
        return 0;
    }
    if ((s.indexOf('.') >= 0) || (s.indexOf('e') >= 0) ||
        s.endsWith('f') || s.endsWith('F')) {
        return parseFloat(s);
    }
    return parseInt(s, 10);
};

BigNumber.prototype.format = Number.prototype.format = function Number$format(format) {
    if (format == null || (format.length == 0) || (format == 'i')) {
        format = 'G';
    }
    return this._netFormat(format, false);
};

BigNumber.prototype.localeFormat = Number.prototype.localeFormat = function Number$localeFormat(format) {
    if (format == null || (format.length == 0) || (format == 'i')) {
        format = 'G';
    }
    return this._netFormat(format, true);
};

BigNumber.prototype.toLocaleString = Number.prototype.toLocaleString = function () {
    return this.localeFormat();
};

BigNumber._commaFormat = Number._commaFormat = function Number$_commaFormat(number, groups, decimal, comma) {
    var decimalPart = null;
    var decimalIndex = number.indexOf(decimal);
    if (decimalIndex > 0) {
        decimalPart = number.substr(decimalIndex);
        number = number.substr(0, decimalIndex);
    }

    var negative = number.startsWith('-');
    if (negative) {
        number = number.substr(1);
    }

    var groupIndex = 0;
    var groupSize = groups[groupIndex];
    if (number.length < groupSize) {
		if (negative) {
			number = '-' + number;
		}

        return decimalPart ? number + decimalPart : number;
    }

    var index = number.length;
    var s = '';
    var done = false;
    while (!done) {
        var length = groupSize;
        var startIndex = index - length;
        if (startIndex < 0) {
            groupSize += startIndex;
            length += startIndex;
            startIndex = 0;
            done = true;
        }
        if (!length) {
            break;
        }

        var part = number.substr(startIndex, length);
        if (s.length) {
            s = part + comma + s;
        }
        else {
            s = part;
        }
        index -= length;

        if (groupIndex < groups.length - 1) {
            groupIndex++;
            groupSize = groups[groupIndex];
        }
    }

    if (negative) {
        s = '-' + s;
    }
    return decimalPart ? s + decimalPart : s;
};

BigNumber.prototype._netFormat = Number.prototype._netFormat = function Number$_netFormat(format, useLocale) {
    var nf = useLocale ? Vidyano.CultureInfo.currentCulture.numberFormat : Vidyano.CultureInfo.invariantCulture.numberFormat;

    var s = '';
    var precision = -1;

    if (format.length > 1) {
        precision = parseInt(format.substr(1), 10);
    }

    var fs = format.charAt(0);
    switch (fs) {
        case 'd':
        case 'D':
            s = parseInt(Math.abs(this)).toString();
            if (precision != -1) {
                s = s.padLeft(precision, '0');
            }
            if (this < 0) {
                s = '-' + s;
            }
            break;
        case 'x':
        case 'X':
            s = parseInt(Math.abs(this)).toString(16);
            if (fs == 'X') {
                s = s.toUpperCase();
            }
            if (precision != -1) {
                s = s.padLeft(precision, '0');
            }
            break;
        case 'e':
        case 'E':
            if (precision == -1) {
                s = this.toExponential();
            }
            else {
                s = this.toExponential(precision);
            }
            if (fs == 'E') {
                s = s.toUpperCase();
            }
            break;
        case 'f':
        case 'F':
        case 'n':
        case 'N':
            if (precision == -1) {
                precision = nf.numberDecimalDigits;
            }
            s = this.toFixed(precision).toString();
            if (precision && (nf.numberDecimalSeparator != '.')) {
                var idx = s.indexOf('.');
                s = s.substr(0, idx) + nf.numberDecimalSeparator + s.substr(idx + 1);
            }
            if ((fs == 'n') || (fs == 'N')) {
                s = Number._commaFormat(s, nf.numberGroupSizes, nf.numberDecimalSeparator, nf.numberGroupSeparator);
            }
            break;
        case 'c':
        case 'C':
            if (precision == -1) {
                precision = nf.currencyDecimalDigits;
            }
            s = Math.abs(this).toFixed(precision).toString();
            if (precision && (nf.currencyDecimalSeparator != '.')) {
                var i = s.indexOf('.');
                s = s.substr(0, i) + nf.currencyDecimalSeparator + s.substr(i + 1);
            }
            s = Number._commaFormat(s, nf.currencyGroupSizes, nf.currencyDecimalSeparator, nf.currencyGroupSeparator);
            if (this < 0) {
                s = StringEx.format(nf.currencyNegativePattern, s);
            }
            else {
                s = StringEx.format(nf.currencyPositivePattern, s);
            }
            if (nf.currencySymbol != "$")
                s = s.replace("$", nf.currencySymbol);
            break;
        case 'p':
        case 'P':
            if (precision == -1) {
                precision = nf.percentDecimalDigits;
            }
            s = (Math.abs(this) * 100.0).toFixed(precision).toString();
            if (precision && (nf.percentDecimalSeparator != '.')) {
                var index = s.indexOf('.');
                s = s.substr(0, index) + nf.percentDecimalSeparator + s.substr(index + 1);
            }
            s = Number._commaFormat(s, nf.percentGroupSizes, nf.percentDecimalSeparator, nf.percentGroupSeparator);
            if (this < 0) {
                s = StringEx.format(nf.percentNegativePattern, s);
            }
            else {
                s = StringEx.format(nf.percentPositivePattern, s);
            }
            break;
        case 'g':
        case 'G':
            if (precision == -1)
                precision = 10;

            if (Math.floor(this) == this)
                s = this.toString();
            else
                s = this._netFormat("F" + precision, useLocale).trimEnd('0');
            break;
    }

    return s;
};

///////////////////////////////////////////////////////////////
/// Boolean extentions ////////////////////////////////////////
///////////////////////////////////////////////////////////////

BooleanEx = window.BooleanEx || {};

BooleanEx.parse = function Boolean$parse(str) {
    if (str == null)
        return null;

    switch (str.toLowerCase()) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            return null;
    }
};

///////////////////////////////////////////////////////////////
/// Date extentions ///////////////////////////////////////////
///////////////////////////////////////////////////////////////

Date._formatRE = /'.*?[^\\]'|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z/g;

Date.prototype.format = function Date$format(format) {
    if (format == null || (format.length == 0) || (format == 'i')) {
        format = 'G';
    }
    else if (format == 'id') {
        return this.toDateString();
    }
    else if (format == 'it') {
        return this.toTimeString();
    }

    return this._netFormat(format, false);
};

Date.prototype.localeFormat = function Date$localeFormat(format) {
    if (format == null || (format.length == 0) || (format == 'i')) {
        format = 'G';
    }
    else if (format == 'id') {
        return this.toLocaleDateString();
    }
    else if (format == 'it') {
        return this.toLocaleTimeString();
    }

    return this._netFormat(format, true);
};

Date.prototype._netFormat = function Date$_netFormat(format, useLocale) {
    var dt = this;
    var dtf = useLocale ? Vidyano.CultureInfo.currentCulture.dateFormat : Vidyano.CultureInfo.invariantCulture.dateFormat;

    if (format.length == 1) {
        switch (format) {
            case 'f':
                format = dtf.longDatePattern + ' ' + dtf.shortTimePattern;
                break;
            case 'F':
                format = dtf.dateTimePattern;
                break;
            case 'd':
                format = dtf.shortDatePattern;
                break;
            case 'D':
                format = dtf.longDatePattern;
                break;
            case 't':
                format = dtf.shortTimePattern;
                break;
            case 'T':
                format = dtf.longTimePattern;
                break;
            case 'g':
                format = dtf.shortDatePattern + ' ' + dtf.shortTimePattern;
                break;
            case 'G':
                format = dtf.shortDatePattern + ' ' + dtf.longTimePattern;
                break;
            case 'R':
            case 'r':
                dtf = Vidyano.CultureInfo.invariantCulture.dateFormat;
                format = dtf.gmtDateTimePattern;
                break;
            case 'u':
                format = dtf.universalDateTimePattern;
                break;
            case 'U':
                format = dtf.dateTimePattern;
                dt = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(),
                dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds(), dt.getUTCMilliseconds());
                break;
            case 's':
                format = dtf.sortableDateTimePattern;
                break;
            case 'y':
            case 'Y':
                format = dtf.yearMonthPattern;
                break;
        }
    }

    if (format.charAt(0) == '%') {
        format = format.substr(1);
    }

    var re = Date._formatRE;
    var sb = '';

    re.lastIndex = 0;
    while (true) {
        var index = re.lastIndex;
        var match = re.exec(format);

        sb += format.slice(index, match ? match.index : format.length);
        if (!match) {
            break;
        }

        var fs = match[0];
        var part = fs;
        switch (fs) {
            case 'dddd':
                part = dtf.dayNames[dt.getDay()];
                break;
            case 'ddd':
                part = dtf.shortDayNames[dt.getDay()];
                break;
            case 'dd':
                part = ("00" + dt.getDate()).substr(-2);
                break;
            case 'd':
                part = dt.getDate();
                break;
            case 'MMMM':
                part = dtf.monthNames[dt.getMonth()];
                break;
            case 'MMM':
                part = dtf.shortMonthNames[dt.getMonth()];
                break;
            case 'MM':
                part = ("00" + (dt.getMonth() + 1)).substr(-2);
                break;
            case 'M':
                part = (dt.getMonth() + 1);
                break;
            case 'yyyy':
                part = dt.getFullYear();
                break;
            case 'yy':
                part = ("00" + (dt.getFullYear() % 100)).substr(-2);
                break;
            case 'y':
                part = (dt.getFullYear() % 100);
                break;
            case 'h':
            case 'hh':
                part = dt.getHours() % 12;
                if (!part) {
                    part = '12';
                }
                else if (fs == 'hh') {
                    part = ("00" + part).substr(-2);
                }
                break;
            case 'HH':
                part = ("00" + dt.getHours()).substr(-2);
                break;
            case 'H':
                part = dt.getHours();
                break;
            case 'mm':
                part = ("00" + dt.getMinutes()).substr(-2);
                break;
            case 'm':
                part = dt.getMinutes();
                break;
            case 'ss':
                part = ("00" + dt.getSeconds()).substr(-2);
                break;
            case 's':
                part = dt.getSeconds();
                break;
            case 't':
            case 'tt':
                part = (dt.getHours() < 12) ? dtf.amDesignator : dtf.pmDesignator;
                if (fs == 't') {
                    part = part.charAt(0);
                }
                break;
            case 'fff':
                part = ("000" + dt.getMilliseconds()).substr(-3);
                break;
            case 'ff':
                part = ("000" + dt.getMilliseconds()).substr(-3).substr(0, 2);
                break;
            case 'f':
                part = ("000" + dt.getMilliseconds()).substr(-3).charAt(0);
                break;
            case 'z':
                part = dt.getTimezoneOffset() / 60;
                part = ((part >= 0) ? '-' : '+') + Math.floor(Math.abs(part));
                break;
            case 'zz':
            case 'zzz':
                part = dt.getTimezoneOffset() / 60;
                part = ((part >= 0) ? '-' : '+') + ("00" + Math.floor(Math.abs(part))).substr(-2);
                if (fs == 'zzz') {
                    part += dtf.timeSeparator + ("00" + Math.abs(dt.getTimezoneOffset() % 60)).substr(-2);
                }
                break;
            default:
                if (part.charAt(0) == '\'') {
                    part = part.substr(1, part.length - 2).replace(/\\'/g, '\'');
                }
                break;
        }
        sb += part;
    }

    return sb;
};

Date.prototype.toLocaleString = function () {
    return this.localeFormat();
};

Date.prototype.netType = function Date$netType(value) {
    if (typeof (value) == "undefined")
        return this._netType || "DateTime";

    this._netType = value;
    return this;
};

Date.prototype.netOffset = function Date$netOffset(value) {
    if (typeof (value) == "undefined")
        return this._netOffset || (this._netOffset = StringEx.format("{0:d2}:{1:d2}", Math.round(this.getTimezoneOffset() / 60), Math.abs(this.getTimezoneOffset() % 60)));

    this._netOffset = value;
    return this;
};

///////////////////////////////////////////////////////////////
/// Array Extensions //////////////////////////////////////////
///////////////////////////////////////////////////////////////

Object.defineProperty(Array.prototype, "remove", {
    value: function Array$remove(s) {
        /// <summary>Removes all instances of s from this instance.</summary>
        /// <returns type="Boolean" />

        var success = false;
        for (var index = this.length; index--;) {
            if (s == this[index]) {
                this.splice(index, 1);
                success = true;
            }
        }

        return success;
    },
    configurable: true,
    writable: true,
    enumerable: false
})

Object.defineProperty(Array.prototype, "removeAll", {
    value: function Array$removeAll(f, thisObject) {
         /// <summary>Removes all instances that match function f from this instance.</summary>

         if (this.length > 0) {
             for (var index = this.length; index--;) {
                 if (f.call(thisObject, this[index], index, this))
                     this.splice(index, 1);
             }
         }
    },
    configurable: true,
    writable: true,
    enumerable: false
})

///////////////////////////////////////////////////////////////
/// Expression Parser /////////////////////////////////////////
///////////////////////////////////////////////////////////////
///
var ExpressionParser = (function () {
    var ep = {
        alwaysTrue: function () { return true; },
        cache: {},
        operands: ["<=", ">=", "<", ">", "!=", "="],

        get: function (expression) {
            if (StringEx.isNullOrWhiteSpace(expression))
                return ep.alwaysTrue;

            expression = expression.replace(/ /g, "").toUpperCase();
            var result = ep.cache[expression];
            if (result == null)
                return ep.cache[expression] = ep.parse(expression);
            return result;
        },

        parse: function (expression) {
            var get = ep.get;
            var operands = ep.operands;

            var parts = expression.split('X');
            if (parts.length > 1) {
                // Combine parts
                var result = null;
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];

                    var newResult = get(part);
                    if (result != null) {
                        var previousResult = result;
                        result = function (arg) { return previousResult(arg) && newResult(arg); };
                    }
                    else
                        result = newResult;
                }
                return result;
            }

            if (expression != parts[0])
                return get(parts[0]);

            // Get operand
            for (var idx = 0; idx < operands.length; idx++) {
                var operand = operands[idx];

                var index = expression.indexOf(operand);
                if (index >= 0) {
                    expression = expression.replace(operand, "");
                    if (index > 0) {
                        // NOTE: Change 5< to >5
                        if (operand.contains("<"))
                            return get(operand.replace("<", ">") + expression);
                        if (operand.contains(">"))
                            return get(operand.replace(">", "<") + expression);
                    }

                    var number = parseInt(expression, 10);
                    if (!isNaN(number)) {
                        switch (operand) {
                            case "<":
                                return new Function("x", "return x < " + number + ";");
                            case "<=":
                                return new Function("x", "return x <= " + number + ";");
                            case ">":
                                return new Function("x", "return x > " + number + ";");
                            case ">=":
                                return new Function("x", "return x >= " + number + ";");
                            case "!=":
                                return new Function("x", "return x != " + number + ";");
                            default:
                                return new Function("x", "return x == " + number + ";");
                        }
                    }
                }
            }

            return ep.alwaysTrue;
        }
    };

    return ep;
})(window);

///////////////////////////////////////////////////////////////
/// Unique ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///
var Unique = (function () {
    var n = 1;

    return {
        get: function () {
            return (n++).toString(36);
        }
    }
})(window);

///////////////////////////////////////////////////////////////
/// Helper Methods ////////////////////////////////////////////
///////////////////////////////////////////////////////////////

var Vidyano;
(function (Vidyano) {
    "use strict";
    function noop() {
    }
    Vidyano.noop = noop;
    function extend(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            for (var key in source) {
                if (source.hasOwnProperty(key))
                    target[key] = source[key];
            }
        });
        return target;
    }
    Vidyano.extend = extend;
    function splitWithTail(value, separator, limit) {
        var pattern, startIndex, m, parts = [];
        if (!limit)
            return value.split(separator);
        if (separator instanceof RegExp)
            pattern = new RegExp(separator.source, "g" + (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : ""));
        else
            pattern = new RegExp(separator.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1"), "g");
        do {
            startIndex = pattern.lastIndex;
            if (m = pattern.exec(value)) {
                parts.push(value.substr(startIndex, m.index - startIndex));
            }
        } while (m && parts.length < limit - 1);
        parts.push(value.substr(pattern.lastIndex));
        return parts;
    }
    Vidyano.splitWithTail = splitWithTail;
    function _debounce(func, wait, immediate) {
        var result;
        var timeout = null;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate)
                    result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                result = func.apply(context, args);
            return result;
        };
    }
    Vidyano._debounce = _debounce;
})(Vidyano || (Vidyano = {}));