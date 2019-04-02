namespace Vidyano {
    export let cookiePrefix: string;
    if (document.head) {
        const base = document.head.querySelector("base") as HTMLBaseElement;
        if (base) {
            const parser = document.createElement("a");
            parser.href = base.href;

            cookiePrefix = parser.pathname;
        }
    }

    if (!cookiePrefix)
        cookiePrefix = document.location.pathname;

    const hasStorage = (function () {
        const vi = "Vidyano";
        try {
            window.localStorage.setItem(vi, vi);
            window.localStorage.removeItem(vi);

            window.sessionStorage.setItem(vi, vi);
            window.sessionStorage.removeItem(vi);

            return true;
        } catch (e) {
            return false;
        }
    })();

    export function cookie(key: string, value?: any, options?: { force?: boolean; raw?: boolean; path?: string; domain?: string; secure?: boolean; expires?: number | Date; }): string {
        const now = new Date();

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (Object.prototype.toString.call(value) === "[object String]" || value === null || value === undefined)) {
            options = Vidyano.extend({}, options);

            if (value == null)
                options.expires = -1;

            let expires: Date = <Date>options.expires;
            if (typeof options.expires === "number") {
                expires = new Date();
                expires.setDate(expires.getDate() + <number>options.expires);
            }

            value = String(value);

            if (hasStorage && !options.force) {
                // Clear cookie
                document.cookie = encodeURIComponent(key) + "=; expires=" + new Date(Date.parse("2000-01-01")).toUTCString();

                // Save to localStorage/sessionStorage
                key = cookiePrefix + key;

                if (expires) {
                    if (expires > now)
                        window.localStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value), exp: expires.toUTCString() }));
                    else
                        window.localStorage.removeItem(key);

                    window.sessionStorage.removeItem(key);
                } else {
                    window.sessionStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value) }));
                    window.localStorage.removeItem(key);
                }

                return key;
            } else {
                return (document.cookie = [
                    encodeURIComponent(key), "=",
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? "; expires=" + expires.toUTCString() : "", // use expires attribute, max-age is not supported by IE
                    "; path=" + (options.path || cookiePrefix),
                    options.domain ? "; domain=" + options.domain : "",
                    options.secure ? "; secure" : ""
                ].join(""));
            }
        }

        // key and possibly options given, get cookie...
        options = value || {};
        const decode = options.raw ? s => s : decodeURIComponent;

        if (hasStorage && !options.force) {
            key = cookiePrefix + key;

            let item = <any>window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
            if (item != null) {
                item = JSON.parse(item);
                if (item.exp && new Date(item.exp) < now) {
                    window.localStorage.removeItem(key);
                    return key.endsWith("/authToken") ? "Expired" : null;
                }

                return decode(item.val);
            }
        } else {
            const parts = document.cookie.split("; ");
            for (let i = 0, part; part = parts[i]; i++) {
                const pair = part.split("=");
                if (decodeURIComponent(pair[0]) === key) return decode(pair[1] || ""); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB
            }
        }
        return null;
    }
}