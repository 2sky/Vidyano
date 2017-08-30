interface Event {
    composed: boolean;
    composedPath(): Node[];
}

interface CustomEventInit {
    composed?: boolean;
}

namespace Vidyano.WebComponents {
    "use strict";

    const verboseLogElements = [];
    const verboseLogFunctions = [];
    const verboseSkipLogFunctions = [];

    export module Keyboard {
        export enum KeyCodes {
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
            nine = 57
        };

        export let KeyIdentifiers = {
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

        export interface IEvent extends KeyboardEvent {
            keyIdentifier: string;
        }

        export interface IKeysEvent extends CustomEvent {
            detail: {
                combo: string;
                key: string;
                shiftKey?: boolean;
                ctrlKey?: boolean;
                altKey?: boolean;
                metaKey?: boolean;
                event: string;
                keyboardEvent: IEvent;
            };
        }

        export interface IKeybindingRegistration {
            keys: string[];
            element: HTMLElement;
            listener: (e: IKeysEvent) => void;
            nonExclusive: boolean;
            priority?: number;
            scope?: Vidyano.WebComponents.AppRoute | Vidyano.WebComponents.Dialog;
        }
    }

    export interface IPosition {
        x: number;
        y: number;
    }

    export interface ISize {
        width: number;
        height: number;
    }

    ////////////////////////////////////////////////////
    // Get browser scrollbar width and height
    ////////////////////////////////////////////////////

    export let scrollbarWidth = function (): number {
        let width = <number>scrollbarWidth["cached"];
        if (width)
            return width;

        const inner = document.createElement("p");
        inner.style.width = "100%";
        inner.style.height = "100px";

        const outer = document.createElement("div");
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "50px";
        outer.style.height = "50px";
        outer.appendChild(inner);

        document.body.appendChild(outer);
        outer.style.overflow = "hidden";

        const w1 = inner.offsetWidth;
        outer.style.overflow = "scroll";

        let w2 = inner.offsetWidth;
        if (w1 === w2) w2 = outer.clientWidth;

        width = scrollbarWidth["cached"] = (w1 - w2);

        document.body.removeChild(outer);

        return width;
    };

    export interface IWebComponentKeybindingInfo {
        [keys: string]: {
            listener: string;

            /*
             * if nonExclusive is set to true then the observer will also be called when there are other observers bound to any of the same keys.
             */
            nonExclusive?: boolean;

            priority?: number;
        } | string;
    }

    export interface IWebComponentRegistrationInfo {
        properties?: PolymerProperties;
        hostAttributes?: { [name: string]: any };
        listeners?: { [eventName: string]: string };
        observers?: string[];
        extends?: string;
        behaviors?: any[];

        // Non-default Polymer registration info

        /*
         * Binds keys to local observer functions
         */
        keybindings?: IWebComponentKeybindingInfo;

        /*
         * forwardObservers is used to forward Vidyano.Common.Observable notifications to Polymer notifyPath
         */
        forwardObservers?: string[];

        /*
         * If true, the component will add isDesktop, isTablet, isPhone properties with reflectToAttribute
         */
        mediaQueryAttributes?: boolean;
    }

    export interface IObserveChainDisposer {
        (): void;
    }

    export interface IConfigurable {
        /**
         * Will be called when the context menu is openend on the element.
         */
        _viConfigure(actions: IConfigurableAction[]);
    }

    export interface IConfigurableAction {
        icon: string;
        label: string;
        action: () => void;

        subActions?: IConfigurableAction[];
    }

    export abstract class WebComponent extends Polymer.GestureEventListeners(Polymer.Element) {
        readonly service: Vidyano.Service;
        readonly translations: { [key: string]: string; };
        className: string;
        classList: DOMTokenList;
        tagName: string;
        style: CSSStyleDeclaration;
        isConnected: boolean;
        app: Vidyano.WebComponents.App;

        connectedCallback() {
            if (this["_updateListeners"])
                this["_updateListeners"](true);

            super.connectedCallback();
            this.notifyPath("isConnected", true);
        }

        disconnectedCallback() {
            if (this["_updateListeners"])
                this["_updateListeners"]();

            super.disconnectedCallback();
            this.notifyPath("isConnected", false);
        }

        protected getComputedStyleValue(propertyName: string): string {
            if (typeof ShadyCSS !== "undefined")
                return ShadyCSS.getComputedStyleValue(this, propertyName);
            else
                return getComputedStyle(this).getPropertyValue(propertyName);
        }

        computePath(relativePath: string): string {
            return Vidyano.Path.routes.rootPath + relativePath;
        }

        empty(parent: Node = this, condition?: (e: Node) => boolean) {
            let children = Array.from(parent.childNodes);
            if (condition)
                children = children.filter(c => condition(c));

            children.forEach(c => parent.removeChild(c));
        }

        findParent<T extends HTMLElement>(condition: (element: Node) => boolean = e => !!e, parent: Node = this.parentElement || this.parentNode.nodeType !== 11 ? this.parentNode : (<any>this.parentNode).host): T {
            let element = parent;
            while (!!element && !condition(element))
                element = element.parentNode ? element.parentNode.nodeType !== 11 ? element.parentNode : (<any>element).host : null;

            return <T><any>element;
        }

        translateMessage(key: string, ...params: string[]): string {
            if (!this.app || !this.app.service)
                return key;

            return this.app.service.getTranslatedMessage.apply(this.app.service, [key].concat(params));
        }

        /**
         * Dynamically imports an HTML document.
         */
        importHref(href: string): Promise<any> {
            const _importHref: (href: string, onLoad?: (e: CustomEvent) => void, onFail?: (e: CustomEvent) => void) => void = Polymer.importHref;
            return new Promise((resolve, reject) => {
                _importHref.call(this, href, e => resolve(e.target["import"]), err => {
                    console.error(err);
                    reject(err);
                });
            });
        }

        protected _escapeHTML(val: string): string {
            const span = document.createElement("span");
            span.innerText = val;

            return span.innerHTML;
        }

        protected _forwardObservable(source: Vidyano.Common.Observable<any> | Array<any>, path: string, pathPrefix: string, callback?: (path: string) => void): IObserveChainDisposer {
            const paths = splitWithTail(path, ".", 2);
            const pathToNotify = pathPrefix ? pathPrefix + "." + paths[0] : paths[0];
            const disposers: IObserveChainDisposer[] = [];
            let subDispose = null;

            if (Array.isArray(source) && paths[0] === "*") {
                (<any>source).forEach((item, idx) => {
                    disposers.push(this._forwardObservable(item, paths[1], pathPrefix + "." + idx, callback));
                });
            }
            else if ((<Vidyano.Common.Observable<any>>source).propertyChanged) {
                const dispose = (<Vidyano.Common.Observable<any>>source).propertyChanged.attach((sender, detail) => {
                    if (detail.propertyName === paths[0]) {
                        if (subDispose) {
                            subDispose();
                            disposers.remove(subDispose);
                        }

                        const newValue = detail.newValue;
                        if (newValue && paths.length === 2) {
                            subDispose = this._forwardObservable(newValue, paths[1], pathToNotify, callback);
                            disposers.push(subDispose);
                        }

                        this.notifyPath(pathToNotify, newValue);
                        if (callback)
                            callback(pathToNotify);
                    }
                });
                disposers.push(dispose);

                if (paths.length === 2) {
                    const subSource = source[paths[0]];
                    if (subSource) {
                        subDispose = this._forwardObservable(subSource, paths[1], pathToNotify, callback);
                        disposers.push(subDispose);
                    }
                } else if (paths.length === 1 && source[paths[0]] !== undefined && this.get(`${pathPrefix}.${paths[0]}`) !== source[paths[0]])
                    this.notifyPath(`${pathPrefix}.${paths[0]}`, source[paths[0]]);
            }
            else if (paths.length === 2) {
                const subSource = source[paths[0]];
                if (subSource) {
                    subDispose = this._forwardObservable(subSource, paths[1], pathToNotify, callback);
                    disposers.push(subDispose);
                }
            }

            return () => {
                disposers.forEach(d => d());
                disposers.splice(0, disposers.length);
            };
        }

        // This function simply returns the value. This can be used to reflect a property on an observable object as an attribute.
        private _forwardComputed(value: any): any {
            return value;
        }

        // This function simply returns the negated value. This can be used to reflect a property on an observable object as an attribute.
        private _forwardNegate(value: boolean): boolean {
            return !value;
        }

        static getName(fnc: Function): string {
            const results = /function (.+?)\(/.exec(fnc.toString());
            return results && results[1] || "";
        }

        private static _register(obj: Function, info: IWebComponentRegistrationInfo = {}, prefix: string = "vi", ns?: any) {
            const name = obj.name;
            const elementName = prefix + name.replace(/([A-Z])/g, m => "-" + m[0].toLowerCase());

            obj["is"] = elementName;

            info.properties = info.properties || {};
            obj["properties"] = info.properties;

            info.properties.isConnected = Boolean;

            info.properties.app = {
                type: Object,
                value: elementName !== "vi-app" ? () => window["app"] : function () { return this; }
            };

            if (!info.properties.service) {
                info.properties.service = {
                    type: Object,
                    computed: "_forwardComputed(app.service)"
                };
            }

            info.properties.translations = {
                type: Object,
                computed: "_forwardComputed(service.language.messages)"
            };

            for (const propName in info.properties) {
                const prop = <PolymerProperty>info.properties[propName];

                if (prop.computed && !/\)$/.test(prop.computed)) {
                    if (prop.computed[0] !== "!")
                        prop.computed = "_forwardComputed(" + prop.computed + ")";
                    else
                        prop.computed = "_forwardNegate(" + prop.computed.substring(1) + ")";
                }
            }

            info.observers = info.observers || [];
            obj["observers"] = info.observers;

            if (info.listeners) {
                obj.prototype["_updateListeners"] = function (isConnected: boolean) {
                    if (isConnected) {
                        for (const l in info.listeners) {
                            if (this[info.listeners[l]])
                                this._addEventListenerToNode(this, l, this[info.listeners[l]].bound = this[info.listeners[l]].bind(this));
                            else
                                console.warn(`listener method '${info.listeners[l]}' not defined`);
                        }
                    }
                    else {
                        for (const l in info.listeners) {
                            if (!this[info.listeners[l]])
                                continue;

                            this._removeEventListenerFromNode(this, l, this[info.listeners[l]].bound);
                            this[info.listeners[l]].bound = undefined;
                        }
                    }
                }
            }

            info.forwardObservers = info.forwardObservers || [];
            info.forwardObservers.push("service.language");

            Enumerable.from(info.forwardObservers).groupBy(path => {
                const functionIndex = path.indexOf("(");
                return (functionIndex > 0 ? path.substr(functionIndex + 1) : path).split(".", 2)[0];
            }, path => path).forEach(source => {
                const methodName = "_observablePropertyObserver_" + source.key();
                info.observers.push(methodName + "(" + source.key() + ", isConnected)");

                const properties = source.toArray();
                obj.prototype[methodName] = function (sourceObj: any, isConnected: boolean) {
                    if (sourceObj == null)
                        return;

                    const forwardObserversCollectionName = `_forwardObservers_${source.key()}`;
                    const forwardObservers = this[forwardObserversCollectionName] || (this[forwardObserversCollectionName] = []) || [];

                    while (forwardObservers.length > 0)
                        forwardObservers.pop()();

                    if (!isConnected)
                        return;

                    properties.forEach(p => {
                        const functionIndex = p.indexOf("(");
                        const path = functionIndex > 0 ? p.substr(functionIndex + source.key().length + 2, p.length - (functionIndex + source.key().length + 2) - 1) : p.substr(source.key().length + 1);

                        let observer = functionIndex > 0 ? this[p.substr(0, functionIndex)] : null;
                        if (observer)
                            observer = observer.bind(this);

                        forwardObservers.push(this._forwardObservable(sourceObj, path, source.key(), observer));
                        if (observer && sourceObj && isConnected) {
                            const valuePath = path.slice().split(".").reverse();
                            let value = sourceObj;

                            do {
                                value = value[valuePath.pop()];
                            }
                            while (value != null && valuePath.length > 0);

                            observer(value);
                        }
                    });
                };
            });

            //if (info.keybindings) {
            //    (info.observers = info.observers || []).push("_keybindingsObserver(isConnected)");

            //    wcPrototype["_keybindingsObserver"] = function (isConnected: boolean) {
            //        if (isConnected) {
            //            if (!this._keybindingRegistrations)
            //                this._keybindingRegistrations = [];

            //            const registerKeybinding = (keys: string) => {
            //                let keybinding = this.keybindings[keys];
            //                if (typeof keybinding === "string")
            //                    keybinding = { listener: keybinding };

            //                const listener = this[keybinding.listener];
            //                if (!listener) {
            //                    console.warn("Keybindings listener '" + keybinding.listener + "' not found on element " + this.is);
            //                    return;
            //                }

            //                const eventListener = (e: Keyboard.IKeysEvent) => {
            //                    let combo = e.detail.combo;
            //                    if (e.detail.keyboardEvent.ctrlKey && combo.indexOf("ctrl") < 0)
            //                        combo = "ctrl+" + combo;
            //                    if (e.detail.keyboardEvent.shiftKey && combo.indexOf("shift") < 0)
            //                        combo = "shift+" + combo;
            //                    if (e.detail.keyboardEvent.altKey && combo.indexOf("alt") < 0)
            //                        combo = "alt+" + combo;

            //                    const registrations = Enumerable.from(this._keybindingRegistrations).firstOrDefault(r => r.keys.some(k => k === combo));
            //                    if (!registrations)
            //                        return;

            //                    if (listener.call(this, e.detail.keyboardEvent) === true)
            //                        return;

            //                    e.stopPropagation();
            //                    e.detail.keyboardEvent.stopPropagation();
            //                    e.detail.keyboardEvent.preventDefault();
            //                };

            //                const element = <any>document.createElement("iron-a11y-keys");
            //                element.keys = keys;
            //                element.addEventListener("keys-pressed", eventListener);

            //                const registration: Keyboard.IKeybindingRegistration = {
            //                    keys: keys.split(" "),
            //                    element: element,
            //                    listener: eventListener,
            //                    priority: keybinding.priority || 0,
            //                    nonExclusive: keybinding.nonExclusive
            //                };

            //                this._keybindingRegistrations.push(registration);
            //                Polymer.dom(this.root).appendChild(element);

            //                this.app._registerKeybindings(registration);
            //            };

            //            for (const keys in this.keybindings) {
            //                registerKeybinding(keys);
            //            }
            //        }
            //        else {
            //            if (this._keybindingRegistrations) {
            //                while (this._keybindingRegistrations.length > 0) {
            //                    const reg = this._keybindingRegistrations.splice(0, 1)[0];

            //                    this.app._unregisterKeybindings(reg);

            //                    reg.element.removeEventListener("keys-pressed", reg.listener);
            //                    Polymer.dom(this.root).removeChild(reg.element);
            //                }
            //            }
            //        }
            //    };
            //}

            //if (info.mediaQueryAttributes) {
            //    info.properties.isDesktop = {
            //        type: Boolean,
            //        reflectToAttribute: true,
            //        readOnly: true
            //    };

            //    info.properties.isTablet = {
            //        type: Boolean,
            //        reflectToAttribute: true,
            //        readOnly: true
            //    };

            //    info.properties.isPhone = {
            //        type: Boolean,
            //        reflectToAttribute: true,
            //        readOnly: true
            //    };

            //    info.observers.push("_mediaQueryObserver(app)");

            //    wcPrototype["_mediaQueryObserver"] = function (app: Vidyano.WebComponents.App) {
            //        if (this._mediaQueryObserverInfo) {
            //            this._mediaQueryObserverInfo.app.removeEventListener("media-query-changed", this._mediaQueryObserverInfo.listener);
            //            this._mediaQueryObserverInfo = null;
            //        }

            //        if (app) {
            //            this._mediaQueryObserverInfo = {
            //                app: app,
            //                listener: (e: Event) => {
            //                    this["_setIsDesktop"](e["detail"] === "desktop");
            //                    this["_setIsTablet"](e["detail"] === "tablet");
            //                    this["_setIsPhone"](e["detail"] === "phone");
            //                }
            //            };

            //            this["_setIsDesktop"](app["isDesktop"]);
            //            this["_setIsTablet"](app["isTablet"]);
            //            this["_setIsPhone"](app["isPhone"]);

            //            app.addEventListener("media-query-changed", this._mediaQueryObserverInfo.listener);
            //        }
            //    };
            //}

            //const extendFunction = (proto: any, p: string, elementName: string): Function => {
            //    if (verboseSkipLogFunctions.indexOf(p) === -1 && (verboseLogElements.indexOf(elementName) > -1 || verboseLogFunctions.indexOf(p) > -1)) {
            //        return function () {
            //            if (!this._uniqueId)
            //                this._uniqueId = Unique.get();

            //            console.group(p + (p === "attributeChanged" ? ": " + arguments[0] : "") + " (" + elementName + "#" + this._uniqueId + ")");
            //            const result = proto[p].apply(this, arguments);
            //            console.groupEnd();
            //            return result;
            //        };
            //    }
            //    else
            //        return proto[p];
            //};

            //for (const p in obj.prototype) {
            //    const getter = obj.prototype.__lookupGetter__(p);
            //    const setter = obj.prototype.__lookupSetter__(p);
            //    if (getter || setter) {
            //        Object.defineProperty(wcPrototype, p, {
            //            get: getter || Polymer.nop,
            //            set: setter || Polymer.nop,
            //            enumerable: true,
            //            configurable: true
            //        });
            //    }
            //    else if (p !== "constructor" && typeof obj.prototype[p] === "function") {
            //        if (p.startsWith("_set") && p.length > 4) {
            //            const property = p.substr(4, 1).toLowerCase() + p.slice(5);
            //            if (info.properties[property] && (<any>info.properties[property]).readOnly)
            //                continue;
            //        }

            //        wcPrototype[p] = extendFunction(obj.prototype, p, elementName);
            //    }
            //}


            //const wc = Polymer(wcPrototype);
            //for (const method in obj) {
            //    if (obj.hasOwnProperty(method) && method !== "getName" && method !== "registerOverride" && method !== "_finalizeRegistration" && method !== "publish")
            //        wc[method] = obj[method];
            //}

            //if (ns)
            //    ns[name] = wc;

            //return wc;

            window.customElements.define(elementName, obj);
            return obj;
        }

        static register(arg1?: IWebComponentRegistrationInfo | Function, arg2?: string | IWebComponentRegistrationInfo, arg3?: string): (obj: any) => void {
            if (!arg1 || typeof arg1 === "object") {
                return (obj: Function) => {
                    return WebComponent._register(obj, <IWebComponentRegistrationInfo>arg1, <string>arg2);
                };
            }
            else if (typeof arg1 === "function")
                return WebComponent._register.apply(this, arguments);
        }
    }
}