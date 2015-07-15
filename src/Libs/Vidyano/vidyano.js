var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    "use strict";
    (function (NotificationType) {
        NotificationType[NotificationType["Error"] = 0] = "Error";
        NotificationType[NotificationType["Notice"] = 1] = "Notice";
        NotificationType[NotificationType["OK"] = 2] = "OK";
        NotificationType[NotificationType["Warning"] = 3] = "Warning";
    })(Vidyano.NotificationType || (Vidyano.NotificationType = {}));
    var NotificationType = Vidyano.NotificationType;
    var hasStorage = (function () {
        var vi = 'Vidyano';
        try {
            window.localStorage.setItem(vi, vi);
            window.localStorage.removeItem(vi);
            window.sessionStorage.setItem(vi, vi);
            window.sessionStorage.removeItem(vi);
            return true;
        }
        catch (e) {
            return false;
        }
    })();
    var locationPrefix = document.location.pathname;
    var mobile = (function (a) { return /android.+mobile|avantgo|bada\/|blackberry|bb10|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)); })(navigator.userAgent || navigator.vendor);
    function extend(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        sources.forEach(function (source) {
            for (var key in source)
                if (source.hasOwnProperty(key))
                    target[key] = source[key];
        });
        return target;
    }
    Vidyano.extend = extend;
    function cookie(key, value, options) {
        var now = new Date();
        // key and at least value given, set cookie...
        if (arguments.length > 1 && (Object.prototype.toString.call(value) === "[object String]" || value === null || value === undefined)) {
            options = Vidyano.extend({}, options);
            if (value == null)
                options.expires = -1;
            var expires = options.expires;
            if (typeof options.expires === 'number') {
                expires = new Date();
                expires.setDate(expires.getDate() + options.expires);
            }
            value = String(value);
            if (hasStorage && !options.force) {
                // Clear cookie
                document.cookie = encodeURIComponent(key) + '=; expires=' + new Date(Date.parse("2000-01-01")).toUTCString();
                // Save to localStorage/sessionStorage
                key = locationPrefix + key;
                if (options.expires) {
                    if (options.expires > now)
                        window.localStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value), exp: expires.toUTCString() }));
                    else
                        window.localStorage.removeItem(key);
                    window.sessionStorage.removeItem(key);
                }
                else {
                    window.sessionStorage.setItem(key, JSON.stringify({ val: options.raw ? value : encodeURIComponent(value) }));
                    window.localStorage.removeItem(key);
                }
                return key;
            }
            else {
                return (document.cookie = [
                    encodeURIComponent(key), '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + expires.toUTCString() : '',
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }
        }
        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function (s) { return s; } : decodeURIComponent;
        if (hasStorage && !options.force) {
            key = locationPrefix + key;
            var item = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
            if (item != null) {
                item = JSON.parse(item);
                if (item.exp && new Date(item.exp) < now) {
                    window.localStorage.removeItem(key);
                    return null;
                }
                return decode(item.val);
            }
        }
        else {
            var parts = document.cookie.split('; ');
            for (var i = 0, part; part = parts[i]; i++) {
                var pair = part.split('=');
                if (decodeURIComponent(pair[0]) === key)
                    return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB
            }
        }
        return null;
    }
    Vidyano.cookie = cookie;
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
    var Common;
    (function (Common) {
        var PropertyChangedArgs = (function () {
            function PropertyChangedArgs(propertyName, newValue, oldValue) {
                this.propertyName = propertyName;
                this.newValue = newValue;
                this.oldValue = oldValue;
            }
            return PropertyChangedArgs;
        })();
        Common.PropertyChangedArgs = PropertyChangedArgs;
        var Subject = (function () {
            function Subject(notifier) {
                var _this = this;
                this._observers = [];
                notifier.notify = function (source, detail) {
                    for (var i in _this._observers)
                        _this._observers[i](source, detail);
                };
            }
            Subject.prototype.attach = function (observer) {
                var id = this._observers.length;
                this._observers.push(observer);
                return this._detach.bind(this, id);
            };
            Subject.prototype._detach = function (observerId) {
                delete this._observers[observerId];
            };
            return Subject;
        })();
        Common.Subject = Subject;
        var Observable = (function () {
            function Observable() {
                this.propertyChanged = new Vidyano.Common.Subject(this._propertyChangedNotifier = { notify: undefined });
            }
            Observable.prototype.notifyPropertyChanged = function (propertyName, newValue, oldValue) {
                this._propertyChangedNotifier.notify(this, {
                    propertyName: propertyName,
                    newValue: newValue,
                    oldValue: oldValue
                });
            };
            return Observable;
        })();
        Common.Observable = Observable;
    })(Common = Vidyano.Common || (Vidyano.Common = {}));
    var Service = (function (_super) {
        __extends(Service, _super);
        function Service(serviceUri, hooks, _forceUser) {
            if (hooks === void 0) { hooks = new ServiceHooks(); }
            _super.call(this);
            this.serviceUri = serviceUri;
            this.hooks = hooks;
            this._forceUser = _forceUser;
            this._lastAuthTokenUpdate = new Date();
            this.environment = "Web";
            this.environmentVersion = "2";
            this.hooks._service = this;
        }
        Service.prototype._createUri = function (method) {
            var uri = this.serviceUri;
            if (!StringEx.isNullOrEmpty(uri) && !uri.endsWith('/'))
                uri += '/';
            return uri + method;
        };
        Service.prototype._createData = function (method, data) {
            data = data || {};
            if (!this.ignoreMobile && mobile)
                data.isMobile = true;
            data.environment = this.environment;
            data.environmentVersion = this.environmentVersion;
            if (method != "getApplication") {
                data.userName = this.userName;
                if (data.userName !== this.defaultUserName)
                    data.authToken = this.authToken;
            }
            data.profile = true;
            this.hooks.createData(data);
            return data;
        };
        Service.prototype._postJSON = function (url, data) {
            var _this = this;
            delete data._method;
            var createdRequest = new Date();
            return new Promise(function (resolve, reject) {
                var r = new XMLHttpRequest();
                r.open("POST", url, true);
                r.overrideMimeType("application/json; charset=utf-8");
                r.onload = function () {
                    if (r.status != 200) {
                        reject(r.statusText);
                        return;
                    }
                    var result = JSON.parse(r.responseText);
                    if (result.exception == null)
                        result.exception = result.ExceptionMessage;
                    if (result.exception == null) {
                        if (createdRequest > _this._lastAuthTokenUpdate) {
                            _this.authToken = result.authToken;
                            _this._lastAuthTokenUpdate = createdRequest;
                        }
                        if (_this.application)
                            _this.application._updateSession(result.session);
                        resolve(result);
                    }
                    else if (result.exception == "Session expired") {
                        _this.authToken = null;
                        delete data.authToken;
                        if (_this.isUsingDefaultCredentials) {
                            data.userName = _this._clientData.defaultUser;
                            delete data.password;
                            _this._postJSON(url, data).then(resolve, reject);
                        }
                        else {
                            reject(result.exception);
                            _this.hooks.onSessionExpired();
                        }
                    }
                    else
                        reject(result.exception);
                };
                r.onerror = function () { reject(r.statusText); };
                r.send(JSON.stringify(data));
            });
        };
        Service.prototype._getJSON = function (url) {
            return new Promise(function (resolve, reject) {
                var r = new XMLHttpRequest();
                r.open("GET", url, true);
                r.onload = function () {
                    if (r.status != 200) {
                        reject(r.statusText);
                        return;
                    }
                    resolve(JSON.parse(r.responseText));
                };
                r.onerror = function () { reject(r.statusText); };
                r.send();
            });
        };
        Service._decodeBase64 = function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                throw "There were invalid base64 characters in the input text.";
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            do {
                enc1 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc2 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc3 = Service._base64KeyStr.indexOf(input.charAt(i++));
                enc4 = Service._base64KeyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            } while (i < input.length);
            return unescape(output);
        };
        Service.prototype._getStream = function (obj, action, parent, query, selectedItems, parameters) {
            var data = this._createData("getStream");
            data.action = action;
            if (obj != null)
                data.id = obj.objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();
            if (query != null)
                data.query = query._toServiceObject();
            if (selectedItems != null)
                data.selectedItems = selectedItems.map(function (si) { return si._toServiceObject(); });
            if (parameters != null)
                data.parameters = parameters;
            var name = "iframe-vidyano-download";
            var iframe = document.querySelector("iframe[name='" + name + "']");
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.src = "javascript:false;";
                iframe.name = name;
                iframe.style.position = "absolute";
                iframe.style.top = "-1000px";
                iframe.style.left = "-1000px";
                document.body.appendChild(iframe);
            }
            var form = document.createElement("form");
            form.enctype = "multipart/form-data";
            form.encoding = "multipart/form-data";
            form.method = "post";
            form.action = this._createUri("GetStream");
            form.target = name;
            var input = document.createElement("input");
            input.type = "hidden";
            input.name = "data";
            input.value = JSON.stringify(data);
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        };
        Object.defineProperty(Service.prototype, "application", {
            get: function () {
                return this._application;
            },
            enumerable: true,
            configurable: true
        });
        Service.prototype._setApplication = function (application) {
            if (this._application === application)
                return;
            var oldApplication = this._application;
            this.notifyPropertyChanged("application", this._application = application, oldApplication);
        };
        Object.defineProperty(Service.prototype, "language", {
            get: function () {
                return this._language;
            },
            set: function (l) {
                this._language = l;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Service.prototype, "isSignedIn", {
            get: function () {
                return this._isSignedIn;
            },
            enumerable: true,
            configurable: true
        });
        Service.prototype._setIsSignedIn = function (val) {
            if (this._isSignedIn === val)
                return;
            var oldIsSignedIn = this._isSignedIn;
            this.notifyPropertyChanged("isSignedIn", this._isSignedIn = val, oldIsSignedIn);
        };
        Object.defineProperty(Service.prototype, "languages", {
            get: function () {
                return this._languages;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Service.prototype, "windowsAuthentication", {
            get: function () {
                return this._windowsAuthentication;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Service.prototype, "providers", {
            get: function () {
                return this._providers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Service.prototype, "isUsingDefaultCredentials", {
            get: function () {
                return this._isUsingDefaultCredentials;
            },
            enumerable: true,
            configurable: true
        });
        Service.prototype._setIsUsingDefaultCredentials = function (val) {
            var oldIsUsingDefaultCredentials = this.isUsingDefaultCredentials;
            if (oldIsUsingDefaultCredentials === val)
                return;
            this.notifyPropertyChanged("isUsingDefaultCredentials", this._isUsingDefaultCredentials = val, oldIsUsingDefaultCredentials);
        };
        Object.defineProperty(Service.prototype, "userName", {
            get: function () {
                return this._forceUser || Vidyano.cookie("userName");
            },
            enumerable: true,
            configurable: true
        });
        Service.prototype._setUserName = function (val) {
            var oldUserName = this.userName;
            if (oldUserName === val)
                return;
            if (this.staySignedIn)
                Vidyano.cookie("userName", val, { expires: 365 });
            else
                Vidyano.cookie("userName", val);
            this.notifyPropertyChanged("userName", val, oldUserName);
        };
        Object.defineProperty(Service.prototype, "defaultUserName", {
            get: function () {
                return !!this._clientData ? this._clientData.defaultUser : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Service.prototype, "authToken", {
            get: function () {
                if (this._forceUser)
                    return null;
                return Vidyano.cookie("authToken");
            },
            set: function (val) {
                if (this._forceUser)
                    return;
                if (this.staySignedIn)
                    Vidyano.cookie("authToken", val, { expires: 14 });
                else
                    Vidyano.cookie("authToken", val);
            },
            enumerable: true,
            configurable: true
        });
        Service.prototype.getTranslatedMessage = function (key) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            return StringEx.format.apply(null, [this.language.messages[key] || key].concat(params));
        };
        Service.prototype.initialize = function (skipDefaultCredentialLogin) {
            var _this = this;
            if (skipDefaultCredentialLogin === void 0) { skipDefaultCredentialLogin = false; }
            return this._getJSON(this._createUri("GetClientData?v=2")).then(function (clientData) {
                _this._clientData = clientData;
                var languages = [];
                for (var name in clientData.languages) {
                    languages.push({ culture: name, name: clientData.languages[name].name, isDefault: clientData.languages[name].isDefault, messages: clientData.languages[name].messages });
                }
                _this._languages = languages;
                _this.language = Enumerable.from(_this._languages).firstOrDefault(function (l) { return l.isDefault; });
                _this._providers = {};
                for (var provider in clientData.providers) {
                    _this._providers[provider] = clientData.providers[provider].parameters;
                }
                _this._windowsAuthentication = _this._clientData.windowsAuthentication;
                if (!StringEx.isNullOrEmpty(document.location.hash) && document.location.hash.startsWith("#!/SignInWithToken/")) {
                    var token = document.location.hash.substr(19);
                    var tokenParts = token.split("/", 2);
                    _this._setUserName(Service._decodeBase64(tokenParts[0]));
                    _this.authToken = tokenParts[1].replace("_", "/");
                    var returnUrl = Vidyano.cookie("returnUrl", { force: true });
                    if (returnUrl) {
                        Vidyano.cookie("returnUrl", null, { force: true });
                        document.location.hash = "!/" + returnUrl;
                    }
                    else
                        document.location.hash = "!/";
                    return _this._getApplication();
                }
                else {
                    _this._setUserName(_this.userName || _this._clientData.defaultUser);
                    if (_this._forceUser || !StringEx.isNullOrEmpty(_this.authToken) || ((_this._clientData.defaultUser || _this.windowsAuthentication) && !skipDefaultCredentialLogin))
                        return _this._getApplication();
                    else {
                        _this._setIsSignedIn(!!_this.application);
                        return Promise.resolve(_this.application);
                    }
                }
                _this._setIsSignedIn(!!_this.application);
                return Promise.resolve(_this.application);
            });
        };
        Service.prototype.signInExternal = function (providerName) {
            var _this = this;
            var provider = this.providers[providerName];
            if (provider != null) {
                var requestUri = provider.requestUri;
                if (typeof (Windows) != "undefined") {
                    var broker = Windows.Security.Authentication.Web.WebAuthenticationBroker;
                    var redirectUri = provider.redirectUri;
                    var authenticate = broker.authenticateAsync(Windows.Security.Authentication.Web.WebAuthenticationOptions.none, new Windows.Foundation.Uri(requestUri), new Windows.Foundation.Uri(redirectUri));
                    authenticate.then(function (result) {
                        if (result.responseStatus == Windows.Security.Authentication.Web.WebAuthenticationStatus.success) {
                            var data = _this._createData("getApplication");
                            data.accessToken = result.responseData.split('#')[0].replace(redirectUri + "?code=", "");
                            data.serviceProvider = "Yammer";
                            _this._getApplication(data).then(function () {
                                if (document.location.hash != "")
                                    document.location.hash = "";
                                document.location.reload();
                            }, function (e) {
                                // TODO: Toast notification!
                            });
                        }
                    });
                }
                else
                    document.location.assign(requestUri);
            }
        };
        Service.prototype.signInUsingCredentials = function (userName, password) {
            this._setUserName(userName);
            var data = this._createData("getApplication");
            data.userName = userName;
            data.password = password;
            return this._getApplication(data);
        };
        Service.prototype.signInUsingDefaultCredentials = function () {
            this._setUserName(this._clientData.defaultUser);
            return this._getApplication();
        };
        Service.prototype.signOut = function () {
            this._setUserName(null);
            this.authToken = null;
            this._setApplication(null);
            if (this._providers["Acs"] && this._providers["Acs"].signOutUri) {
                var iframe = document.createElement("iframe");
                iframe.width = "0";
                iframe.height = "0";
                iframe.src = this._providers["Acs"].signOutUri;
                iframe.onload = function () {
                    document.body.removeChild(iframe);
                };
                document.body.appendChild(iframe);
            }
            this._setIsSignedIn(false);
        };
        Service.prototype._getApplication = function (data) {
            var _this = this;
            if (data === void 0) { data = this._createData(""); }
            this._setIsUsingDefaultCredentials(this._clientData.defaultUser === this.userName);
            return new Promise(function (resolve, reject) {
                Vidyano.cookie("staySignedIn", _this.staySignedIn ? "true" : null, { force: true });
                _this._postJSON(_this._createUri("GetApplication"), data).then(function (result) {
                    if (!StringEx.isNullOrEmpty(result.exception)) {
                        reject(result.exception);
                        return;
                    }
                    if (result.application == null) {
                        reject("Unknown error");
                        return;
                    }
                    _this._setApplication(new Application(_this, result.application));
                    var resourcesQuery = _this.application.getQuery("Resources");
                    if (resourcesQuery)
                        _this.icons = Enumerable.from(resourcesQuery.items).where(function (i) { return i.getValue("Type") == "Icon"; }).toDictionary(function (i) { return i.getValue("Key"); }, function (i) { return i.getValue("Data"); });
                    else
                        _this.icons = Enumerable.empty().toDictionary(function (i) { return i; }, function (i) { return i; });
                    _this.actionDefinitions = Enumerable.from(_this.application.getQuery("Actions").items).toDictionary(function (i) { return i.getValue("Name"); }, function (i) { return new ActionDefinition(_this, i); });
                    _this.language = Enumerable.from(_this._languages).firstOrDefault(function (l) { return l.culture == result.userLanguage; }) || Enumerable.from(_this._languages).firstOrDefault(function (l) { return l.isDefault; });
                    var clientMessagesQuery = _this.application.getQuery("ClientMessages");
                    if (clientMessagesQuery)
                        clientMessagesQuery.items.forEach(function (msg) { return _this.language.messages[msg.getValue("Key")] = msg.getValue("Value"); });
                    Vidyano.CultureInfo.currentCulture = Vidyano.CultureInfo.cultures.get(result.userCultureInfo) || Vidyano.CultureInfo.cultures.get(result.userLanguage) || Vidyano.CultureInfo.invariantCulture;
                    _this._setUserName(result.userName);
                    _this._setIsUsingDefaultCredentials(_this._clientData.defaultUser === result.userName);
                    if (result.session)
                        _this.application._updateSession(result.session);
                    _this._setIsSignedIn(true);
                    resolve(_this.application);
                }, function (e) {
                    _this._setApplication(null);
                    _this._setIsSignedIn(false);
                    reject(e);
                });
            });
        };
        Service.prototype.getQuery = function (id, asLookup) {
            var _this = this;
            var data = this._createData("getQuery");
            data.id = id;
            return new Promise(function (resolve, reject) {
                _this._postJSON(_this._createUri("GetQuery"), data).then(function (result) {
                    if (result.exception == null)
                        resolve(_this.hooks.onConstructQuery(_this, result.query, null, asLookup));
                    else
                        reject(result.exception);
                }, function (e) {
                    reject(e);
                });
            });
        };
        Service.prototype.getPersistentObject = function (parent, id, objectId) {
            var _this = this;
            var data = this._createData("getPersistentObject");
            data.persistentObjectTypeId = id;
            data.objectId = objectId;
            if (parent != null)
                data.parent = parent.toServiceObject();
            return new Promise(function (resolve, reject) {
                _this._postJSON(_this._createUri("GetPersistentObject"), data).then(function (result) {
                    if (result.exception || (result.result && result.result.notification && result.result.notificationType == "Error"))
                        reject(result.exception || result.result.notification);
                    else
                        resolve(_this.hooks.onConstructPersistentObject(_this, result.result));
                }, function (e) {
                    reject(e);
                });
            });
        };
        Service.prototype.executeQuery = function (parent, query, asLookup) {
            var _this = this;
            if (asLookup === void 0) { asLookup = false; }
            var data = this._createData("executeQuery");
            data.query = query._toServiceObject();
            if (parent != null)
                data.parent = parent.toServiceObject();
            if (asLookup)
                data.asLookup = asLookup;
            return new Promise(function (resolve, reject) {
                _this._postJSON(_this._createUri("ExecuteQuery"), data).then(function (result) {
                    if (result.exception == null) {
                        resolve(result.result);
                    }
                    else {
                        query.setNotification(result.exception, NotificationType.Error);
                        reject(result.exception);
                    }
                }, function (e) {
                    query.setNotification(e, NotificationType.Error);
                    reject(e);
                });
            });
        };
        Service.prototype.executeAction = function (action, parent, query, selectedItems, parameters, skipHooks) {
            var _this = this;
            if (skipHooks === void 0) { skipHooks = false; }
            var isObjectAction = action.startsWith("PersistentObject.") || query == null;
            return new Promise(function (resolve, reject) {
                if (!skipHooks) {
                    if (!isObjectAction)
                        query.setNotification(null);
                    else if (parent)
                        parent.setNotification(null);
                    var args = new ExecuteActionArgs(_this, action, parent, query, selectedItems, parameters);
                    _this.hooks.onAction(args).then(function () {
                        if (args.isHandled)
                            resolve(args.result);
                        else
                            _this.executeAction(action, parent, query, selectedItems, parameters, true).then(function (po) {
                                resolve(po);
                            }, function (e) {
                                reject(e);
                            });
                    }, function (e) {
                        if (isObjectAction)
                            parent.setNotification(e);
                        else
                            query.setNotification(e);
                        reject(e);
                    });
                    return;
                }
                var data = _this._createData("executeAction");
                data.action = action;
                if (parent != null)
                    data.parent = parent.toServiceObject();
                if (query != null)
                    data.query = query._toServiceObject();
                if (selectedItems != null)
                    data.selectedItems = selectedItems.map(function (item) { return item._toServiceObject(); });
                if (parameters != null)
                    data.parameters = parameters;
                if (parent != null) {
                    var inputs = parent.getRegisteredInputs();
                    if (inputs.count() > 0) {
                        var iframeName = "iframe-" + new Date();
                        var iframe = document.createElement("iframe");
                        iframe.src = "javascript:false;";
                        iframe.name = iframeName;
                        iframe.style.position = "absolute";
                        iframe.style.top = "-1000px";
                        iframe.style.left = "-1000px";
                        var clonedForm = document.createElement("form");
                        clonedForm.enctype = "multipart/form-data";
                        clonedForm.encoding = "multipart/form-data";
                        clonedForm.method = "post";
                        clonedForm.action = _this._createUri("ExecuteAction");
                        clonedForm.target = iframeName;
                        var input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "data";
                        input.value = JSON.stringify(data);
                        clonedForm.appendChild(input);
                        clonedForm.style.display = "none";
                        inputs.where(function (item) { return item.value.value != ""; }).forEach(function (item) {
                            var input = item.value;
                            input.name = item.key;
                            var replacement = document.createElement("input");
                            replacement.type = "file";
                            input.insertAdjacentElement("afterend", replacement);
                            input.replacement = replacement;
                            clonedForm.appendChild(input);
                        });
                        var service = _this;
                        // NOTE: The first load event gets fired after the iframe has been injected into the DOM, and is used to prepare the actual submission.
                        iframe.onload = function (e) {
                            // NOTE: The second load event gets fired when the response to the form submission is received. The implementation detects whether the actual payload is embedded in a <textarea> element, and prepares the required conversions to be made in that case.
                            iframe.onload = function (e) {
                                var doc = this.contentWindow ? this.contentWindow.document : (this.contentDocument ? this.contentDocument : this.document), root = doc.documentElement ? doc.documentElement : doc.body, textarea = root.getElementsByTagName("textarea")[0], type = textarea ? textarea.getAttribute("data-type") : null, content = {
                                    html: root.innerHTML,
                                    text: type ?
                                        textarea.value :
                                        root ? (root.textContent || root.innerText) : null
                                };
                                var result = JSON.parse(content.text);
                                if (result.exception == null) {
                                    iframe.src = "javascript:false;";
                                    document.body.removeChild(iframe);
                                    resolve(result.result ? service.hooks.onConstructPersistentObject(service, result.result) : null);
                                }
                                else
                                    reject(result.exception);
                                document.body.removeChild(clonedForm);
                            };
                            Array.prototype.forEach.call(clonedForm.querySelectorAll("input"), function (input) { input.disabled = false; });
                            clonedForm.submit();
                            parent.clearRegisteredInputs();
                            inputs.forEach(function (item) {
                                var replacement = item.value.replacement;
                                if (replacement != null) {
                                    var tempParent = document.createElement("div");
                                    tempParent.innerHTML = item.value.outerHTML;
                                    var newInput = tempParent.querySelector("input");
                                    replacement.parentNode.replaceChild(newInput, replacement);
                                    parent.registerInput(item.key, newInput);
                                }
                                else
                                    parent.registerInput(item.key, item.value);
                            });
                        };
                        document.body.appendChild(clonedForm);
                        document.body.appendChild(iframe);
                        return;
                    }
                }
                _this._postJSON(_this._createUri("ExecuteAction"), data).then(function (result) {
                    resolve(result.result ? _this.hooks.onConstructPersistentObject(_this, result.result) : null);
                }, function (e) {
                    if (isObjectAction)
                        parent.setNotification(e);
                    else
                        query.setNotification(e);
                    reject(e);
                });
            });
        };
        Service.fromServiceString = function (value, typeName) {
            switch (typeName) {
                case "Decimal":
                case "Single":
                case "Double":
                    if (StringEx.isNullOrEmpty(value))
                        return 0.0;
                    return parseFloat(value);
                case "NullableDecimal":
                case "NullableSingle":
                case "NullableDouble":
                    if (StringEx.isNullOrEmpty(value))
                        return null;
                    return parseFloat(value);
                case "Int16":
                case "Int32":
                case "Int64":
                case "Byte":
                case "SByte":
                    if (StringEx.isNullOrEmpty(value))
                        return 0;
                    return parseInt(value, 10);
                case "NullableInt16":
                case "NullableInt32":
                case "NullableInt64":
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
                        var parts = value.split(" ");
                        var date = parts[0].split("-");
                        var time = parts[1].split(":");
                        var dateTime = Service.getDate(date[2], date[1], date[0], time[0], time[1], time[2].substring(0, 2), time[2].length > 2 ? time[2].substr(3, 3) : null);
                        if (parts.length == 3) {
                            dateTime.netType("DateTimeOffset");
                            dateTime.netOffset(parts[2]);
                        }
                        return dateTime;
                    }
                    var now = new Date();
                    if (typeName == "Date") {
                        now.setHours(0, 0, 0, 0);
                        return now;
                    }
                    else if (typeName == "DateTime")
                        return now;
                    else if (typeName == "DateTimeOffset") {
                        now.netType("DateTimeOffset");
                        var zone = now.getTimezoneOffset() * -1;
                        var zoneHour = zone / 60;
                        var zoneMinutes = zone % 60;
                        now.netOffset(StringEx.format("{0}{1:D2}:{2:D2}", zone < 0 ? "-" : "+", zoneHour, zoneMinutes)); // +00:00
                        return now;
                    }
                    return null;
                case "Time":
                case "NullableTime":
                    return Service.toServiceString(value, typeName);
                case "Boolean":
                case "NullableBoolean":
                case "YesNo":
                    return value != null ? BooleanEx.parse(value) : null;
                default:
                    return value;
            }
        };
        Service.toServiceString = function (value, typeName) {
            switch (typeName) {
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
                    if (StringEx.isNullOrEmpty(value) && !typeName.startsWith("Nullable"))
                        return "0";
                    break;
                case "Date":
                case "NullableDate":
                case "DateTime":
                case "NullableDateTime":
                    if (!StringEx.isNullOrEmpty(value)) {
                        var date = value;
                        if (typeof (date) == "string")
                            date = new Date(value);
                        return date.format("dd-MM-yyyy HH:mm:ss.fff").trimEnd('0').trimEnd('.');
                    }
                    break;
                case "DateTimeOffset":
                case "NullableDateTimeOffset":
                    if (!StringEx.isNullOrEmpty(value)) {
                        var dateOffset = value;
                        if (typeof (value) == "string") {
                            if (value.length >= 23 && value.length <= 30) {
                                var dateParts = value.split(" ");
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
                    if (typeof (value) == "string")
                        value = BooleanEx.parse(value);
                    return value ? "True" : "False";
                case "Time":
                    return Service._getServiceTimeString(value, "0:00:00:00.0000000");
                case "NullableTime":
                    return Service._getServiceTimeString(value, null);
            }
            return typeof (value) == "string" || value == null ? value : String(value);
        };
        Service.isNumericType = function (type) {
            return Service.numericTypes.indexOf(type) >= 0;
        };
        Service.isDateTimeType = function (type) {
            return Service.dateTimeTypes.indexOf(type) >= 0;
        };
        Service._base64KeyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        Service._getServiceTimeString = function (timeString, defaultValue) {
            if (!StringEx.isNullOrWhiteSpace(timeString)) {
                timeString = timeString.trim();
                // 00:00.0000000
                var ms = "0000000";
                var parts = timeString.split('.');
                if (parts.length == 2) {
                    ms = parts[1];
                    timeString = parts[0];
                }
                else if (parts.length != 1)
                    return defaultValue;
                var length = timeString.length;
                if (length >= 4) {
                    var values = timeString.split(':'), valuesLen = values.length;
                    var days = 0, hours, minutes, seconds = 0;
                    if ((length == 4 || length == 5) && valuesLen == 2) {
                        // [0]0:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                    }
                    else if ((length == 7 || length == 8) && valuesLen == 3) {
                        // [0]0:00:00
                        hours = parseInt(values[0], 10);
                        minutes = parseInt(values[1], 10);
                        seconds = parseInt(values[2], 10);
                    }
                    else if (length >= 10 && valuesLen == 4) {
                        // 0:00:00:00
                        days = parseInt(values[0], 10);
                        hours = parseInt(values[1], 10);
                        minutes = parseInt(values[2], 10);
                        seconds = parseInt(values[3], 10);
                    }
                    else
                        return defaultValue;
                    if (days != NaN && hours != NaN && minutes != NaN && seconds != NaN && days >= 0 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59)
                        return StringEx.format("{0}:{1:d2}:{2:d2}:{3:d2}.{4}", days, hours, minutes, seconds, ms.padRight(7, '0'));
                }
            }
            return defaultValue;
        };
        Service.getDate = function (yearString, monthString, dayString, hourString, minuteString, secondString, msString) {
            var year = parseInt(yearString, 10);
            var month = parseInt(monthString || "1", 10) - 1;
            var day = parseInt(dayString || "1", 10);
            var hour = parseInt(hourString || "0", 10);
            var minutes = parseInt(minuteString || "0", 10);
            var seconds = parseInt(secondString || "0", 10);
            var ms = parseInt(msString || "0", 10);
            return new Date(year, month, day, hour, minutes, seconds, ms);
        };
        Service.numericTypes = [
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
        ];
        Service.dateTimeTypes = [
            "NullableDate",
            "Date",
            "NullableTime",
            "Time",
            "NullableDateTime",
            "DateTime",
            "NullableDateTimeOffset",
            "DateTimeOffset"
        ];
        return Service;
    })(Vidyano.Common.Observable);
    Vidyano.Service = Service;
    var ServiceHooks = (function () {
        function ServiceHooks() {
        }
        Object.defineProperty(ServiceHooks.prototype, "service", {
            get: function () {
                return this._service;
            },
            enumerable: true,
            configurable: true
        });
        ServiceHooks.prototype.createData = function (data) {
        };
        ServiceHooks.prototype.setNotification = function (notification, type) {
        };
        ServiceHooks.prototype.onSessionExpired = function () {
        };
        ServiceHooks.prototype.onAction = function (args) {
            return Promise.resolve(null);
        };
        ServiceHooks.prototype.onOpen = function (obj, replaceCurrent, fromAction) {
            if (replaceCurrent === void 0) { replaceCurrent = false; }
            if (fromAction === void 0) { fromAction = false; }
        };
        ServiceHooks.prototype.onClose = function (obj) {
        };
        ServiceHooks.prototype.onConstructPersistentObject = function (service, po) {
            return new PersistentObject(service, po);
        };
        ServiceHooks.prototype.onConstructPersistentObjectAttributeTab = function (service, groups, key, id, name, layout, parent, columnCount) {
            return new PersistentObjectAttributeTab(service, groups.toArray(), key, id, name, layout, parent, columnCount);
        };
        ServiceHooks.prototype.onConstructPersistentObjectQueryTab = function (service, query) {
            return new PersistentObjectQueryTab(service, query);
        };
        ServiceHooks.prototype.onConstructPersistentObjectAttributeGroup = function (service, key, attributes, parent) {
            return new PersistentObjectAttributeGroup(service, key, attributes.toArray(), parent);
        };
        ServiceHooks.prototype.onConstructPersistentObjectAttribute = function (service, attr, parent) {
            return new PersistentObjectAttribute(service, attr, parent);
        };
        ServiceHooks.prototype.onConstructPersistentObjectAttributeWithReference = function (service, attr, parent) {
            return new PersistentObjectAttributeWithReference(service, attr, parent);
        };
        ServiceHooks.prototype.onConstructPersistentObjectAttributeAsDetail = function (service, attr, parent) {
            return new PersistentObjectAttributeAsDetail(service, attr, parent);
        };
        ServiceHooks.prototype.onConstructQuery = function (service, query, parent, asLookup, maxSelectedItems) {
            if (asLookup === void 0) { asLookup = false; }
            return new Query(service, query, parent, asLookup, maxSelectedItems);
        };
        ServiceHooks.prototype.onConstructQueryResultItem = function (service, item, query) {
            return new QueryResultItem(service, item, query);
        };
        ServiceHooks.prototype.onConstructQueryResultItemValue = function (service, value) {
            return new QueryResultItemValue(service, value);
        };
        ServiceHooks.prototype.onConstructQueryColumn = function (service, col, query) {
            return new QueryColumn(service, col, query);
        };
        ServiceHooks.prototype.onConstructAction = function (service, action) {
            return action;
        };
        ServiceHooks.prototype.onMessageDialog = function (title, message) {
            var actions = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                actions[_i - 2] = arguments[_i];
            }
            return Promise.resolve(-1);
        };
        ServiceHooks.prototype.onNavigate = function (path, replaceCurrent) {
            if (replaceCurrent === void 0) { replaceCurrent = false; }
        };
        return ServiceHooks;
    })();
    Vidyano.ServiceHooks = ServiceHooks;
    var ExecuteActionArgs = (function () {
        function ExecuteActionArgs(service, action, persistentObject, query, selectedItems, parameters) {
            this.service = service;
            this.persistentObject = persistentObject;
            this.query = query;
            this.selectedItems = selectedItems;
            this.parameters = parameters;
            this.isHandled = false;
            this._action = action;
            this.action = action.split(".")[1];
        }
        ExecuteActionArgs.prototype.executeServiceRequest = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.service.executeAction(_this._action, _this.persistentObject, _this.query, _this.selectedItems, _this.parameters, true).then(function (result) {
                    _this.result = result;
                    resolve(result);
                }, function (e) {
                    reject(e);
                });
            });
        };
        return ExecuteActionArgs;
    })();
    Vidyano.ExecuteActionArgs = ExecuteActionArgs;
    var ServiceObject = (function (_super) {
        __extends(ServiceObject, _super);
        function ServiceObject(service) {
            _super.call(this);
            this.service = service;
        }
        ServiceObject.prototype.copyProperties = function (propertyNames, includeNullValues, result) {
            var _this = this;
            result = result || {};
            propertyNames.forEach(function (p) {
                var value = _this[p];
                if (includeNullValues || (value != null && value !== false && (value !== 0 || p == "pageSize") && (!Array.isArray(value) || value.length > 0)))
                    result[p] = value;
            });
            return result;
        };
        return ServiceObject;
    })(Vidyano.Common.Observable);
    Vidyano.ServiceObject = ServiceObject;
    var ServiceObjectWithActions = (function (_super) {
        __extends(ServiceObjectWithActions, _super);
        function ServiceObjectWithActions(service, _actionNames) {
            if (_actionNames === void 0) { _actionNames = []; }
            _super.call(this, service);
            this._actionNames = _actionNames;
            this.actions = [];
            this._queue = new Queue(1);
        }
        Object.defineProperty(ServiceObjectWithActions.prototype, "isBusy", {
            get: function () {
                return this._isBusy;
            },
            enumerable: true,
            configurable: true
        });
        ServiceObjectWithActions.prototype._setIsBusy = function (val) {
            if (this._isBusy == val)
                return;
            var oldIsBusy = this._isBusy;
            this.notifyPropertyChanged("isBusy", this._isBusy = val, oldIsBusy);
        };
        ServiceObjectWithActions.prototype.setNotification = function (notification, type) {
            if (type === void 0) { type = NotificationType.Error; }
            var oldNotificationType = this.notificationType;
            this.notifyPropertyChanged("notificationType", this.notificationType = type, oldNotificationType);
            var oldNotification = this.notification;
            this.notifyPropertyChanged("notification", this.notification = notification, oldNotification);
        };
        ServiceObjectWithActions.prototype.queueWork = function (work, blockActions) {
            var _this = this;
            if (blockActions === void 0) { blockActions = true; }
            this._setIsBusy(true);
            return this._queue.add(function () {
                if (blockActions)
                    _this._blockActions(true);
                return work().then(function (result) {
                    _this._setIsBusy(_this._queue.getQueueLength() > 0);
                    if (blockActions)
                        _this._blockActions(false);
                    return result;
                }).catch(function (e) {
                    _this._setIsBusy(_this._queue.getQueueLength() > 0);
                    _this._blockActions(false);
                    return Promise.reject(e);
                });
            });
        };
        ServiceObjectWithActions.prototype._initializeActions = function () {
            var _this = this;
            Action.addActions(this.service, this, this.actions, this._actionNames);
            this.actions.forEach(function (a) {
                _this.actions[a.name] = a;
            });
        };
        ServiceObjectWithActions.prototype._blockActions = function (block) {
            this.actions.forEach(function (action) {
                action.block = block;
            });
        };
        return ServiceObjectWithActions;
    })(ServiceObject);
    Vidyano.ServiceObjectWithActions = ServiceObjectWithActions;
    (function (PersistentObjectLayoutMode) {
        PersistentObjectLayoutMode[PersistentObjectLayoutMode["FullPage"] = 0] = "FullPage";
        PersistentObjectLayoutMode[PersistentObjectLayoutMode["MasterDetail"] = 1] = "MasterDetail";
    })(Vidyano.PersistentObjectLayoutMode || (Vidyano.PersistentObjectLayoutMode = {}));
    var PersistentObjectLayoutMode = Vidyano.PersistentObjectLayoutMode;
    var PersistentObject = (function (_super) {
        __extends(PersistentObject, _super);
        function PersistentObject(service, po) {
            var _this = this;
            _super.call(this, service, (po._actionNames || po.actions || []).map(function (a) { return a == "Edit" && po.isNew ? "Save" : a; }));
            this._isEditing = false;
            this._isDirty = false;
            this._inputs = Enumerable.empty().toDictionary(function (i) { return i; }, function (i) { return null; });
            this.queriesToRefresh = [];
            this.attributesByName = {};
            this.queriesByName = {};
            this._id = po.id;
            this._isSystem = !!po.isSystem;
            this._type = po.type;
            this.label = po.label;
            this.fullTypeName = po.fullTypeName;
            this.queryLayoutMode = po.queryLayoutMode === "FullPage" ? PersistentObjectLayoutMode.FullPage : PersistentObjectLayoutMode.MasterDetail;
            this.objectId = po.objectId;
            this.breadcrumb = po.breadcrumb;
            this.notification = po.notification;
            this.notificationType = typeof (po.notificationType) == "number" ? po.notificationType : NotificationType[po.notificationType];
            this.isNew = !!po.isNew;
            this.newOptions = po.newOptions;
            this.isReadOnly = !!po.isReadOnly;
            this.isHidden = !!po.isHidden;
            this.ignoreCheckRules = !!po.ignoreCheckRules;
            this.stateBehavior = po.stateBehavior || "None";
            this.setIsEditing(false);
            this.securityToken = po.securityToken;
            this.bulkObjectIds = po.bulkObjectIds;
            this.queriesToRefresh = po.queriesToRefresh || [];
            this.parent = po.parent != null ? service.hooks.onConstructPersistentObject(service, po.parent) : null;
            this.attributes = po.attributes ? Enumerable.from(po.attributes).select(function (attr) {
                if (attr.displayAttribute || attr.objectId)
                    return _this.service.hooks.onConstructPersistentObjectAttributeWithReference(_this.service, attr, _this);
                if (attr.objects || attr.details)
                    return _this.service.hooks.onConstructPersistentObjectAttributeAsDetail(_this.service, attr, _this);
                return _this.service.hooks.onConstructPersistentObjectAttribute(_this.service, attr, _this);
            }).toArray() : [];
            this.attributes.forEach(function (attr) { return _this.attributesByName[attr.name] = attr; });
            this.queries = po.queries ? Enumerable.from(po.queries).select(function (query) { return service.hooks.onConstructQuery(service, query, _this); }).orderBy(function (q) { return q.offset; }).toArray() : [];
            this.queries.forEach(function (query) { return _this.queriesByName[query.name] = query; });
            var visibility = this.isNew ? "New" : "Read";
            var attributeTabs = po.tabs ? Enumerable.from(Enumerable.from(this.attributes).where(function (attr) { return attr.visibility == "Always" || attr.visibility.contains(visibility); }).orderBy(function (attr) { return attr.offset; }).groupBy(function (attr) { return attr.tab; }, function (attr) { return attr; }).select(function (tab) {
                var groups = tab.orderBy(function (attr) { return attr.offset; }).groupBy(function (attr) { return attr.group; }, function (attr) { return attr; }).select(function (group) { return _this.service.hooks.onConstructPersistentObjectAttributeGroup(service, group.key(), group, _this); }).memoize();
                groups.toArray().forEach(function (g, n) { return g.index = n; });
                var serviceTab = po.tabs[tab.key()] || {};
                return _this.service.hooks.onConstructPersistentObjectAttributeTab(service, groups, tab.key(), serviceTab.id, serviceTab.name, serviceTab.layout, _this, serviceTab.columnCount);
            })).toArray() : [];
            this._serviceTabs = po.tabs;
            this._tabs = attributeTabs.concat(Enumerable.from(this.queries).select(function (q) { return _this.service.hooks.onConstructPersistentObjectQueryTab(_this.service, q); }).toArray());
            if (this.isNew || this.stateBehavior == "OpenInEdit" || this.stateBehavior.indexOf("OpenInEdit") >= 0 || this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                this.beginEdit();
            this._initializeActions();
        }
        Object.defineProperty(PersistentObject.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObject.prototype, "isSystem", {
            get: function () {
                return this._isSystem;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObject.prototype, "type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObject.prototype, "tabs", {
            get: function () {
                return this._tabs;
            },
            set: function (tabs) {
                var oldTabs = this._tabs;
                this.notifyPropertyChanged("tabs", this._tabs = tabs, oldTabs);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObject.prototype, "isEditing", {
            get: function () {
                return this._isEditing;
            },
            enumerable: true,
            configurable: true
        });
        PersistentObject.prototype.setIsEditing = function (value) {
            this._isEditing = value;
            this.actions.forEach(function (action) { return action._onParentIsEditingChanged(value); });
            this.notifyPropertyChanged("isEditing", value, !value);
        };
        Object.defineProperty(PersistentObject.prototype, "isDirty", {
            get: function () {
                return this._isDirty;
            },
            enumerable: true,
            configurable: true
        });
        PersistentObject.prototype._setIsDirty = function (value) {
            this._isDirty = value;
            this.actions.forEach(function (action) { return action._onParentIsDirtyChanged(value); });
            if (this.ownerDetailAttribute && value)
                this.ownerDetailAttribute.onChanged(false);
        };
        PersistentObject.prototype.getAttributeValue = function (name) {
            var attr = this.attributesByName[name];
            return attr != null ? attr.value : null;
        };
        PersistentObject.prototype.getQuery = function (name) {
            return this.queriesByName[name];
        };
        PersistentObject.prototype.beginEdit = function () {
            if (!this.isEditing) {
                this.backupSecurityToken = this.securityToken;
                this.attributes.forEach(function (attr) { return attr.backup(); });
                this.setIsEditing(true);
            }
        };
        PersistentObject.prototype.cancelEdit = function () {
            if (this.isEditing) {
                this.setIsEditing(false);
                this._setIsDirty(false);
                this.securityToken = this.backupSecurityToken;
                this.attributes.forEach(function (attr) { return attr.restore(); });
                if (this.stateBehavior == "StayInEdit" || this.stateBehavior.indexOf("StayInEdit") >= 0)
                    this.beginEdit();
            }
        };
        PersistentObject.prototype.save = function (waitForOwnerQuery) {
            var _this = this;
            return this.queueWork(function () { return new Promise(function (resolve, reject) {
                if (_this.isEditing) {
                    _this.service.executeAction("PersistentObject.Save", _this, null, null, null).then(function (po) {
                        if (po) {
                            var wasNew = _this.isNew;
                            _this.refreshFromResult(po);
                            if (StringEx.isNullOrWhiteSpace(_this.notification) || _this.notificationType != NotificationType.Error) {
                                _this._setIsDirty(false);
                                if (!wasNew) {
                                    _this.setIsEditing(false);
                                    if (_this.stateBehavior == "StayInEdit" || _this.stateBehavior.indexOf("StayInEdit") >= 0)
                                        _this.beginEdit();
                                }
                                if (_this.ownerAttributeWithReference) {
                                    if (_this.ownerAttributeWithReference.objectId != _this.objectId) {
                                        var parent = _this.ownerAttributeWithReference.parent;
                                        if (parent.ownerDetailAttribute != null)
                                            parent = parent.ownerDetailAttribute.parent;
                                        parent.beginEdit();
                                        _this.ownerAttributeWithReference.changeReference([po.objectId]);
                                    }
                                    else if (_this.ownerAttributeWithReference.value != _this.breadcrumb)
                                        _this.ownerAttributeWithReference.value = _this.breadcrumb;
                                }
                                else if (_this.ownerQuery)
                                    _this.ownerQuery.search().then(function () {
                                        resolve(true);
                                    }, function () {
                                        resolve(true);
                                    });
                                if (waitForOwnerQuery !== true || !_this.ownerQuery)
                                    resolve(true);
                            }
                            else if (!StringEx.isNullOrWhiteSpace(_this.notification))
                                reject(_this.notification);
                        }
                    }, function (e) {
                        reject(e);
                    });
                }
                else
                    resolve(true);
            }); });
        };
        PersistentObject.prototype.getRegisteredInputs = function () {
            return this._inputs.toEnumerable().memoize();
        };
        PersistentObject.prototype.hasRegisteredInput = function (attributeName) {
            return !!this._inputs.contains(attributeName);
        };
        PersistentObject.prototype.registerInput = function (attributeName, input) {
            this._inputs.add(attributeName, input);
        };
        PersistentObject.prototype.clearRegisteredInputs = function (attributeName) {
            if (attributeName)
                this._inputs.remove(attributeName);
            else
                this._inputs.clear();
        };
        PersistentObject.prototype.toServiceObject = function (skipParent) {
            if (skipParent === void 0) { skipParent = false; }
            var result = this.copyProperties(["id", "type", "objectId", "isNew", "isHidden", "bulkObjectIds", "securityToken", "isSystem"]);
            if (this.parent && !skipParent)
                result.parent = this.parent.toServiceObject();
            if (this.attributes)
                result.attributes = Enumerable.from(this.attributes).select(function (attr) { return attr._toServiceObject(); }).toArray();
            return result;
        };
        PersistentObject.prototype.refreshFromResult = function (result) {
            var _this = this;
            this._serviceTabs = result._serviceTabs;
            this.setNotification(result.notification, result.notificationType);
            var resultAttributesEnum = Enumerable.from(result.attributes);
            if (this.attributes.length != result.attributes.length ||
                JSON.stringify(Enumerable.from(this.attributes).orderBy(function (a) { return a.id; }).select(function (a) { return a.id; }).toArray()) != JSON.stringify(resultAttributesEnum.orderBy(function (a) { return a.id; }).select(function (a) { return a.id; }).toArray())) {
                this.setNotification("Could not refresh from server result. One or more attributes don't match.", NotificationType.Error);
                return;
            }
            var visibilityChanged = [];
            var isDirty = false;
            this.attributes.forEach(function (attr) {
                var serviceAttr = resultAttributesEnum.firstOrDefault(function (a) { return a.id == attr.id; });
                if (serviceAttr && attr._refreshFromResult(serviceAttr))
                    visibilityChanged.push(attr);
                if (attr.isValueChanged)
                    isDirty = true;
            });
            if (visibilityChanged.length > 0) {
                var tabContentsChanged = [];
                var tabsRemoved = false;
                var tabsAdded = false;
                visibilityChanged.forEach(function (attr) {
                    var tab = Enumerable.from(_this.tabs).firstOrDefault(function (t) { return t instanceof PersistentObjectAttributeTab && t.key == attr.tab; });
                    if (!tab) {
                        if (!attr.isVisible)
                            return;
                        var groups = [_this.service.hooks.onConstructPersistentObjectAttributeGroup(_this.service, attr.group, Enumerable.from([attr]), _this)];
                        groups[0].index = 0;
                        var serviceTab = _this._serviceTabs[attr.tab];
                        tab = _this.service.hooks.onConstructPersistentObjectAttributeTab(_this.service, Enumerable.from(groups), attr.tab, serviceTab.id, serviceTab.name, serviceTab.layout, _this, serviceTab.columnCount);
                        _this.tabs.push(tab);
                        tabsAdded = true;
                        return;
                    }
                    var group = Enumerable.from(tab.groups).firstOrDefault(function (g) { return g.key == attr.group; });
                    if (!group && attr.isVisible) {
                        group = _this.service.hooks.onConstructPersistentObjectAttributeGroup(_this.service, attr.group, Enumerable.from([attr]), _this);
                        tab.groups.push(group);
                        tab.groups.sort(function (g1, g2) { return Enumerable.from(g1.attributes).min(function (a) { return a.offset; }) - Enumerable.from(g2.attributes).min(function (a) { return a.offset; }); });
                        tab.groups.forEach(function (g, n) { return g.index = n; });
                    }
                    else if (attr.isVisible) {
                        if (group.attributes.indexOf(attr) < 0) {
                            group.attributes.push(attr);
                            group.attributes.sort(function (x, y) { return x.offset - y.offset; });
                        }
                    }
                    else if (group) {
                        group.attributes.remove(attr);
                        if (group.attributes.length == 0) {
                            tab.groups.remove(group);
                            if (tab.groups.length == 0) {
                                _this.tabs.remove(tab);
                                tabsRemoved = true;
                                return;
                            }
                            else
                                tab.groups.forEach(function (g, n) { return g.index = n; });
                        }
                    }
                    if (tabContentsChanged.indexOf(tab) < 0)
                        tabContentsChanged.push(tab);
                });
                tabContentsChanged.forEach(function (tab) { return tab.groups = tab.groups.slice(); });
                if (tabsAdded) {
                    var attrTabs = this.tabs.filter(function (t) { return t instanceof PersistentObjectAttributeTab; });
                    attrTabs.sort(function (t1, t2) { return Enumerable.from(t1.groups).selectMany(function (g) { return g.attributes; }).min(function (a) { return a.offset; }) - Enumerable.from(t2.groups).selectMany(function (g) { return g.attributes; }).min(function (a) { return a.offset; }); });
                    this.tabs = attrTabs.concat.apply(attrTabs, this.tabs.filter(function (t) { return t instanceof PersistentObjectQueryTab; }));
                }
                else if (tabsRemoved)
                    this.tabs = this.tabs.slice();
            }
            this._setIsDirty(isDirty);
            if (this.isNew) {
                this.objectId = result.objectId;
                this.isNew = result.isNew;
            }
            this.securityToken = result.securityToken;
            if (result.breadcrumb)
                this.breadcrumb = result.breadcrumb;
            result.queriesToRefresh.forEach(function (id) {
                var query = Enumerable.from(_this.queries).firstOrDefault(function (q) { return q.id == id || q.name == id; });
                if (query && query.hasSearched) {
                    query.search();
                }
            });
        };
        PersistentObject.prototype.triggerDirty = function () {
            this._setIsDirty(true);
        };
        PersistentObject.prototype._triggerAttributeRefresh = function (attr) {
            var _this = this;
            return this.queueWork(function () {
                return new Promise(function (resolve, reject) {
                    var parameters = [{ RefreshedPersistentObjectAttributeId: attr.id }];
                    _this._prepareAttributesForRefresh(attr);
                    _this.service.executeAction("PersistentObject.Refresh", _this, null, null, parameters).then(function (result) {
                        if (_this.isEditing)
                            _this.refreshFromResult(result);
                        resolve(true);
                    }, function (e) {
                        reject(e);
                    });
                });
            });
        };
        PersistentObject.prototype._prepareAttributesForRefresh = function (sender) {
            Enumerable.from(this.attributes).where(function (a) { return a.id != sender.id; }).forEach(function (attr) {
                attr._refreshValue = attr.value;
                if (attr instanceof PersistentObjectAttributeWithReference) {
                    var attrWithRef = attr;
                    attrWithRef._refreshObjectId = attrWithRef.objectId;
                }
            });
        };
        return PersistentObject;
    })(ServiceObjectWithActions);
    Vidyano.PersistentObject = PersistentObject;
    var PersistentObjectAttribute = (function (_super) {
        __extends(PersistentObjectAttribute, _super);
        function PersistentObjectAttribute(service, attr, parent) {
            _super.call(this, service);
            this.parent = parent;
            this._queueRefresh = false;
            this.id = attr.id;
            this._isSystem = !!attr.isSystem;
            this.name = attr.name;
            this.type = attr.type;
            this.label = attr.label;
            this._serviceValue = attr.value !== undefined ? attr.value : null;
            this.group = attr.group;
            this.tab = attr.tab;
            this.isReadOnly = !!attr.isReadOnly;
            this.isRequired = !!attr.isRequired;
            this.isValueChanged = !!attr.isValueChanged;
            this.offset = attr.offset || 0;
            this.toolTip = attr.toolTip;
            this.rules = attr.rules;
            this.validationError = attr.validationError;
            this.visibility = attr.visibility;
            this.typeHints = attr.typeHints || {};
            this.editTemplateKey = attr.editTemplateKey;
            this.templateKey = attr.templateKey;
            this.disableSort = !!attr.disableSort;
            this.triggersRefresh = !!attr.triggersRefresh;
            this.column = attr.column;
            this.columnSpan = attr.columnSpan || 0;
            this._setOptions(attr.options);
        }
        Object.defineProperty(PersistentObjectAttribute.prototype, "isSystem", {
            get: function () {
                return this._isSystem;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObjectAttribute.prototype, "isVisible", {
            get: function () {
                return this.visibility.indexOf("Always") >= 0 || this.visibility.indexOf(this.parent.isNew ? "New" : "Read") >= 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObjectAttribute.prototype, "validationError", {
            get: function () {
                return this._validationError;
            },
            set: function (error) {
                var oldValidationError = this._validationError;
                if (oldValidationError != error)
                    this.notifyPropertyChanged("validationError", this._validationError = error, oldValidationError);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObjectAttribute.prototype, "displayValue", {
            get: function () {
                if (this._displayValueSource == this._serviceValue)
                    return !StringEx.isNullOrEmpty(this._displayValue) ? this._displayValue : "—";
                var format = this.getTypeHint("DisplayFormat", "{0}");
                var value = this.value;
                if (value != null && (this.type == "Boolean" || this.type == "NullableBoolean" || this.type == "YesNo"))
                    value = this.service.getTranslatedMessage(value ? this.getTypeHint("TrueKey", "Yes") : this.getTypeHint("FalseKey", "No"));
                else if (this.type == "KeyValueList") {
                    if (this.options && this.options.length > 0) {
                        var isEmpty = StringEx.isNullOrEmpty(value);
                        var option = Enumerable.from(this.options).firstOrDefault(function (o) { return o.key == value || (isEmpty && StringEx.isNullOrEmpty(o.key)); });
                        if (this.isRequired && option == null)
                            option = Enumerable.from(this.options).firstOrDefault(function (o) { return StringEx.isNullOrEmpty(o.key); });
                        if (option != null)
                            value = option.value;
                        else if (this.isRequired)
                            value = this.options.length > 0 ? this.options[0].value : null;
                    }
                }
                else if (value != null && (this.type == "Time" || this.type == "NullableTime")) {
                    value = value.trimEnd('0').trimEnd('.');
                    if (value.startsWith('0:'))
                        value = value.substr(2);
                    if (value.endsWith(':00'))
                        value = value.substr(0, value.length - 3);
                }
                if (format == "{0}") {
                    if (this.type == "Date" || this.type == "NullableDate")
                        format = "{0:" + Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern + "}";
                    else if (this.type == "DateTime" || this.type == "NullableDateTime")
                        format = "{0:" + Vidyano.CultureInfo.currentCulture.dateFormat.shortDatePattern + " " + Vidyano.CultureInfo.currentCulture.dateFormat.shortTimePattern + "}";
                }
                this._displayValueSource = this._serviceValue;
                return !StringEx.isNullOrEmpty(this._displayValue = value != null ? StringEx.format(format, value) : null) ? this._displayValue : "—";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObjectAttribute.prototype, "value", {
            get: function () {
                if (this._lastParsedValue !== this._serviceValue) {
                    this._lastParsedValue = this._serviceValue;
                    this._cachedValue = Service.fromServiceString(this._serviceValue, this.type);
                }
                return this._cachedValue;
            },
            set: function (val) {
                this.setValue(val);
            },
            enumerable: true,
            configurable: true
        });
        PersistentObjectAttribute.prototype.setValue = function (val, allowRefresh) {
            var _this = this;
            if (allowRefresh === void 0) { allowRefresh = true; }
            return new Promise(function (resolve, reject) {
                if (!_this.parent.isEditing || _this.isReadOnly) {
                    resolve(_this.value);
                    return;
                }
                var newServiceValue = Service.toServiceString(val, _this.type);
                var queuedTriggersRefresh = null;
                // If value is equal
                if ((_this._serviceValue == null && StringEx.isNullOrEmpty(newServiceValue)) || _this._serviceValue == newServiceValue) {
                    if (allowRefresh && _this._queueRefresh)
                        queuedTriggersRefresh = _this._triggerAttributeRefresh();
                }
                else {
                    var oldDisplayValue = _this.displayValue;
                    var oldServiceValue = _this._serviceValue;
                    _this.notifyPropertyChanged("value", _this._serviceValue = newServiceValue, oldServiceValue);
                    _this.isValueChanged = true;
                    var newDisplayValue = _this.displayValue;
                    if (oldDisplayValue != newDisplayValue)
                        _this.notifyPropertyChanged("displayValue", newDisplayValue, oldDisplayValue);
                    if (_this.triggersRefresh) {
                        if (allowRefresh)
                            queuedTriggersRefresh = _this._triggerAttributeRefresh();
                        else
                            _this._queueRefresh = true;
                    }
                    _this.parent.triggerDirty();
                }
                if (queuedTriggersRefresh)
                    queuedTriggersRefresh.then(resolve, reject);
                else
                    resolve(_this.value);
            });
        };
        PersistentObjectAttribute.prototype.backup = function () {
            this._backupData = this.copyProperties(["isReadOnly", "isValueChanged", "objectId", "validationError", "visibility"], true);
            this._backupData.value = this._serviceValue;
            this._backupData._serviceOptions = this._serviceOptions ? this._serviceOptions.slice() : this._serviceOptions;
            this._backupData.options = this.options ? this.options.slice() : this.options;
        };
        PersistentObjectAttribute.prototype.restore = function () {
            for (var name in this._backupData) {
                var oldValue = this[name];
                if (this[name] !== this._backupData[name]) {
                    if (name == "value") {
                        var oldDisplayValue = name == "value" ? this.displayValue : undefined;
                        this._serviceValue = this._backupData.value;
                        this.notifyPropertyChanged("displayValue", this.displayValue, oldDisplayValue);
                    }
                    else if (name == "options")
                        this.options = this._backupData.options;
                    else if (name == "_serviceOptions")
                        this._serviceOptions = this._backupData._serviceOptions;
                    this.notifyPropertyChanged(name, this[name] = this._backupData[name], oldValue);
                }
            }
            this._backupData = {};
        };
        PersistentObjectAttribute.prototype.getTypeHint = function (name, defaultValue, typeHints) {
            if (typeHints != null) {
                if (this.typeHints != null)
                    typeHints = Vidyano.extend({}, typeHints, this.typeHints);
            }
            else
                typeHints = this.typeHints;
            if (typeHints != null) {
                var typeHint = typeHints[name];
                if (typeHint == null) {
                    // NOTE: Look again case-insensitive
                    var lowerName = name.toLowerCase();
                    for (var prop in typeHints) {
                        if (lowerName == prop.toLowerCase()) {
                            typeHint = typeHints[prop];
                            break;
                        }
                    }
                }
                if (typeHint != null)
                    return typeHint;
            }
            return defaultValue;
        };
        PersistentObjectAttribute.prototype.getRegisteredInput = function () {
            var _this = this;
            var inputKvp = this.parent.getRegisteredInputs().firstOrDefault(function (kvp) { return kvp.key == _this.name; });
            return inputKvp ? inputKvp.value : null;
        };
        PersistentObjectAttribute.prototype.registerInput = function (input) {
            this.parent.registerInput(this.name, input);
        };
        PersistentObjectAttribute.prototype.clearRegisteredInput = function () {
            this.parent.clearRegisteredInputs(this.name);
        };
        PersistentObjectAttribute.prototype._toServiceObject = function () {
            var result = this.copyProperties(["id", "name", "label", "type", "isReadOnly", "triggersRefresh", "isRequired", "differsInBulkEditMode", "isValueChanged", "displayAttribute", "objectId", "visibility"]);
            result.value = this._serviceValue;
            if (this.options && this.options.length > 0 && this.isValueChanged)
                result.options = this.options.map(function (o) { return o ? (o.key ? o.key + "=" + o.value : o) : null; });
            else
                result.options = this._serviceOptions;
            if (this.objects != null) {
                result.objects = this.objects.map(function (obj) {
                    var detailObj = obj.toServiceObject(true);
                    if (obj.isDeleted)
                        detailObj.isDeleted = true;
                    return detailObj;
                });
            }
            return result;
        };
        PersistentObjectAttribute.prototype._refreshFromResult = function (resultAttr) {
            var visibilityChanged = false;
            this._setOptions(resultAttr._serviceOptions);
            if (this.isReadOnly != resultAttr.isReadOnly)
                this.notifyPropertyChanged("isReadOnly", this.isReadOnly = resultAttr.isReadOnly, !resultAttr.isReadOnly);
            this.isRequired = resultAttr.isRequired;
            if (this.visibility != resultAttr.visibility) {
                this.visibility = resultAttr.visibility;
                visibilityChanged = true;
            }
            if ((!this.isReadOnly && this._refreshValue !== undefined ? this._refreshValue : this.value) != resultAttr.value) {
                var oldDisplayValue = this.displayValue;
                var oldValue = this.value;
                this.notifyPropertyChanged("value", this.value = resultAttr.value, oldValue);
                this.notifyPropertyChanged("displayValue", this.displayValue, oldDisplayValue);
            }
            this._refreshValue = undefined;
            this.triggersRefresh = resultAttr.triggersRefresh;
            this.isValueChanged = resultAttr.isValueChanged;
            this.validationError = resultAttr.validationError;
            return visibilityChanged;
        };
        PersistentObjectAttribute.prototype._triggerAttributeRefresh = function () {
            this._queueRefresh = false;
            return this.parent._triggerAttributeRefresh(this);
        };
        PersistentObjectAttribute.prototype._setOptions = function (options) {
            var oldOptions = this.options ? this.options.slice() : undefined;
            if (!options || options.length == 0) {
                this.options = this._serviceOptions = options;
                return;
            }
            this._serviceOptions = options.slice(0);
            var addEmptyOption = !this.isRequired && !options.some(function (o) { return o == null || o.startsWith("="); }) && ["KeyValueList", "DropDown", "ComboBox"].indexOf(this.type) != -1;
            var keyValuePairOptionType = ["FlagsEnum", "KeyValueList", "Reference"].indexOf(this.type) != -1;
            if (!keyValuePairOptionType) {
                if (addEmptyOption)
                    options.splice(0, 0, null);
                this.options = options;
            }
            else {
                this.options = (addEmptyOption ? [{ key: null, value: "" }] : []).concat(options.map(function (o) {
                    var optionSplit = o.split("=", 2);
                    return {
                        key: optionSplit[0],
                        value: optionSplit[1]
                    };
                }));
            }
            this.notifyPropertyChanged("options", this.options, oldOptions);
        };
        return PersistentObjectAttribute;
    })(ServiceObject);
    Vidyano.PersistentObjectAttribute = PersistentObjectAttribute;
    var PersistentObjectAttributeWithReference = (function (_super) {
        __extends(PersistentObjectAttributeWithReference, _super);
        function PersistentObjectAttributeWithReference(service, attr, parent) {
            _super.call(this, service, attr, parent);
            this.parent = parent;
            if (attr.lookup)
                this.lookup = this.service.hooks.onConstructQuery(service, attr.lookup, parent, false, 1);
            else
                this.lookup = null;
            this.objectId = attr.objectId;
            this.displayAttribute = attr.displayAttribute;
            this.canAddNewReference = !!attr.canAddNewReference;
            this.selectInPlace = !!attr.selectInPlace;
        }
        PersistentObjectAttributeWithReference.prototype.addNewReference = function () {
            var _this = this;
            if (this.isReadOnly)
                return;
            this.service.executeAction("Query.New", this.parent, this.lookup, null, { PersistentObjectAttributeId: this.id }).then(function (po) {
                po.ownerAttributeWithReference = _this;
                _this.service.hooks.onOpen(po, false, true);
            }, function (error) {
                _this.parent.setNotification(error, NotificationType.Error);
            });
        };
        PersistentObjectAttributeWithReference.prototype.changeReference = function (selectedItems) {
            var _this = this;
            return this.parent.queueWork(function () { return new Promise(function (resolve, reject) {
                if (_this.isReadOnly)
                    reject("Attribute is read-only.");
                else {
                    _this.parent._prepareAttributesForRefresh(_this);
                    if (selectedItems.length && selectedItems.length > 0 && typeof selectedItems[0] === "string") {
                        var selectedObjectIds = selectedItems;
                        selectedItems = selectedObjectIds.map(function (id) { return _this.service.hooks.onConstructQueryResultItem(_this.service, { id: id }, null); });
                    }
                    _this.service.executeAction("PersistentObject.SelectReference", _this.parent, _this.lookup, selectedItems, [{ PersistentObjectAttributeId: _this.id }]).then(function (result) {
                        if (result)
                            _this.parent.refreshFromResult(result);
                        resolve(true);
                    }, function (e) {
                        reject(e);
                    });
                }
            }); });
        };
        PersistentObjectAttributeWithReference.prototype.getPersistentObject = function () {
            var _this = this;
            if (!this.objectId)
                return Promise.resolve(null);
            return this.parent.queueWork(function () { return _this.service.getPersistentObject(_this.parent, _this.lookup.persistentObject.id, _this.objectId); });
        };
        PersistentObjectAttributeWithReference.prototype._refreshFromResult = function (resultAttr) {
            var resultAttrWithRef = resultAttr;
            this.objectId = resultAttrWithRef.objectId;
            var visibilityChanged = _super.prototype._refreshFromResult.call(this, resultAttr);
            this.displayAttribute = resultAttrWithRef.displayAttribute;
            this.canAddNewReference = resultAttrWithRef.canAddNewReference;
            this.selectInPlace = resultAttrWithRef.selectInPlace;
            return visibilityChanged;
        };
        return PersistentObjectAttributeWithReference;
    })(PersistentObjectAttribute);
    Vidyano.PersistentObjectAttributeWithReference = PersistentObjectAttributeWithReference;
    var PersistentObjectAttributeAsDetail = (function (_super) {
        __extends(PersistentObjectAttributeAsDetail, _super);
        function PersistentObjectAttributeAsDetail(service, attr, parent) {
            var _this = this;
            _super.call(this, service, attr, parent);
            this.parent = parent;
            if (attr.details)
                this.details = this.service.hooks.onConstructQuery(service, attr.details, parent, true, 1);
            else
                this.details = null;
            if (attr.objects) {
                this.objects = attr.objects.map(function (po) {
                    var detailObj = _this.service.hooks.onConstructPersistentObject(service, po);
                    detailObj.parent = _this.parent;
                    detailObj.ownerDetailAttribute = _this;
                    return detailObj;
                });
            }
            else
                this.objects = [];
            this.parent.propertyChanged.attach(function (sender, args) {
                if (args.propertyName === "isEditing") {
                    if (args.newValue)
                        _this.objects.forEach(function (o) { return o.beginEdit(); });
                    else
                        _this.objects.forEach(function (o) { return o.cancelEdit(); });
                }
            });
            this.lookupAttribute = attr.lookupAttribute;
        }
        PersistentObjectAttributeAsDetail.prototype._refreshFromResult = function (resultAttr) {
            var _this = this;
            var asDetailAttr = resultAttr;
            var visibilityChanged = _super.prototype._refreshFromResult.call(this, resultAttr);
            if (this.objects != null && asDetailAttr.objects != null) {
                var isEditing = this.parent.isEditing;
                var oldObjects = this.objects;
                this.objects = asDetailAttr.objects.map(function (obj) {
                    obj.parent = _this.parent;
                    obj.ownerDetailAttribute = _this;
                    if (isEditing)
                        obj.beginEdit();
                    return obj;
                });
                this.notifyPropertyChanged("objects", this.objects, oldObjects);
            }
            return visibilityChanged;
        };
        PersistentObjectAttributeAsDetail.prototype.onChanged = function (allowRefresh) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!_this.parent.isEditing || _this.isReadOnly) {
                    resolve(_this.value);
                    return;
                }
                _this.parent.triggerDirty();
                if (_this.triggersRefresh) {
                    if (allowRefresh)
                        return _this._triggerAttributeRefresh();
                    else
                        _this._queueRefresh = true;
                }
                resolve(_this.value);
            });
        };
        PersistentObjectAttributeAsDetail.prototype.restore = function () {
            _super.prototype.restore.call(this);
            this.objects = this.objects.filter(function (obj) { return !obj.isNew; });
            this.objects.forEach(function (obj) {
                obj.isDeleted = false;
            });
        };
        return PersistentObjectAttributeAsDetail;
    })(PersistentObjectAttribute);
    Vidyano.PersistentObjectAttributeAsDetail = PersistentObjectAttributeAsDetail;
    var PersistentObjectTab = (function (_super) {
        __extends(PersistentObjectTab, _super);
        function PersistentObjectTab(service, name, label, target, parent, _isVisible) {
            if (_isVisible === void 0) { _isVisible = true; }
            _super.call(this);
            this.service = service;
            this.name = name;
            this.label = label;
            this.target = target;
            this.parent = parent;
            this._isVisible = _isVisible;
        }
        Object.defineProperty(PersistentObjectTab.prototype, "isVisible", {
            get: function () {
                return this._isVisible;
            },
            set: function (val) {
                var oldIsVisible = this._isVisible;
                if (oldIsVisible != val)
                    this.notifyPropertyChanged("isVisible", this._isVisible = val, oldIsVisible);
            },
            enumerable: true,
            configurable: true
        });
        return PersistentObjectTab;
    })(Common.Observable);
    Vidyano.PersistentObjectTab = PersistentObjectTab;
    var PersistentObjectAttributeTab = (function (_super) {
        __extends(PersistentObjectAttributeTab, _super);
        function PersistentObjectAttributeTab(service, _groups, key, id, name, _layout, po, columnCount) {
            _super.call(this, service, name, StringEx.isNullOrEmpty(key) ? po.label : key, po, po);
            this._groups = _groups;
            this.key = key;
            this.id = id;
            this._layout = _layout;
            this.columnCount = columnCount;
            this.tabGroupIndex = 0;
            this._attributes = this._updateAttributes();
        }
        Object.defineProperty(PersistentObjectAttributeTab.prototype, "layout", {
            get: function () {
                return this._layout;
            },
            enumerable: true,
            configurable: true
        });
        PersistentObjectAttributeTab.prototype._setLayout = function (layout) {
            var oldLayout = this._layout;
            this.notifyPropertyChanged("layout", this._layout = layout, oldLayout);
        };
        Object.defineProperty(PersistentObjectAttributeTab.prototype, "attributes", {
            get: function () {
                return this._attributes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PersistentObjectAttributeTab.prototype, "groups", {
            get: function () {
                return this._groups;
            },
            set: function (groups) {
                var oldGroups = this._groups;
                this.notifyPropertyChanged("groups", this._groups = groups, oldGroups);
                var oldAttributes = this._attributes;
                this.notifyPropertyChanged("attributes", this._attributes = this._updateAttributes(), oldAttributes);
            },
            enumerable: true,
            configurable: true
        });
        PersistentObjectAttributeTab.prototype.saveLayout = function (layout) {
            var _this = this;
            return this.service.executeAction("System.SaveTabLayout", null, null, null, { "Id": this.id, "Layout": layout ? JSON.stringify(layout) : "" }).then(function (_) {
                _this._setLayout(layout);
            });
        };
        PersistentObjectAttributeTab.prototype._updateAttributes = function () {
            var attributes = Enumerable.from(this.groups).selectMany(function (grp) { return grp.attributes; }).toArray();
            attributes.forEach(function (attr) { return attributes[attr.name] = attr; });
            return attributes;
        };
        return PersistentObjectAttributeTab;
    })(PersistentObjectTab);
    Vidyano.PersistentObjectAttributeTab = PersistentObjectAttributeTab;
    var PersistentObjectQueryTab = (function (_super) {
        __extends(PersistentObjectQueryTab, _super);
        function PersistentObjectQueryTab(service, query) {
            _super.call(this, service, query.name, query.label, query, query.parent, !query.isHidden);
            this.query = query;
            this.tabGroupIndex = 1;
        }
        return PersistentObjectQueryTab;
    })(PersistentObjectTab);
    Vidyano.PersistentObjectQueryTab = PersistentObjectQueryTab;
    var PersistentObjectAttributeGroup = (function () {
        function PersistentObjectAttributeGroup(service, key, attributes, parent) {
            this.service = service;
            this.key = key;
            this.attributes = attributes;
            this.parent = parent;
            this.label = key || "";
        }
        return PersistentObjectAttributeGroup;
    })();
    Vidyano.PersistentObjectAttributeGroup = PersistentObjectAttributeGroup;
    (function (SortDirection) {
        SortDirection[SortDirection["None"] = 0] = "None";
        SortDirection[SortDirection["Ascending"] = 1] = "Ascending";
        SortDirection[SortDirection["Descending"] = 2] = "Descending";
    })(Vidyano.SortDirection || (Vidyano.SortDirection = {}));
    var SortDirection = Vidyano.SortDirection;
    var Query = (function (_super) {
        __extends(Query, _super);
        function Query(service, query, parent, asLookup, maxSelectedItems) {
            if (asLookup === void 0) { asLookup = false; }
            _super.call(this, service, query._actionNames || query.actions);
            this.parent = parent;
            this.maxSelectedItems = maxSelectedItems;
            this._queriedPages = [];
            this._asLookup = asLookup;
            this.id = query.id;
            this.name = query.name;
            this.autoQuery = query.autoQuery;
            if (!this.autoQuery)
                this.items = [];
            this.canRead = query.canRead;
            this.isHidden = query.isHidden;
            this.label = query.label;
            this.notification = query.notification;
            this.notificationType = typeof (query.notificationType) == "number" ? query.notificationType : NotificationType[query.notificationType];
            this.offset = query.offset;
            this.textSearch = query.textSearch || "";
            this.pageSize = query.pageSize;
            this.skip = query.skip;
            this.top = query.top;
            this.groupingInfo = query.groupingInfo;
            this.persistentObject = query.persistentObject instanceof Vidyano.PersistentObject ? query.persistentObject : service.hooks.onConstructPersistentObject(service, query.persistentObject);
            this.singularLabel = this.persistentObject.label;
            this._updateColumns(query.columns);
            this._initializeActions();
            this._setTotalItems(query.totalItems);
            this._setSortOptionsFromService(query.sortOptions);
            if (query.disableBulkEdit) {
                var bulkEdit = this.actions["BulkEdit"];
                if (bulkEdit)
                    bulkEdit.selectionRule = function (count) { return count == 1; };
            }
            if (query.filters)
                this._filters = service.hooks.onConstructPersistentObject(service, query.filters);
            else
                this._filters = null;
            if (query.result)
                this._setResult(query.result);
        }
        Object.defineProperty(Query.prototype, "filters", {
            get: function () {
                return this._filters;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "selectedItems", {
            get: function () {
                return this.items ? this.items.filter(function (i) { return i.isSelected; }) : [];
            },
            set: function (items) {
                try {
                    this._isSelectionModifying = true;
                    items = items || [];
                    var selectedItems = this.selectedItems;
                    if (selectedItems && selectedItems.length > 0)
                        selectedItems.forEach(function (item) { return item.isSelected = false; });
                    items.forEach(function (item) { return item.isSelected = true; });
                    this.notifyPropertyChanged("selectedItems", items);
                }
                finally {
                    this._isSelectionModifying = false;
                }
            },
            enumerable: true,
            configurable: true
        });
        Query.prototype.selectRange = function (from, to) {
            try {
                this._isSelectionModifying = true;
                var itemsToSelect = this.items.slice(from, ++to);
                if (this.maxSelectedItems && Enumerable.from(this.selectedItems.concat(itemsToSelect)).distinct().count() > this.maxSelectedItems)
                    return;
                // Detect if array has gaps
                if (Object.keys(itemsToSelect).length == to - from) {
                    itemsToSelect.forEach(function (item) {
                        item.isSelected = true;
                    });
                    this.notifyPropertyChanged("selectedItems", this.selectedItems);
                    return true;
                }
                return false;
            }
            finally {
                this._isSelectionModifying = false;
            }
        };
        Object.defineProperty(Query.prototype, "asLookup", {
            get: function () {
                return this._asLookup;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "totalItems", {
            get: function () {
                return this._totalItems;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "labelWithTotalItems", {
            get: function () {
                return this._labelWithTotalItems;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Query.prototype, "sortOptions", {
            get: function () {
                return this._sortOptions;
            },
            set: function (options) {
                if (this._sortOptions === options)
                    return;
                var oldSortOptions = this._sortOptions;
                this.notifyPropertyChanged("sortOptions", this._sortOptions = options, oldSortOptions);
            },
            enumerable: true,
            configurable: true
        });
        Query.prototype._setSortOptionsFromService = function (options) {
            var _this = this;
            var oldSortOptions = this._sortOptions;
            var newSortOptions;
            if (typeof options === "string") {
                if (!StringEx.isNullOrEmpty(options)) {
                    newSortOptions = [];
                    options.split(';').map(function (option) { return option.trim(); }).forEach(function (option) {
                        var optionParts = option.split(' ', 2).map(function (option) { return option.trim(); });
                        var col = _this.getColumn(optionParts[0]);
                        if (col) {
                            newSortOptions.push({
                                column: col,
                                direction: optionParts.length < 2 || optionParts[1].toUpperCase() == "ASC" ? SortDirection.Ascending : SortDirection.Descending
                            });
                        }
                    });
                }
            }
            else
                newSortOptions = !!options ? options.slice(0) : [];
            this.sortOptions = newSortOptions;
        };
        Query.prototype._setTotalItems = function (items) {
            if (this._totalItems === items)
                return;
            var oldTotalItems = this._totalItems;
            this.notifyPropertyChanged("totalItems", this._totalItems = items, oldTotalItems);
            var oldLabelWithTotalItems = this._labelWithTotalItems;
            this._labelWithTotalItems = (this.totalItems != null ? this.totalItems + " " : "") + (this.totalItems != 1 ? this.label : (this.singularLabel || this.persistentObject.label || this.persistentObject.type));
            this.notifyPropertyChanged("labelWithTotalItems", this._labelWithTotalItems, oldLabelWithTotalItems);
        };
        Query.prototype._toServiceObject = function () {
            var result = this.copyProperties(["id", "name", "label", "pageSize", "skip", "top", "textSearch"]);
            result["sortOptions"] = this.sortOptions.filter(function (option) { return option.direction !== SortDirection.None; }).map(function (option) { return option.column.name + (option.direction == SortDirection.Ascending ? " ASC" : " DESC"); }).join("; ");
            if (this.persistentObject)
                result.persistentObject = this.persistentObject.toServiceObject();
            result.columns = Enumerable.from(this.columns).select(function (col) { return col._toServiceObject(); }).toArray();
            return result;
        };
        Query.prototype._setResult = function (result) {
            var _this = this;
            this.pageSize = result.pageSize || 0;
            this.groupingInfo = result.groupingInfo;
            if (this.groupingInfo) {
                var start = 0;
                this.groupingInfo.groups.forEach(function (g) {
                    g.start = start;
                    g.end = (start = start + g.count) - 1;
                });
            }
            if (this.pageSize > 0) {
                this._setTotalItems(result.totalItems || 0);
                this._queriedPages.push(Math.floor((this.skip || 0) / this.pageSize));
            }
            else
                this._setTotalItems(result.items.length);
            this.hasSearched = true;
            this._updateColumns(result.columns);
            this._updateItems(Enumerable.from(result.items).select(function (item) { return _this.service.hooks.onConstructQueryResultItem(_this.service, item, _this); }).toArray());
            this.totalItem = result.totalItem != null ? this.service.hooks.onConstructQueryResultItem(this.service, result.totalItem, this) : null;
            this.setNotification(result.notification, result.notificationType);
        };
        Query.prototype.getColumn = function (name) {
            return Enumerable.from(this.columns).firstOrDefault(function (c) { return c.name == name; });
        };
        Query.prototype.getItemsInMemory = function (start, length) {
            if (!this.hasSearched)
                return null;
            if (this.totalItems >= 0) {
                if (start > this.totalItems)
                    start = this.totalItems;
                if (start + length > this.totalItems)
                    length = this.totalItems - start;
            }
            if (this.pageSize <= 0 || length == 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();
            var startPage = Math.floor(start / this.pageSize);
            var endPage = Math.floor((start + length - 1) / this.pageSize);
            while (startPage < endPage && this._queriedPages.indexOf(startPage) >= 0)
                startPage++;
            while (endPage > startPage && this._queriedPages.indexOf(endPage) >= 0)
                endPage--;
            if (startPage == endPage && this._queriedPages.indexOf(startPage) >= 0)
                return Enumerable.from(this.items).skip(start).take(length).toArray();
            return null;
        };
        Query.prototype.getItems = function (start, length) {
            var _this = this;
            return this.queueWork(function () {
                if (!_this.hasSearched)
                    return _this.search(true).then(function () { return _this.getItems(start, length || _this.pageSize); });
                else {
                    if (_this.totalItems >= 0) {
                        if (start > _this.totalItems)
                            start = _this.totalItems;
                        if (start + length > _this.totalItems)
                            length = _this.totalItems - start;
                    }
                    if (_this.pageSize <= 0 || length == 0)
                        return Promise.resolve(_this.items.slice(start, start + length));
                    var startPage = Math.floor(start / _this.pageSize);
                    var endPage = Math.floor((start + length - 1) / _this.pageSize);
                    while (startPage < endPage && _this._queriedPages.indexOf(startPage) >= 0)
                        startPage++;
                    while (endPage > startPage && _this._queriedPages.indexOf(endPage) >= 0)
                        endPage--;
                    if (startPage == endPage && _this._queriedPages.indexOf(startPage) >= 0)
                        return Promise.resolve(_this.items.slice(start, start + length));
                    var clonedQuery = _this.clone(_this._asLookup);
                    clonedQuery.skip = startPage * _this.pageSize;
                    clonedQuery.top = (endPage - startPage + 1) * _this.pageSize;
                    return _this.service.executeQuery(_this.parent, clonedQuery, _this._asLookup).then(function (result) {
                        for (var p = startPage; p <= endPage; p++)
                            _this._queriedPages.push(p);
                        var isChanged = _this.pageSize > 0 && result.totalItems != _this.totalItems;
                        if (isChanged) {
                            // NOTE: Query has changed (items added/deleted) so remove old data
                            _this._queriedPages = [];
                            for (var i = startPage; i <= endPage; i++)
                                _this._queriedPages.push(i);
                            _this._updateItems([]);
                            _this._setTotalItems(result.totalItems);
                        }
                        for (var n = 0; n < clonedQuery.top && (clonedQuery.skip + n < clonedQuery.totalItems); n++) {
                            if (_this.items[clonedQuery.skip + n] == null)
                                _this.items[clonedQuery.skip + n] = _this.service.hooks.onConstructQueryResultItem(_this.service, result.items[n], _this);
                        }
                        if (isChanged)
                            return _this.getItems(start, length);
                        return Promise.resolve(_this.items.slice(start, start + length));
                    }, function (e) {
                        _this.setNotification(e, NotificationType.Error);
                        return Promise.reject(e);
                    });
                }
            }, false);
        };
        Query.prototype.search = function (immediate) {
            var _this = this;
            var search = function () {
                _this._queriedPages = [];
                _this._updateItems([], true);
                return _this.service.executeQuery(_this.parent, _this, _this._asLookup).then(function (result) {
                    _this.hasSearched = true;
                    _this._setResult(result);
                    return _this.items;
                });
            };
            if (immediate)
                return search();
            else
                return this.queueWork(search, false);
        };
        Query.prototype.clone = function (asLookup) {
            if (asLookup === void 0) { asLookup = false; }
            return this.service.hooks.onConstructQuery(this.service, this, this.parent, asLookup);
        };
        Query.prototype._updateColumns = function (_columns) {
            var _this = this;
            if (_columns === void 0) { _columns = []; }
            var oldColumns = this.columns ? this.columns.slice(0) : this.columns;
            var columns = this.columns || [];
            var columnsChanged = columns != this.columns;
            var _columnsEnum = Enumerable.from(_columns || []);
            var i = columns.length;
            while (i--) {
                if (_columnsEnum.firstOrDefault(function (c) { return columns[i].name == c.name; }) == null) {
                    columns[columns.splice(i, 1)[0].name] = undefined;
                    columnsChanged = true;
                }
            }
            _columns.forEach(function (c) {
                if (!columns[c.name]) {
                    columns.push(columns[c.name] = _this.service.hooks.onConstructQueryColumn(_this.service, c, _this));
                    columnsChanged = true;
                }
            });
            columns.sort(function (c1, c2) { return c1.offset - c2.offset; });
            if (this.columns != columns)
                this.columns = columns;
            this.notifyPropertyChanged("columns", this.columns, oldColumns);
        };
        Query.prototype._updateItems = function (items, reset) {
            if (reset === void 0) { reset = false; }
            if (reset)
                this.hasSearched = false;
            var oldItems = this.items;
            this.notifyPropertyChanged("items", this.items = items, oldItems);
            this.selectedItems = this.selectedItems;
        };
        Query.prototype._notifyItemSelectionChanged = function (item) {
            var _this = this;
            if (this._isSelectionModifying)
                return;
            var selectedItems = this.selectedItems;
            if (this.maxSelectedItems && selectedItems.length > this.maxSelectedItems) {
                try {
                    this._isSelectionModifying = true;
                    selectedItems.filter(function (i) { return i != item && selectedItems.length > _this.maxSelectedItems; }).forEach(function (i) { return i.isSelected = false; });
                    selectedItems = this.selectedItems;
                }
                finally {
                    this._isSelectionModifying = false;
                }
            }
            this.notifyPropertyChanged("selectedItems", selectedItems);
        };
        return Query;
    })(ServiceObjectWithActions);
    Vidyano.Query = Query;
    var QueryColumn = (function (_super) {
        __extends(QueryColumn, _super);
        function QueryColumn(service, col, query) {
            _super.call(this, service);
            this.query = query;
            this.displayAttribute = col.displayAttribute;
            this.disableSort = col.disableSort;
            this.canFilter = !!col.canFilter;
            this.includes = col.includes;
            this.excludes = col.excludes;
            this.label = col.label;
            this.name = col.name;
            this.offset = col.offset;
            this.type = col.type;
            this.isPinned = !!col.isPinned;
            this.isHidden = !!col.isHidden;
            this.typeHints = col.typeHints;
            this._sortDirection = SortDirection.None;
            query.propertyChanged.attach(this._queryPropertyChanged.bind(this));
        }
        Object.defineProperty(QueryColumn.prototype, "isSorting", {
            get: function () {
                return this._sortDirection !== SortDirection.None;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryColumn.prototype, "sortDirection", {
            get: function () {
                return this._sortDirection;
            },
            enumerable: true,
            configurable: true
        });
        QueryColumn.prototype._setSortDirection = function (direction) {
            if (this._sortDirection === direction)
                return;
            var oldSortDirection = this._sortDirection;
            this.notifyPropertyChanged("sortDirection", this._sortDirection = direction, oldSortDirection);
        };
        QueryColumn.prototype._toServiceObject = function () {
            return this.copyProperties(["id", "name", "label", "includes", "excludes", "type", "displayAttribute"]);
        };
        QueryColumn.prototype.getTypeHint = function (name, defaultValue, typeHints) {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        };
        QueryColumn.prototype.refreshDistincts = function () {
            var _this = this;
            return this.service.executeAction("QueryFilter.RefreshColumn", this.query.parent, this.query, null, [{ ColumnName: this.name }]).then(function (result) {
                _this.query.columns.filter(function (q) { return q != _this; }).forEach(function (col) {
                    if (col.distincts)
                        col.distincts.isDirty = true;
                });
                return _this.distincts = {
                    matching: result.attributesByName["MatchingDistincts"].options,
                    remaining: result.attributesByName["RemainingDistincts"].options,
                    isDirty: false
                };
            });
        };
        QueryColumn.prototype.sort = function (direction, multiSort) {
            var _this = this;
            if (!!multiSort) {
                var sortOption = this.query.sortOptions.filter(function (option) { return option.column === _this; })[0];
                if (sortOption && sortOption.direction === direction)
                    return;
                if (!sortOption) {
                    if (direction !== SortDirection.None)
                        this.query.sortOptions = this.query.sortOptions.concat([{ column: this, direction: direction }]);
                }
                else {
                    if (direction !== SortDirection.None) {
                        sortOption.direction = direction;
                        this.query.sortOptions = this.query.sortOptions.slice();
                    }
                    else
                        this.query.sortOptions = this.query.sortOptions.filter(function (option) { return option !== sortOption; });
                }
            }
            else
                this.query.sortOptions = direction !== SortDirection.None ? [{ column: this, direction: direction }] : [];
        };
        QueryColumn.prototype._queryPropertyChanged = function (sender, args) {
            var _this = this;
            if (args.propertyName == "sortOptions") {
                var sortOption = this.query.sortOptions.filter(function (option) { return option.column === _this; })[0];
                this._setSortDirection(sortOption ? sortOption.direction : SortDirection.None);
            }
        };
        return QueryColumn;
    })(ServiceObject);
    Vidyano.QueryColumn = QueryColumn;
    var QueryResultItem = (function (_super) {
        __extends(QueryResultItem, _super);
        function QueryResultItem(service, item, query) {
            var _this = this;
            _super.call(this, service);
            this.query = query;
            this.id = item.id;
            this.breadcrumb = item.breadcrumb;
            if (item.values)
                this.rawValues = Enumerable.from(item.values).select(function (v) { return service.hooks.onConstructQueryResultItemValue(_this.service, v); }).memoize();
            else
                this.rawValues = Enumerable.empty();
            this.typeHints = item.typeHints;
        }
        Object.defineProperty(QueryResultItem.prototype, "values", {
            get: function () {
                var _this = this;
                if (!this._values) {
                    this._values = {};
                    this.rawValues.forEach(function (v) {
                        _this._values[v.key] = Service.fromServiceString(v.value, _this.query.getColumn(v.key).type);
                    });
                }
                return this._values;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryResultItem.prototype, "isSelected", {
            get: function () {
                return this._isSelected;
            },
            set: function (val) {
                var oldIsSelected = this._isSelected;
                if (oldIsSelected == val)
                    return;
                this._isSelected = val;
                this.notifyPropertyChanged("isSelected", val, oldIsSelected);
                this.query._notifyItemSelectionChanged(this);
            },
            enumerable: true,
            configurable: true
        });
        QueryResultItem.prototype.getValue = function (key) {
            return this.values[key];
        };
        QueryResultItem.prototype.getFullValue = function (key) {
            var _this = this;
            if (!this._fullValuesByName) {
                this._fullValuesByName = {};
                this.rawValues.forEach(function (v) {
                    _this._fullValuesByName[v.key] = v;
                });
            }
            return this._fullValuesByName[key];
        };
        QueryResultItem.prototype.getTypeHint = function (name, defaultValue, typeHints) {
            return PersistentObjectAttribute.prototype.getTypeHint.apply(this, arguments);
        };
        QueryResultItem.prototype.getPersistentObject = function () {
            var _this = this;
            return this.query.queueWork(function () {
                return _this.service.getPersistentObject(_this.query.parent, _this.query.persistentObject.id, _this.id).then(function (po) {
                    po.ownerQuery = _this.query;
                    return po;
                });
            }, false);
        };
        QueryResultItem.prototype._toServiceObject = function () {
            var result = this.copyProperties(["id"]);
            result.values = this.rawValues.select(function (v) { return v._toServiceObject(); }).toArray();
            return result;
        };
        return QueryResultItem;
    })(ServiceObject);
    Vidyano.QueryResultItem = QueryResultItem;
    var QueryResultItemValue = (function (_super) {
        __extends(QueryResultItemValue, _super);
        function QueryResultItemValue(service, value) {
            _super.call(this, service);
            this.key = value.key;
            this.value = value.value;
            this.persistentObjectId = value.persistentObjectId;
            this.objectId = value.objectId;
            this.typeHints = value.typeHints;
        }
        QueryResultItemValue.prototype._toServiceObject = function () {
            return this.copyProperties(["key", "value", "persistentObjectId", "objectId"]);
        };
        return QueryResultItemValue;
    })(ServiceObject);
    Vidyano.QueryResultItemValue = QueryResultItemValue;
    var Action = (function (_super) {
        __extends(Action, _super);
        function Action(service, definition, owner) {
            var _this = this;
            _super.call(this, service);
            this.service = service;
            this.definition = definition;
            this.owner = owner;
            this._isVisible = true;
            this._parameters = {};
            this.options = [];
            this.dependentActions = [];
            this.displayName = definition.displayName;
            this.selectionRule = definition.selectionRule;
            if (owner instanceof Query) {
                this._targetType = "Query";
                this._query = owner;
                this._parent = this.query.parent;
                if (definition.name == "New" && this.query.persistentObject != null && !StringEx.isNullOrEmpty(this.query.persistentObject.newOptions))
                    this.options = this.query.persistentObject.newOptions.split(";");
                this.query.propertyChanged.attach(function (source, detail) {
                    if (detail.propertyName == "selectedItems")
                        _this.canExecute = _this.selectionRule(detail.newValue ? detail.newValue.length : 0);
                });
                this.canExecute = this.selectionRule(0);
            }
            else if (owner instanceof PersistentObject) {
                this._targetType = "PersistentObject";
                this._parent = owner;
                this.canExecute = true;
            }
            else
                throw "Invalid owner-type.";
            if (definition.options.length > 0)
                this.options = definition.options.slice();
        }
        Object.defineProperty(Action.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "query", {
            get: function () {
                return this._query;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "offset", {
            get: function () {
                return this._offset;
            },
            set: function (value) {
                this._offset = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "name", {
            get: function () {
                return this.definition.name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "canExecute", {
            get: function () {
                return this._canExecute && !this._block;
            },
            set: function (val) {
                if (this._canExecute == val)
                    return;
                this._canExecute = val;
                this.notifyPropertyChanged("canExecute", val, !val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "block", {
            set: function (block) {
                this._block = block;
                this.notifyPropertyChanged("canExecute", this._block = block, this._canExecute);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "isVisible", {
            get: function () {
                return this._isVisible;
            },
            set: function (val) {
                if (this._isVisible == val)
                    return;
                this._isVisible = val;
                this.notifyPropertyChanged("isVisible", val, !val);
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype.execute = function (option, parameters, selectedItems, throwExceptions) {
            var _this = this;
            if (option === void 0) { option = -1; }
            return new Promise(function (resolve, reject) {
                if (_this.canExecute || (selectedItems != null && _this.selectionRule(selectedItems.length)))
                    _this._onExecute(option, parameters, selectedItems).then(function (po) {
                        resolve(po);
                    }, function (e) {
                        if (throwExceptions)
                            reject(e);
                        else
                            _this.owner.setNotification(e);
                    });
            });
        };
        Action.prototype._onExecute = function (option, parameters, selectedItems) {
            var _this = this;
            if (option === void 0) { option = -1; }
            return this.owner.queueWork(function () {
                return new Promise(function (resolve, reject) {
                    parameters = _this._getParameters(parameters, option);
                    if (selectedItems == null && _this.query && _this.query.selectedItems)
                        selectedItems = _this.query.selectedItems;
                    _this.service.executeAction(_this._targetType + "." + _this.definition.name, _this.parent, _this.query, selectedItems, parameters).then(function (po) {
                        if (po != null) {
                            if (po.fullTypeName == "Vidyano.Notification") {
                                if (po.objectId != null && JSON.parse(po.objectId).dialog) {
                                    _this._setNotification();
                                    _this.service.hooks.setNotification(po.notification, po.notificationType);
                                }
                                else
                                    _this._setNotification(po.notification, po.notificationType);
                            }
                            else if (po.fullTypeName == "Vidyano.RegisteredStream") {
                                _this.service._getStream(po);
                            }
                            else if (_this.parent != null && (po.fullTypeName == _this.parent.fullTypeName || po.isNew == _this.parent.isNew) && po.id == _this.parent.id && po.objectId == _this.parent.objectId) {
                                _this.parent.refreshFromResult(po);
                                _this.parent.setNotification(po.notification, po.notificationType);
                            }
                            else {
                                po.ownerQuery = _this.query;
                                po.ownerPersistentObject = _this.parent;
                                if (!_this.skipOpen)
                                    _this.service.hooks.onOpen(po, false, true);
                            }
                        }
                        if (_this.query != null && _this.definition.refreshQueryOnCompleted)
                            _this.query.search();
                        resolve(po);
                    }, function (error) {
                        reject(error);
                    });
                });
            });
        };
        Action.prototype._getParameters = function (parameters, option) {
            if (parameters == null)
                parameters = {};
            if (this._parameters != null)
                parameters = Vidyano.extend({}, this._parameters, parameters);
            if (this.options != null && this.options.length > 0 && option >= 0) {
                parameters["MenuOption"] = option;
                parameters["MenuLabel"] = this.options[option];
            }
            else if (option != null)
                parameters["MenuOption"] = option;
            return parameters;
        };
        Action.prototype._onParentIsEditingChanged = function (isEditing) {
        };
        Action.prototype._onParentIsDirtyChanged = function (isDirty) {
        };
        Action.prototype._setNotification = function (notification, notificationType) {
            if (notification === void 0) { notification = null; }
            if (notificationType === void 0) { notificationType = NotificationType.Error; }
            if (this.query != null)
                this.query.setNotification(notification, notificationType);
            else
                this.parent.setNotification(notification, notificationType);
        };
        Action.get = function (service, name, owner) {
            var definition = service.actionDefinitions.get(name);
            if (definition != null) {
                var hook = Actions[name];
                return service.hooks.onConstructAction(service, hook != null ? new hook(service, definition, owner) : new Action(service, definition, owner));
            }
            else
                return null;
        };
        Action.addActions = function (service, owner, actions, actionNames) {
            if (actionNames == null || actionNames.length == 0)
                return;
            actionNames.forEach(function (actionName) {
                var action = Action.get(service, actionName, owner);
                action.offset = actions.length;
                actions.push(action);
                Action.addActions(service, owner, actions, action.dependentActions);
            });
        };
        return Action;
    })(ServiceObject);
    Vidyano.Action = Action;
    var Actions;
    (function (Actions) {
        var RefreshQuery = (function (_super) {
            __extends(RefreshQuery, _super);
            function RefreshQuery(service, definition, owner) {
                _super.call(this, service, definition, owner);
                this.isVisible = false;
            }
            RefreshQuery.prototype._onExecute = function (option, parameters, selectedItems) {
                if (option === void 0) { option = -1; }
                return this.query.search();
            };
            return RefreshQuery;
        })(Action);
        Actions.RefreshQuery = RefreshQuery;
        var Filter = (function (_super) {
            __extends(Filter, _super);
            function Filter(service, definition, owner) {
                _super.call(this, service, definition, owner);
                this.isVisible = false;
            }
            return Filter;
        })(Action);
        Actions.Filter = Filter;
        var Edit = (function (_super) {
            __extends(Edit, _super);
            function Edit(service, definition, owner) {
                _super.call(this, service, definition, owner);
                this.isVisible = !this.parent.isEditing;
                this.dependentActions = ["EndEdit", "CancelEdit"];
            }
            Edit.prototype._onParentIsEditingChanged = function (isEditing) {
                this.isVisible = !isEditing;
            };
            Edit.prototype._onExecute = function (option, parameters, selectedItems) {
                if (option === void 0) { option = -1; }
                this.parent.beginEdit();
                return Promise.resolve(null);
            };
            return Edit;
        })(Action);
        Actions.Edit = Edit;
        var EndEdit = (function (_super) {
            __extends(EndEdit, _super);
            function EndEdit(service, definition, owner) {
                _super.call(this, service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = this.parent.isDirty;
            }
            EndEdit.prototype._onParentIsEditingChanged = function (isEditing) {
                this.isVisible = isEditing;
            };
            EndEdit.prototype._onParentIsDirtyChanged = function (isDirty) {
                this.canExecute = isDirty;
            };
            EndEdit.prototype._onExecute = function (option, parameters, selectedItems) {
                var _this = this;
                if (option === void 0) { option = -1; }
                return new Promise(function (resolve, reject) {
                    _this.parent.save().then(function () {
                        if (StringEx.isNullOrWhiteSpace(_this.parent.notification) || _this.parent.notificationType != NotificationType.Error) {
                            var edit = _this.parent.actions["Edit"];
                            var endEdit = _this.parent.actions["EndEdit"];
                            if (_this.parent.stateBehavior.indexOf("StayInEdit") != -1 && endEdit != null) {
                                endEdit.canExecute = false;
                            }
                            else if (edit) {
                                edit.isVisible = true;
                                if (endEdit != null)
                                    endEdit.isVisible = false;
                            }
                        }
                        resolve(_this.parent);
                    }, function (e) {
                        reject(e);
                    });
                });
            };
            return EndEdit;
        })(Action);
        Actions.EndEdit = EndEdit;
        var Save = (function (_super) {
            __extends(Save, _super);
            function Save(service, definition, owner) {
                _super.call(this, service, definition, owner);
                this.dependentActions = ["CancelSave"];
            }
            Save.prototype._onExecute = function (option, parameters, selectedItems) {
                var _this = this;
                if (option === void 0) { option = -1; }
                var wasNew = this.parent.isNew;
                return new Promise(function (resolve, reject) {
                    _this.parent.save().then(function () {
                        if (StringEx.isNullOrWhiteSpace(_this.parent.notification) || _this.parent.notificationType != NotificationType.Error) {
                            if (wasNew && _this.parent.ownerAttributeWithReference == null && _this.parent.stateBehavior.indexOf("OpenAfterNew") != -1)
                                _this.service.getPersistentObject(_this.parent.parent, _this.parent.id, _this.parent.objectId).then(function (po2) {
                                    _this.service.hooks.onOpen(po2, true);
                                    resolve(_this.parent);
                                }, reject);
                            else {
                                _this.service.hooks.onClose(_this.parent);
                                resolve(_this.parent);
                            }
                        }
                        else
                            resolve(_this.parent);
                    }, reject);
                });
            };
            return Save;
        })(Action);
        Actions.Save = Save;
        var CancelSave = (function (_super) {
            __extends(CancelSave, _super);
            function CancelSave(service, definition, owner) {
                _super.call(this, service, definition, owner);
            }
            CancelSave.prototype._onExecute = function (option, parameters, selectedItems) {
                if (option === void 0) { option = -1; }
                this.service.hooks.onClose(this.parent);
                return Promise.resolve(null);
            };
            return CancelSave;
        })(Action);
        Actions.CancelSave = CancelSave;
        var CancelEdit = (function (_super) {
            __extends(CancelEdit, _super);
            function CancelEdit(service, definition, owner) {
                _super.call(this, service, definition, owner);
                this.isVisible = this.parent.isEditing;
                this.canExecute = true;
            }
            CancelEdit.prototype._onParentIsEditingChanged = function (isEditing) {
                this.isVisible = isEditing;
            };
            CancelEdit.prototype._onExecute = function (option, parameters, selectedItems) {
                if (option === void 0) { option = -1; }
                this.parent.cancelEdit();
                return Promise.resolve(null);
            };
            return CancelEdit;
        })(Action);
        Actions.CancelEdit = CancelEdit;
        var ExportToExcel = (function (_super) {
            __extends(ExportToExcel, _super);
            function ExportToExcel(service, definition, owner) {
                _super.call(this, service, definition, owner);
            }
            ExportToExcel.prototype._onExecute = function (option, parameters, selectedItems) {
                if (option === void 0) { option = -1; }
                this.service._getStream(null, "Query.ExportToExcel", this.parent, this.query, null, this._getParameters(parameters, option));
                return Promise.resolve(null);
            };
            return ExportToExcel;
        })(Action);
        Actions.ExportToExcel = ExportToExcel;
        var ShowHelp = (function (_super) {
            __extends(ShowHelp, _super);
            function ShowHelp(service, definition, owner) {
                _super.call(this, service, definition, owner);
            }
            ShowHelp.prototype._onExecute = function (option, parameters, selectedItems) {
                var _this = this;
                if (option === void 0) { option = -1; }
                var owner = this.query ? this.query.persistentObject : this.parent;
                var helpWindow = window.open();
                return this.service.executeAction("PersistentObject.ShowHelp", owner, null, null).then(function (po) {
                    if (po != null) {
                        if (po.fullTypeName == "Vidyano.RegisteredStream" || po.getAttributeValue("Type") == "0") {
                            helpWindow.close();
                            _this.service._getStream(po);
                        }
                        else {
                            helpWindow.location = po.getAttributeValue("Document");
                            helpWindow.focus();
                        }
                    }
                    else
                        helpWindow.close();
                    return null;
                }, function (e) {
                    helpWindow.close();
                    _this.owner.setNotification(e);
                });
            };
            return ShowHelp;
        })(Action);
        Actions.ShowHelp = ShowHelp;
    })(Actions = Vidyano.Actions || (Vidyano.Actions = {}));
    var ActionDefinition = (function () {
        function ActionDefinition(service, item) {
            var _this = this;
            this._options = [];
            this._name = item.getValue("Name");
            this._displayName = item.getValue("DisplayName");
            this._isPinned = item.getValue("IsPinned");
            this._selectionRule = ExpressionParser.get(item.getValue("SelectionRule"));
            this._refreshQueryOnCompleted = item.getValue("RefreshQueryOnCompleted");
            var icon = item.getFullValue("Icon");
            var options = item.getValue("Options");
            this._options = !StringEx.isNullOrWhiteSpace(options) ? options.split(";") : [];
            if (icon != null) {
                var appIcon = service.icons.get(icon.objectId);
                if (StringEx.isNullOrWhiteSpace(appIcon))
                    return;
                var iconWidth = 20, iconHeight = 20;
                var img = new Image();
                img.width = iconWidth;
                img.height = iconHeight;
                img.onload = function () {
                    var canvas = document.createElement("canvas");
                    canvas.width = iconWidth;
                    canvas.height = iconHeight;
                    var canvasContext = canvas.getContext("2d");
                    canvasContext.drawImage(img, 0, 0, iconWidth, iconHeight);
                    var imgd = canvasContext.getImageData(0, 0, iconWidth, iconHeight);
                    var pix = imgd.data;
                    for (var i = 0, n = pix.length; i < n; i += 4) {
                        pix[i] = 255 - pix[i];
                        pix[i + 1] = 255 - pix[i + 1];
                        pix[i + 2] = 255 - pix[i + 2];
                    }
                    canvasContext.putImageData(imgd, 0, 0);
                    _this._reverseIconData = canvas.toDataURL("image/png");
                };
                img.src = appIcon.asDataUri();
            }
            else
                this._reverseIconData = null;
        }
        Object.defineProperty(ActionDefinition.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "displayName", {
            get: function () {
                return this._displayName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "isPinned", {
            get: function () {
                return this._isPinned;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "refreshQueryOnCompleted", {
            get: function () {
                return this._refreshQueryOnCompleted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "offset", {
            get: function () {
                return this._offset;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "iconData", {
            get: function () {
                return this._iconData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "reverseIconData", {
            get: function () {
                return this._reverseIconData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionDefinition.prototype, "selectionRule", {
            get: function () {
                return this._selectionRule;
            },
            enumerable: true,
            configurable: true
        });
        return ActionDefinition;
    })();
    Vidyano.ActionDefinition = ActionDefinition;
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(service, po) {
            var _this = this;
            _super.call(this, service, po);
            this._userId = this.getAttributeValue("UserId");
            this._friendlyUserName = this.getAttributeValue("FriendlyUserName") || service.userName;
            this._feedbackId = this.getAttributeValue("FeedbackId");
            this._userSettingsId = this.getAttributeValue("UserSettingsId");
            this._globalSearchId = this.getAttributeValue("GlobalSearchId");
            this._analyticsKey = this.getAttributeValue("AnalyticsKey");
            var userSettings = this.getAttributeValue("UserSettings");
            this._userSettings = JSON.parse(StringEx.isNullOrEmpty(userSettings) ? (localStorage["UserSettings"] || "{}") : userSettings);
            var pus = JSON.parse(this.getAttributeValue("ProgramUnits"));
            this.programUnits = Enumerable.from(pus.units).select(function (unit) { return new ProgramUnit(_this.service, unit); }).toArray();
        }
        Object.defineProperty(Application.prototype, "friendlyUserName", {
            get: function () {
                return this._friendlyUserName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "feedbackId", {
            get: function () {
                return this._feedbackId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "userSettingsId", {
            get: function () {
                return this._userSettingsId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "globalSearchId", {
            get: function () {
                return this._globalSearchId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "analyticsKey", {
            get: function () {
                return this._analyticsKey;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "userSettings", {
            get: function () {
                return this._userSettings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "hasManagement", {
            get: function () {
                return this._hasManagement;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "session", {
            get: function () {
                return this._session;
            },
            enumerable: true,
            configurable: true
        });
        Application.prototype._updateSession = function (session) {
            var oldSession = this._session;
            if (!session) {
                if (this._session)
                    this._session = null;
            }
            else {
                if (this._session)
                    this._session.refreshFromResult(new PersistentObject(this.service, session));
                else
                    this._session = new PersistentObject(this.service, session);
            }
            if (oldSession != this._session)
                this.notifyPropertyChanged("session", this._session, oldSession);
        };
        return Application;
    })(PersistentObject);
    Vidyano.Application = Application;
    var ProgramUnitItem = (function (_super) {
        __extends(ProgramUnitItem, _super);
        function ProgramUnitItem(service, unitItem, path) {
            _super.call(this, service);
            this.path = path;
            this.id = unitItem.id;
            this.title = unitItem.title;
            this.name = unitItem.name;
        }
        return ProgramUnitItem;
    })(ServiceObject);
    Vidyano.ProgramUnitItem = ProgramUnitItem;
    var ProgramUnit = (function (_super) {
        __extends(ProgramUnit, _super);
        function ProgramUnit(service, unit) {
            var _this = this;
            _super.call(this, service, unit, unit.name);
            this._id = unit.id;
            this.offset = unit.offset;
            this.openFirst = unit.openFirst;
            if (unit.items) {
                this.items = [];
                var usedGroups = {};
                var unitItems = Enumerable.from(unit.items);
                unitItems.forEach(function (itemData) {
                    if (itemData.group) {
                        var group = usedGroups[itemData.group.id];
                        if (!group) {
                            var groupItems = unitItems.where(function (groupItemData) { return groupItemData.group && groupItemData.group.id == itemData.group.id; }).select(function (groupItemData) { return _this._createItem(groupItemData); }).toArray();
                            group = new ProgramUnitItemGroup(_this.service, itemData.group, groupItems);
                            _this.items.push(group);
                            usedGroups[itemData.group.id] = group;
                        }
                    }
                    else
                        _this.items.push(_this._createItem(itemData));
                });
            }
            if (this.openFirst && this.items.length > 0)
                this.path = this.items[0].path;
        }
        ProgramUnit.prototype._createItem = function (itemData) {
            return itemData.query ? new ProgramUnitItemQuery(this.service, itemData, this) : new ProgramUnitItemPersistentObject(this.service, itemData, this);
        };
        return ProgramUnit;
    })(ProgramUnitItem);
    Vidyano.ProgramUnit = ProgramUnit;
    var ProgramUnitItemGroup = (function (_super) {
        __extends(ProgramUnitItemGroup, _super);
        function ProgramUnitItemGroup(service, unitItem, items) {
            _super.call(this, service, unitItem);
            this.items = items;
        }
        return ProgramUnitItemGroup;
    })(ProgramUnitItem);
    Vidyano.ProgramUnitItemGroup = ProgramUnitItemGroup;
    var ProgramUnitItemQuery = (function (_super) {
        __extends(ProgramUnitItemQuery, _super);
        function ProgramUnitItemQuery(service, unitItem, parent) {
            _super.call(this, service, unitItem, parent.name + "/Query." + unitItem.query);
            this.queryId = unitItem.query;
        }
        return ProgramUnitItemQuery;
    })(ProgramUnitItem);
    Vidyano.ProgramUnitItemQuery = ProgramUnitItemQuery;
    var ProgramUnitItemPersistentObject = (function (_super) {
        __extends(ProgramUnitItemPersistentObject, _super);
        function ProgramUnitItemPersistentObject(service, unitItem, parent) {
            _super.call(this, service, unitItem, parent.name + "/PersistentObject." + unitItem.persistentObject + (unitItem.objectId ? "/" + unitItem.objectId : ""));
            this.persistentObjectId = unitItem.persistentObject;
            this.persistentObjectObjectId = unitItem.objectId;
        }
        return ProgramUnitItemPersistentObject;
    })(ProgramUnitItem);
    Vidyano.ProgramUnitItemPersistentObject = ProgramUnitItemPersistentObject;
    var NoInternetMessage = (function () {
        function NoInternetMessage(language, title, message, tryAgain) {
            this.language = language;
            this.title = title;
            this.message = message;
            this.tryAgain = tryAgain;
        }
        NoInternetMessage._getMessages = function () {
            return Enumerable.from([
                new NoInternetMessage("en", "Unable to connect to the server.", "Please check your internet connection settings and try again.", "Try again"),
                new NoInternetMessage("ar", "غير قادر على الاتصال بالخادم", "يرجى التحقق من إعدادات الاتصال بإنترنت ثم حاول مرة أخرى", "حاول مرة أخرى"),
                new NoInternetMessage("bg", "Не може да се свърже със сървъра", "Проверете настройките на интернет връзката и опитайте отново", "Опитайте отново"),
                new NoInternetMessage("ca", "No es pot connectar amb el servidor", "Si us plau aturi les seves escenes de connexió d'internet i provi una altra vegada", "Provi una altra vegada"),
                new NoInternetMessage("cs", "Nelze se připojit k serveru", "Zkontrolujte nastavení připojení k Internetu a akci opakujte", "Zkuste to znovu"),
                new NoInternetMessage("da", "Kunne ikke oprettes forbindelse til serveren", "Kontroller indstillingerne for internetforbindelsen, og prøv igen", "Prøv igen"),
                new NoInternetMessage("nl", "Kan geen verbinding maken met de server", "Controleer de instellingen van uw internet-verbinding en probeer opnieuw", "Opnieuw proberen"),
                new NoInternetMessage("et", "Ei saa ühendust serveriga", "Palun kontrollige oma Interneti-ühenduse sätteid ja proovige uuesti", "Proovi uuesti"),
                new NoInternetMessage("fa", "قادر به اتصال به سرویس دهنده", "لطفاً تنظیمات اتصال اینترنت را بررسی کرده و دوباره سعی کنید", "دوباره امتحان کن"),
                new NoInternetMessage("fi", "Yhteyttä palvelimeen", "Tarkista internet-yhteysasetukset ja yritä uudelleen", "Yritä uudestaan"),
                new NoInternetMessage("fr", "Impossible de se connecter au serveur", "S'il vous plaît vérifier vos paramètres de connexion internet et réessayez", "Réessayez"),
                new NoInternetMessage("de", "Keine Verbindung zum Server herstellen", "Überprüfen Sie die Einstellungen für die Internetverbindung und versuchen Sie es erneut", "Wiederholen"),
                new NoInternetMessage("el", "Δεν είναι δυνατή η σύνδεση με το διακομιστή", "Ελέγξτε τις ρυθμίσεις σύνδεσης στο internet και προσπαθήστε ξανά", "Δοκίμασε ξανά"),
                new NoInternetMessage("ht", "Pat kapab pou li konekte li pou sèvè a", "Souple tcheke ou paramètres kouche sou entènèt Et eseye ankò", "eseye ankò"),
                new NoInternetMessage("he", "אין אפשרות להתחבר לשרת", "נא בדוק את הגדרות החיבור לאינטרנט ונסה שוב", "נסה שוב"),
                new NoInternetMessage("hi", "सर्वर से कनेक्ट करने में असमर्थ", "कृपया अपना इंटरनेट कनेक्शन सेटिंग्स की जाँच करें और पुन: प्रयास करें", "फिर कोशिश करो"),
                new NoInternetMessage("hu", "Nem lehet kapcsolódni a szerverhez", "Kérjük, ellenőrizze az internetes kapcsolat beállításait, és próbálja újra", "próbáld újra"),
                new NoInternetMessage("id", "Tidak dapat terhubung ke server", "Silakan periksa setelan sambungan internet Anda dan coba lagi", "Coba lagi"),
                new NoInternetMessage("it", "Impossibile connettersi al server", "Si prega di controllare le impostazioni della connessione internet e riprovare", "Riprova"),
                new NoInternetMessage("ja", "サーバーに接続できません。", "インターネット接続設定を確認して、やり直してください。", "もう一度やり直してください"),
                new NoInternetMessage("ko", "서버에 연결할 수 없습니다.", "인터넷 연결 설정을 확인 하 고 다시 시도 하십시오", "다시 시도"),
                new NoInternetMessage("lv", "Nevar izveidot savienojumu ar serveri", "Lūdzu, pārbaudiet interneta savienojuma iestatījumus un mēģiniet vēlreiz", "mēģini vēlreiz"),
                new NoInternetMessage("lt", "Nepavyko prisijungti prie serverio", "Patikrinkite interneto ryšio parametrus ir bandykite dar kartą", "pabandyk dar kartą"),
                new NoInternetMessage("no", "Kan ikke koble til serveren", "Kontroller innstillingene for Internett-tilkoblingen og prøv igjen", "prøv igjen"),
                new NoInternetMessage("pl", "Nie można połączyć się z serwerem", "Proszę sprawdzić ustawienia połączenia internetowego i spróbuj ponownie", "Próbuj ponownie"),
                new NoInternetMessage("pt", "Incapaz de conectar ao servidor", "Por favor, verifique as suas configurações de ligação à internet e tente novamente", "Tentar novamente"),
                new NoInternetMessage("ro", "Imposibil de conectat la server", "Vă rugăm să verificaţi setările de conexiune la internet şi încercaţi din nou", "încearcă din nou"),
                new NoInternetMessage("ru", "Не удается подключиться к серверу", "Пожалуйста, проверьте параметры подключения к Интернету и повторите попытку", "Повторить"),
                new NoInternetMessage("sk", "Nedá sa pripojiť k serveru", "Skontrolujte nastavenie internetového pripojenia a skúste to znova", "skús znova"),
                new NoInternetMessage("sl", "Ne morem se povezati s strežnikom", "Preverite nastavitve internetne povezave in poskusite znova", "poskusi znova"),
                new NoInternetMessage("es", "No se puede conectar al servidor", "Por favor, compruebe la configuración de conexión a internet e inténtelo de nuevo", "Vuelve a intentarlo"),
                new NoInternetMessage("sv", "Det gick inte att ansluta till servern", "Kontrollera inställningarna för Internetanslutningen och försök igen", "Försök igen"),
                new NoInternetMessage("th", "สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "กรุณาตรวจสอบการตั้งค่าการเชื่อมต่ออินเทอร์เน็ตของคุณ และลองอีกครั้ง", "ลองอีกครั้ง"),
                new NoInternetMessage("tr", "Sunucuya bağlantı kurulamıyor", "Lütfen Internet bağlantı ayarlarınızı denetleyin ve yeniden deneyin", "Yeniden Deneyin"),
                new NoInternetMessage("uk", "Не вдалося підключитися до сервера", "Перевірте параметри підключення до Інтернету та повторіть спробу", "Спробуй ще раз"),
                new NoInternetMessage("vi", "Không thể kết nối đến máy chủ", "Hãy kiểm tra cài đặt kết nối internet của bạn và thử lại", "Thử lại")
            ]).toDictionary(function (m) { return m.language; }, function (m) { return m; });
        };
        NoInternetMessage.messages = NoInternetMessage._getMessages();
        return NoInternetMessage;
    })();
    Vidyano.NoInternetMessage = NoInternetMessage;
})(Vidyano || (Vidyano = {}));
