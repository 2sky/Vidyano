var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var verboseLogElements = [];
        var verboseLogFunctions = [];
        var verboseSkipLogFunctions = [];
        (function (PathObserverState) {
            PathObserverState[PathObserverState["Unopened"] = 0] = "Unopened";
            PathObserverState[PathObserverState["Opened"] = 1] = "Opened";
            PathObserverState[PathObserverState["Closed"] = 2] = "Closed";
            PathObserverState[PathObserverState["Resetting"] = 3] = "Resetting";
        })(WebComponents.PathObserverState || (WebComponents.PathObserverState = {}));
        var PathObserverState = WebComponents.PathObserverState;
        ;
        var Keyboard;
        (function (Keyboard) {
            (function (KeyCodes) {
                KeyCodes[KeyCodes["backspace"] = 8] = "backspace";
                KeyCodes[KeyCodes["tab"] = 9] = "tab";
                KeyCodes[KeyCodes["enter"] = 13] = "enter";
                KeyCodes[KeyCodes["shift"] = 16] = "shift";
                KeyCodes[KeyCodes["control"] = 17] = "control";
                KeyCodes[KeyCodes["alt"] = 18] = "alt";
                KeyCodes[KeyCodes["pause"] = 19] = "pause";
                KeyCodes[KeyCodes["break"] = 19] = "break";
                KeyCodes[KeyCodes["capslock"] = 20] = "capslock";
                KeyCodes[KeyCodes["escape"] = 27] = "escape";
                KeyCodes[KeyCodes["pageup"] = 33] = "pageup";
                KeyCodes[KeyCodes["pagedown"] = 34] = "pagedown";
                KeyCodes[KeyCodes["end"] = 35] = "end";
                KeyCodes[KeyCodes["home"] = 36] = "home";
                KeyCodes[KeyCodes["leftarrow"] = 37] = "leftarrow";
                KeyCodes[KeyCodes["uparrow"] = 38] = "uparrow";
                KeyCodes[KeyCodes["rightarrow"] = 39] = "rightarrow";
                KeyCodes[KeyCodes["downarrow"] = 40] = "downarrow";
                KeyCodes[KeyCodes["comma"] = 44] = "comma";
                KeyCodes[KeyCodes["subtract"] = 45] = "subtract";
                KeyCodes[KeyCodes["period"] = 46] = "period";
                KeyCodes[KeyCodes["zero"] = 48] = "zero";
                KeyCodes[KeyCodes["one"] = 49] = "one";
                KeyCodes[KeyCodes["two"] = 50] = "two";
                KeyCodes[KeyCodes["three"] = 51] = "three";
                KeyCodes[KeyCodes["four"] = 52] = "four";
                KeyCodes[KeyCodes["five"] = 53] = "five";
                KeyCodes[KeyCodes["six"] = 54] = "six";
                KeyCodes[KeyCodes["seven"] = 55] = "seven";
                KeyCodes[KeyCodes["eight"] = 56] = "eight";
                KeyCodes[KeyCodes["nine"] = 57] = "nine";
            })(Keyboard.KeyCodes || (Keyboard.KeyCodes = {}));
            var KeyCodes = Keyboard.KeyCodes;
            ;
            Keyboard.KeyIdentifiers = {
                "tab": "U+0009",
                "esc": "U+001B",
                "space": "U+0020",
                "*": "U+002A",
                "0": "U+0030",
                "1": "U+0031",
                "2": "U+0032",
                "3": "U+0033",
                "4": "U+0034",
                "5": "U+0035",
                "6": "U+0036",
                "7": "U+0037",
                "8": "U+0038",
                "9": "U+0039",
                "a": "U+0041",
                "b": "U+0042",
                "c": "U+0043",
                "d": "U+0044",
                "e": "U+0045",
                "f": "U+0046",
                "g": "U+0047",
                "h": "U+0048",
                "i": "U+0049",
                "j": "U+004A",
                "k": "U+004B",
                "l": "U+004C",
                "m": "U+004D",
                "n": "U+004E",
                "o": "U+004F",
                "p": "U+0050",
                "q": "U+0051",
                "r": "U+0052",
                "s": "U+0053",
                "t": "U+0054",
                "u": "U+0055",
                "v": "U+0056",
                "w": "U+0057",
                "x": "U+0058",
                "y": "U+0059",
                "z": "U+005A",
                "del": "U+007F",
            };
        })(Keyboard = WebComponents.Keyboard || (WebComponents.Keyboard = {}));
        ////////////////////////////////////////////////////
        // Get browser scrollbar width and height
        ////////////////////////////////////////////////////
        WebComponents.scrollbarWidth = function () {
            var width = WebComponents.scrollbarWidth["cached"];
            if (width)
                return width;
            var inner = document.createElement('p');
            inner.style.width = "100%";
            inner.style.height = "100px";
            var outer = document.createElement('div');
            outer.style.position = "absolute";
            outer.style.top = "0px";
            outer.style.left = "0px";
            outer.style.visibility = "hidden";
            outer.style.width = "50px";
            outer.style.height = "50px";
            outer.appendChild(inner);
            document.body.appendChild(outer);
            outer.style.overflow = "hidden";
            var w1 = inner.offsetWidth;
            outer.style.overflow = 'scroll';
            var w2 = inner.offsetWidth;
            if (w1 == w2)
                w2 = outer.clientWidth;
            width = WebComponents.scrollbarWidth["cached"] = (w1 - w2);
            document.body.removeChild(outer);
            return width;
        };
        var WebComponent = (function () {
            function WebComponent() {
            }
            Object.defineProperty(WebComponent.prototype, "asElement", {
                get: function () {
                    return this;
                },
                enumerable: true,
                configurable: true
            });
            WebComponent.prototype.attached = function () {
                if (!this.app)
                    this._setApp((this instanceof Vidyano.WebComponents.App ? this : this.findParent(Vidyano.WebComponents.App)));
                if (!this.translations && this.app && this.app.service && this.app.service.language)
                    this.translations = this.app.service.language.messages;
                this._setIsAttached(true);
            };
            WebComponent.prototype.detached = function () {
                this._setIsAttached(false);
            };
            WebComponent.prototype.attributeChanged = function (attribute, oldValue, newValue) {
            };
            WebComponent.prototype.empty = function () {
                var _this = this;
                Polymer.dom(this).children.forEach(function (c) {
                    Polymer.dom(_this).removeChild(c);
                });
            };
            WebComponent.prototype.findParent = function (type) {
                var element = this.asElement;
                while (element != null && !(element instanceof type)) {
                    element = element.host || element.parentNode;
                }
                return element;
            };
            WebComponent.prototype.translateMessage = function (key) {
                var params = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    params[_i - 1] = arguments[_i];
                }
                if (!this.app || !this.app.service)
                    return key;
                return this.app.service.getTranslatedMessage.apply(this.app.service, [key].concat(params));
            };
            WebComponent.prototype.escapeHTML = function (val) {
                var span = document.createElement("span");
                span.innerText = val;
                return span.innerHTML;
            };
            WebComponent.prototype._forwardObservable = function (source, path, pathPrefix, callback) {
                var _this = this;
                var paths = path.split(".", 2);
                var disposers = [];
                var subDispose = null;
                var pathToNotify = pathPrefix ? pathPrefix + "." + paths[0] : paths[0];
                if (Array.isArray(source)) {
                    source.forEach(function (item, idx) {
                        disposers.push(_this._forwardObservable(item, path, pathPrefix + "." + idx, callback));
                    });
                }
                else {
                    var dispose = source.propertyChanged.attach(function (sender, detail) {
                        if (detail.propertyName == paths[0]) {
                            if (subDispose) {
                                subDispose();
                                disposers.remove(subDispose);
                            }
                            var newValue = detail.newValue;
                            if (newValue && paths.length == 2) {
                                subDispose = _this._forwardObservable(newValue, paths[1], pathToNotify, callback);
                                disposers.push(subDispose);
                            }
                            _this.notifyPath(pathToNotify, newValue);
                            if (callback)
                                callback(pathToNotify);
                        }
                    });
                    disposers.push(dispose);
                    if (paths.length == 2) {
                        var subSource = source[paths[0]];
                        if (subSource) {
                            subDispose = this._forwardObservable(subSource, paths[1], pathToNotify, callback);
                            disposers.push(subDispose);
                        }
                    }
                }
                return function () {
                    disposers.forEach(function (d) { return d(); });
                    disposers.splice(0, disposers.length);
                };
            };
            // This function simply returns the value. This can be used to reflect a property on an observable object as an attribute.
            WebComponent.prototype._forwardComputed = function (value) {
                return value;
            };
            WebComponent.getName = function (fnc) {
                var results = /function (.+)\(/.exec(fnc.toString());
                return results && results[1] || "";
            };
            WebComponent.register = function (obj, ns, prefix, info, finalized) {
                if (prefix === void 0) { prefix = "vi"; }
                if (info === void 0) { info = {}; }
                var name = WebComponent.getName(obj);
                var elementName = prefix + name.replace(/([A-Z])/g, function (m) { return "-" + m[0].toLowerCase(); });
                var wcPrototype = info;
                wcPrototype.is = elementName;
                if (obj.length > 0)
                    wcPrototype.factoryImpl = obj;
                else
                    wcPrototype.created = obj;
                info.properties = wcPrototype.properties || {};
                info.properties["app"] = {
                    type: Object,
                    readOnly: true
                };
                if (!info.properties["isAttached"]) {
                    info.properties["isAttached"] = {
                        type: Boolean,
                        notify: true
                    };
                }
                info.properties["isAttached"]["readOnly"] = true;
                info.properties["translations"] = Object;
                for (var prop in info.properties) {
                    if (info.properties[prop]["computed"] && !/\)$/.test(wcPrototype.properties[prop].computed))
                        info.properties[prop]["computed"] = "_forwardComputed(" + wcPrototype.properties[prop].computed + ")";
                }
                if (info.forwardObservers) {
                    info.observers = info.observers || [];
                    Enumerable.from(info.forwardObservers).groupBy(function (path) {
                        var functionIndex = path.indexOf("(");
                        return (functionIndex > 0 ? path.substr(functionIndex + 1) : path).split(".", 2)[0];
                    }, function (path) { return path; }).forEach(function (source) {
                        var methodName = "_observablePropertyObserver_" + source.key();
                        info.observers.push(methodName + "(" + source.key() + ", isAttached)");
                        var properties = source.toArray();
                        wcPrototype[methodName] = function (sourceObj, attached) {
                            var _this = this;
                            if (sourceObj == null)
                                return;
                            if (!this._forwardObservers)
                                this._forwardObservers = [];
                            while (this._forwardObservers.length > 0)
                                this._forwardObservers.pop()();
                            properties.forEach(function (p) {
                                var functionIndex = p.indexOf("(");
                                var path = functionIndex > 0 ? p.substr(functionIndex + source.key().length + 2, p.length - (functionIndex + source.key().length + 2) - 1) : p.substr(source.key().length + 1);
                                var observer = functionIndex > 0 ? _this[p.substr(0, functionIndex)] : null;
                                if (observer)
                                    observer = observer.bind(_this);
                                _this._forwardObservers.push(_this._forwardObservable(sourceObj, path, source.key(), observer));
                                if (observer && sourceObj && attached) {
                                    var valuePath = path.slice().split(".").reverse();
                                    var value = sourceObj;
                                    do
                                        value = value[valuePath.pop()];
                                    while (value && valuePath.length > 0);
                                    observer(value);
                                }
                            });
                        };
                    });
                }
                if (info.keybindings) {
                    (info.observers = info.observers || []).push("_keybindingsObserver(isAttached)");
                    wcPrototype["_keybindingsObserver"] = function (isAttached) {
                        var _this = this;
                        if (isAttached) {
                            if (!this._keybindingRegistrations)
                                this._keybindingRegistrations = [];
                            var registerKeybinding = function (keys) {
                                var keybinding = _this.keybindings[keys];
                                if (typeof keybinding === "string")
                                    keybinding = { listener: keybinding };
                                var listener = _this[keybinding.listener];
                                if (!listener) {
                                    console.warn("Keybindings listener '" + keybinding.listener + "' not found on element " + _this.is);
                                    return;
                                }
                                var eventListener = function (e) {
                                    listener.call(_this, e.detail.keyboardEvent);
                                    e.stopPropagation();
                                    e.detail.keyboardEvent.stopPropagation();
                                    e.detail.keyboardEvent.preventDefault();
                                };
                                var element = document.createElement("iron-a11y-keys");
                                element.keys = keys;
                                element.addEventListener("keys-pressed", eventListener);
                                var registration = {
                                    keys: keys.split(" "),
                                    element: element,
                                    listener: eventListener,
                                    priority: keybinding.priority || 0,
                                    nonExclusive: keybinding.nonExclusive
                                };
                                _this._keybindingRegistrations.push(registration);
                                Polymer.dom(_this.root).appendChild(element);
                                _this.app._registerKeybindings(registration);
                            };
                            for (var keys in this.keybindings) {
                                registerKeybinding(keys);
                            }
                        }
                        else {
                            if (this._keybindingRegistrations) {
                                while (this._keybindingRegistrations.length > 0) {
                                    var reg = this._keybindingRegistrations.splice(0, 1)[0];
                                    this.app._unregisterKeybindings(reg);
                                    reg.element.removeEventListener(reg.listener);
                                    Polymer.dom(this.root).removeChild(reg.element);
                                }
                            }
                        }
                    };
                }
                var extendFunction = function (proto, p, elementName) {
                    if (verboseSkipLogFunctions.indexOf(p) == -1 && (verboseLogElements.indexOf(elementName) > -1 || verboseLogFunctions.indexOf(p) > -1)) {
                        return function () {
                            if (!this._uniqueId)
                                this._uniqueId = Unique.get();
                            console.group(p + (p == "attributeChanged" ? ": " + arguments[0] : "") + " (" + elementName + "#" + this._uniqueId + ")");
                            var result = proto[p].apply(this, arguments);
                            console.groupEnd();
                            return result;
                        };
                    }
                    else
                        return proto[p];
                };
                for (var p in obj.prototype) {
                    var getter = obj.prototype.__lookupGetter__(p);
                    var setter = obj.prototype.__lookupSetter__(p);
                    if (getter || setter) {
                        Object.defineProperty(wcPrototype, p, {
                            get: getter || Polymer.nop,
                            set: setter || Polymer.nop,
                            enumerable: true,
                            configurable: true
                        });
                    }
                    else if (p != "constructor" && typeof obj.prototype[p] == 'function') {
                        if (p.startsWith("_set") && p.length > 4) {
                            var property = p.substr(4, 1).toLowerCase() + p.slice(5);
                            if (info.properties[property] && info.properties[property].readOnly)
                                continue;
                        }
                        wcPrototype[p] = extendFunction(obj.prototype, p, elementName);
                    }
                }
                ns[name] = Polymer(wcPrototype);
                for (var method in obj) {
                    if (obj.hasOwnProperty(method) && method != "register" && method != "getName" && method != "registerOverride" && method != "_finalizeRegistration" && method != "publish")
                        ns[name][method] = obj[method];
                }
                if (typeof finalized == 'function')
                    finalized(ns[name]);
            };
            return WebComponent;
        })();
        WebComponents.WebComponent = WebComponent;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
