namespace Vidyano {
    export abstract class DataType {
        static isDateTimeType(type: string): boolean {
            return [
                "NullableDate",
                "Date",
                "NullableTime",
                "Time",
                "NullableDateTime",
                "DateTime",
                "NullableDateTimeOffset",
                "DateTimeOffset"
            ].indexOf(type) >= 0;
        } 

        static isNumericType(type: string): boolean {
            return [
                "NullableDecimal",
                "Decimal",
                "NullableSingle",
                "Single",
                "NullableDouble",
                "Double",
                "NullableInt64",
                "Int64",
                "NullableUInt64",
                "UInt64",
                "NullableInt32",
                "Int32",
                "NullableUInt32",
                "UInt32",
                "NullableInt16",
                "Int16",
                "NullableUInt16",
                "UInt16",
                "NullableByte",
                "Byte",
                "NullableSByte",
                "SByte"
            ].indexOf(type) >= 0;
        }

        static isBooleanType(type: string): boolean {
            return [
                "Boolean",
                "YesNo",
                "NullableBoolean"
            ].indexOf(type) >= 0;
        } 

        private static _getDate = function (yearString: string, monthString: string, dayString: string, hourString: string, minuteString: string, secondString: string, msString: string) {
            const year = parseInt(yearString, 10);
            const month = parseInt(monthString || "1", 10) - 1;
            const day = parseInt(dayString || "1", 10);
            const hour = parseInt(hourString || "0", 10);
            const minutes = parseInt(minuteString || "0", 10);
            const seconds = parseInt(secondString || "0", 10);
            const ms = parseInt(msString || "0", 10);

            return new Date(year, month, day, hour, minutes, seconds, ms);
        }

        private static _getServiceTimeString = function (timeString: string, defaultValue: string) {
            if (!StringEx.isNullOrWhiteSpace(timeString)) {
                timeString = timeString.trim();

                // 00:00.0000000
                let ms = "0000000";
                const parts = timeString.split(".");
                if (parts.length === 2) {
                    ms = parts[1];
                    timeString = parts[0];
                }
                else if (parts.length !== 1)
                    return defaultValue;

                const length = timeString.length;
                if (length >= 4) {
                    const values = timeString.split(":"), valuesLen = values.length;
                    let days = 0, hours, minutes, seconds = 0;

                    if ((length === 4 || length === 5) && valuesLen === 2) {
                        // [0]0:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                    }
                    else if ((length === 7 || length === 8) && valuesLen === 3) {
                        // [0]0:00:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                        seconds = parseInt(values[2], 10);
                    }
                    else if (length >= 10 && valuesLen === 4) {
                        // 0:00:00:00
                        days = parseInt(values[0], 10);
                        hours = parseInt(values[1], 10);
                        minutes = parseInt(values[2], 10);
                        seconds = parseInt(values[3], 10);
                    }
                    else
                        return defaultValue;

                    if (!isNaN(days) && !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds) && days >= 0 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59)
                        return StringEx.format("{0}:{1:d2}:{2:d2}:{3:d2}.{4}", days, hours, minutes, seconds, ms.padRight(7, "0"));
                }
            }

            return defaultValue;
        }

        static fromServiceString(value: string, type: string): any {
            switch (type) {
                case "Decimal":
                case "Single":
                case "Double":
                case "Int64":
                case "UInt64":
                    if (StringEx.isNullOrEmpty(value))
                        return new BigNumber(0);

                    return new BigNumber(value);

                case "NullableDecimal":
                case "NullableSingle":
                case "NullableDouble":
                case "NullableInt64":
                case "NullableUInt64":
                    if (StringEx.isNullOrEmpty(value))
                        return null;

                    return new BigNumber(value);

                case "Int16":
                case "UInt16":
                case "Int32":
                case "UInt32":
                case "Byte":
                case "SByte":
                    if (StringEx.isNullOrEmpty(value))
                        return 0;

                    return parseInt(value, 10);

                case "NullableInt16":
                case "NullableInt32":
                case "NullableUInt16":
                case "NullableUInt32":
                case "NullableByte":
                case "NullableSByte":
                    if (StringEx.isNullOrEmpty(value))
                        return null;

                    return parseInt(value, 10);

                case "Date":
                case "NullableDate":
                case "DateTime":
                case "NullableDateTime":
                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    // Example format: 17-07-2003 00:00:00[.000] [+00:00]
                    if (!StringEx.isNullOrEmpty(value) && value.length >= 19) {
                        const parts = value.split(" ");
                        const date = parts[0].split("-");
                        const time = parts[1].split(":");
                        const dateTime = DataType._getDate(date[2], date[1], date[0], time[0], time[1], time[2].substring(0, 2), time[2].length > 2 ? time[2].substr(3, 3) : null);
                        if (parts.length === 3) {
                            dateTime.netType("DateTimeOffset");
                            dateTime.netOffset(parts[2]);
                        }

                        return dateTime;
                    }

                    const now = new Date();
                    if (type === "Date") {
                        now.setHours(0, 0, 0, 0);
                        return now;
                    }
                    else if (type === "DateTime")
                        return now;
                    else if (type === "DateTimeOffset") {
                        now.netType("DateTimeOffset");
                        const zone = now.getTimezoneOffset() * -1;
                        const zoneHour = zone / 60;
                        const zoneMinutes = zone % 60;
                        now.netOffset(StringEx.format("{0}{1:D2}:{2:D2}", zone < 0 ? "-" : "+", zoneHour, zoneMinutes)); // +00:00
                        return now;
                    }

                    return null;

                case "Time":
                case "NullableTime":
                    return DataType.toServiceString(value, type);

                case "Boolean":
                case "NullableBoolean":
                case "YesNo":
                    return value != null ? BooleanEx.parse(value) : null;

                default:
                    return value;
            }
        }

        static toServiceString(value: any, type: string): string {
            switch (type) {
                case "NullableDecimal":
                case "Decimal":
                case "NullableSingle":
                case "Single":
                case "NullableDouble":
                case "Double":
                case "NullableInt64":
                case "Int64":
                case "NullableUInt64":
                case "UInt64":
                case "NullableInt32":
                case "Int32":
                case "NullableUInt32":
                case "UInt32":
                case "NullableInt16":
                case "Int16":
                case "NullableUInt16":
                case "UInt16":
                case "NullableByte":
                case "Byte":
                case "NullableSByte":
                case "SByte":
                    if (StringEx.isNullOrEmpty(value) && !type.startsWith("Nullable"))
                        return "0";

                    break;

                case "Date":
                case "NullableDate":
                    if (!StringEx.isNullOrEmpty(value)) {
                        let date: Date = value;
                        if (typeof (date) === "string")
                            date = new Date(value);

                        return `${date.format("dd-MM-yyyy")} 00:00:00`;
                    }

                    break;

                case "DateTime":
                case "NullableDateTime":
                    if (!StringEx.isNullOrEmpty(value)) {
                        let date = value;
                        if (typeof (date) === "string")
                            date = new Date(value);

                        return date.format("dd-MM-yyyy HH:mm:ss.fff").trimEnd("0").trimEnd(".");
                    }

                    break;

                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    if (!StringEx.isNullOrEmpty(value)) {
                        let dateOffset = value;
                        if (typeof (value) === "string") {
                            if (value.length >= 23 && value.length <= 30) {
                                const dateParts = value.split(" ");

                                dateOffset = new Date(dateParts[0] + " " + dateParts[1]);
                                dateOffset.netOffset(dateParts[2]);
                                dateOffset.netType("DateTimeOffset");
                            }
                            else
                                return null;
                        }

                        return dateOffset.format("dd-MM-yyyy HH:mm:ss") + " " + (dateOffset.netOffset() || "+00:00");
                    }

                    break;

                case "Boolean":
                case "NullableBoolean":
                case "YesNo":
                    if (value == null)
                        return null;

                    if (typeof (value) === "string")
                        value = BooleanEx.parse(value);

                    return value ? "True" : "False";

                case "Time":
                    return DataType._getServiceTimeString(value, "0:00:00:00.0000000");

                case "NullableTime":
                    return DataType._getServiceTimeString(value, null);
            }

            return typeof (value) === "string" || value == null ? value : String(value);
        }
    }
}