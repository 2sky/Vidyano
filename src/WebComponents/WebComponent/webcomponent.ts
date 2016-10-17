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

        export var KeyIdentifiers = {
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

    export var scrollbarWidth = function (): number {
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
    }

    export interface IObserveChainDisposer {
        (): void;
    }

    export class PolymerBase extends HTMLElement {
        /**
         * $ contains all names of elements in the shady DOM with an id attribute.
         */
        $: { [id: string]: HTMLElement };

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

        /*
         * Fire an event.
         * @method fire
         * @returns {Object} event
         * @param {string} type An event name.
         * @param {any} detail
         * @param {Node} onNode Target node.
         */
        fire: (type: string, detail: any, options?: { onNode?: Node; bubbles?: boolean; cancelable?: boolean; }) => CustomEvent;

        /**
         * Call debounce to collapse multiple requests for a named task into one invocation, which is made after the wait time has elapsed with no new request. If no wait time is given, the callback is called at microtask timing (guaranteed to be before paint).
         */
        debounce: (jobName: string, callback: Function, wait?: number) => void;

        /**
         * Cancels an active debouncer without calling the callback.
         */
        cancelDebouncer: (jobName: string) => void;

        /**
         * Calls the debounced callback immediately and cancels the debouncer.
         */
        flushDebouncer: (jobName: string) => void;

        /**
         * Returns true if the named debounce task is waiting to run.
         */
        isDebouncerActive: (jobName: string) => void;

        /*
         * Adds new elements to the end of an array, returns the new length and notifies Polymer that the array has changed.
         */
        push: (path: string, ...items: any[]) => number;

        /*
         * Removes the last element of an array, returns that element and notifies Polymer that the array has changed.
         */
        pop: (path: string) => any;

        /*
         * Adds new elements to the beginning of an array, returns the new length and notifies Polymer that the array has changed.
         */
        unshift: (path: string, items: any[]) => number;

        /*
         * Removes the first element of an array, returns that element and notifies Polymer that the array has changed.
         */
        shift: (path: string) => any;

        /*
         * Adds/Removes elements from an array and notifies Polymer that the array has changed.
         */
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

        /**
         * Gets a path's value.
         */
        get: (path: string, root?: WebComponent) => any;

        /**
         * Sets a path's value and notifies Polymer for a change for that path.
         */
        set: (path: string, value: any, root?: WebComponent) => void;

        /**
         * Notifies Polymer for a change in the given path.
         */
        notifyPath: (path: string, value: any, fromAbove?: boolean) => void;

        /**
         *  Applies a CSS transform to the specified node, or host element if no node is specified.
         */
        transform: (transform: string, node?: Node | WebComponent) => void;

        /**
         * Transforms the specified node, or host element if no node is specified.
         */
        translate3d: (x: string, y: string, z: string, node?: Node | WebComponent) => void;

        /**
         * Toggles the named boolean class on the host element, adding the class if bool is truthy and removing it if bool is falsey.
         * If node is specified, sets the class on node instead of the host element.
         */
        toggleClass: (name: string, bool: boolean, node?: Node | WebComponent) => void;

        /*
         * Toggles the named boolean attribute on the host element, adding the attribute if bool is truthy and removing it if bool is falsey.
         * If node is specified, sets the attribute on node instead of the host element.
         */
        toggleAttribute: (name: string, bool: boolean, node?: Node | WebComponent) => void;

        /**
         * Key-value pairs for the custom styles on the element.
         */
        customStyle: { [key: string]: string };

        /**
         * Returns the computed style value for the given property.
         */
        getComputedStyleValue: (property: string) => string;

        /**
         * Revaluates custom property values.
         */
        updateStyles: () => void;

        /**
         * Force immediate content distribution.
         */
        distributeContent: () => void;

        /**
         * Returns a list of effective child nodes for this element.
         */
        getEffectiveChildNodes: () => Node[];

        /**
         * Returns a list of effective child elements for this element.
         */
        getEffectiveChildren: () => HTMLElement[];

        /**
         * Returns the first effective child that matches selector.
         */
        queryEffectiveChildren: (selector: string) => HTMLElement;

        /**
         * Returns a list of effective children that match selector.
         */
        queryAllEffectiveChildren: (selector: string) => HTMLElement[];
    }

    // HACK: This fixes the default __extends for extending from HTMLElement
    /* tslint:disable:no-eval */
    eval("PolymerBase = (function (_super) { function PolymerBase() { } return PolymerBase; })(HTMLElement); WebComponents.PolymerBase = PolymerBase;");
    /* tslint:enable:no-eval */

    export interface IConfigurable extends PolymerBase {
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

    export abstract class WebComponent extends PolymerBase {
        private _appRequested: boolean;
        private _app: Vidyano.WebComponents.App;
        private _appInitializedListener: EventListener;

        className: string;
        classList: DOMTokenList;
        tagName: string;
        style: CSSStyleDeclaration;
        isAttached: boolean;
        app: Vidyano.WebComponents.App;
        translations: any;

        private _setTranslations: (translations: any) => void;

        protected attached() {
            if (!this.app)
                return;

            this.app.initialize.then(() => this._setTranslations(!!this.app.service && !!this.app.service.language ? this.app.service.language.messages : []));
        }

        protected detached() {
            if (this._appInitializedListener) {
                this.app.removeEventListener("initialized", this._appInitializedListener);
                this._appInitializedListener = null;
            }
        }

        computePath(relativePath: string): string {
            return Vidyano.Path.routes.rootPath + relativePath;
        }

        empty(parent: Node = this, condition?: (e: Node) => boolean) {
            Polymer.dom(parent).getEffectiveChildNodes().forEach(c => {
                if (!condition || condition(c))
                    Polymer.dom(parent).removeChild(c);
            });
        }

        findParent<T>(condition: (element: Node) => boolean, parent: Node = this): T {
            let element = parent;
            while (!!element && !condition(element))
                element = element.parentNode || (<any>element).host;

            return <T><any>element;
        }

        translateMessage(key: string, ...params: string[]): string {
            if (!this.app || !this.app.service)
                return key;

            return this.app.service.getTranslatedMessage.apply(this.app.service, [key].concat(params));
        }

        protected _getFocusableElement(source: Node = this): HTMLElement {
            // Copyright (c) 2014 The Polymer Authors. All rights reserved.
            // https://github.com/PolymerElements/iron-overlay-behavior/blob/2aea7b4945e0b10ce77e1a15ba0ef5a02cdc7984/iron-overlay-behavior.html

            // Elements that can be focused even if they have [disabled] attribute.
            const FOCUSABLE_WITH_DISABLED = ["a[href]", "area[href]", "iframe", "[tabindex]", "[contentEditable=true]"];
            // Elements that cannot be focused if they have [disabled] attribute.
            const FOCUSABLE_WITHOUT_DISABLED = ["input", "select", "textarea", "button"];

            // Discard elements with tabindex=-1 (makes them not focusable).
            const selector = FOCUSABLE_WITH_DISABLED.join(":not([tabindex='-1']),") +
                ":not([tabindex='-1'])," +
                FOCUSABLE_WITHOUT_DISABLED.join(":not([disabled]):not([tabindex='-1']),") +
                ":not([disabled]):not([tabindex='-1'])";

            return <HTMLElement>Polymer.dom(source).querySelector(selector);
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

        private _computeApp(isAttached: boolean): Vidyano.WebComponents.App {
            if (!isAttached)
                return this._app;

            if (this instanceof Vidyano.WebComponents.App)
                return this._app = <Vidyano.WebComponents.App><any>this;

            const component = <Vidyano.WebComponents.WebComponent>this.findParent(e => !!e && (<any>e)._app instanceof Vidyano.WebComponents.App || e instanceof Vidyano.WebComponents.App);
            if (!!component)
                return this._app = component instanceof Vidyano.WebComponents.App ? component : component._app;

            return this._app = null;
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
            const name = WebComponent.getName(obj);
            const elementName = prefix + name.replace(/([A-Z])/g, m => "-" + m[0].toLowerCase());

            const wcPrototype = <any>info;
            (<any>wcPrototype).is = elementName;

            if (obj.length > 0)
                wcPrototype.factoryImpl = obj;
            else
                wcPrototype.created = obj;

            info.properties = wcPrototype.properties || {};

            for (const prop in info.properties) {
                if (info.properties[prop]["computed"] && !/\)$/.test(wcPrototype.properties[prop].computed)) {
                    if (wcPrototype.properties[prop].computed[0] !== "!")
                        info.properties[prop]["computed"] = "_forwardComputed(" + wcPrototype.properties[prop].computed + ")";
                    else
                        info.properties[prop]["computed"] = "_forwardNegate(" + wcPrototype.properties[prop].computed.substring(1) + ")";
                }
            }

            info.properties["isAttached"] = Boolean;
            info.properties["app"] = {
                type: Object,
                computed: "_computeApp(isAttached)"
            };
            info.properties["translations"] = {
                type: Object,
                readOnly: true
            };

            if (info.forwardObservers) {
                info.observers = info.observers || [];

                Enumerable.from(info.forwardObservers).groupBy(path => {
                    const functionIndex = path.indexOf("(");
                    return (functionIndex > 0 ? path.substr(functionIndex + 1) : path).split(".", 2)[0];
                }, path => path).forEach(source => {
                    const methodName = "_observablePropertyObserver_" + source.key();
                    info.observers.push(methodName + "(" + source.key() + ", isAttached)");

                    const properties = source.toArray();
                    wcPrototype[methodName] = function (sourceObj: any, attached: boolean) {
                        if (sourceObj == null)
                            return;

                        const forwardObserversCollectionName = `_forwardObservers_${source.key()}`;
                        const forwardObservers = this[forwardObserversCollectionName] || (this[forwardObserversCollectionName] = []) || [];

                        while (forwardObservers.length > 0)
                            forwardObservers.pop()();

                        if (!attached)
                            return;

                        properties.forEach(p => {
                            const functionIndex = p.indexOf("(");
                            const path = functionIndex > 0 ? p.substr(functionIndex + source.key().length + 2, p.length - (functionIndex + source.key().length + 2) - 1) : p.substr(source.key().length + 1);

                            let observer = functionIndex > 0 ? this[p.substr(0, functionIndex)] : null;
                            if (observer)
                                observer = observer.bind(this);

                            forwardObservers.push(this._forwardObservable(sourceObj, path, source.key(), observer));
                            if (observer && sourceObj && attached) {
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
            }

            if (info.keybindings) {
                (info.observers = info.observers || []).push("_keybindingsObserver(isAttached)");

                wcPrototype["_keybindingsObserver"] = function (isAttached: boolean) {
                    if (isAttached) {
                        if (!this._keybindingRegistrations)
                            this._keybindingRegistrations = [];

                        const registerKeybinding = (keys: string) => {
                            let keybinding = this.keybindings[keys];
                            if (typeof keybinding === "string")
                                keybinding = { listener: keybinding };

                            const listener = this[keybinding.listener];
                            if (!listener) {
                                console.warn("Keybindings listener '" + keybinding.listener + "' not found on element " + this.is);
                                return;
                            }

                            const eventListener = (e: Keyboard.IKeysEvent) => {
                                let combo = e.detail.combo;
                                if (e.detail.keyboardEvent.ctrlKey && combo.indexOf("ctrl") < 0)
                                    combo = "ctrl+" + combo;
                                if (e.detail.keyboardEvent.shiftKey && combo.indexOf("shift") < 0)
                                    combo = "shift+" + combo;
                                if (e.detail.keyboardEvent.altKey && combo.indexOf("alt") < 0)
                                    combo = "alt+" + combo;

                                const registrations = Enumerable.from(this._keybindingRegistrations).firstOrDefault(r => r.keys.some(k => k === combo));
                                if (!registrations)
                                    return;

                                if (listener.call(this, e.detail.keyboardEvent) === true)
                                    return;

                                e.stopPropagation();
                                e.detail.keyboardEvent.stopPropagation();
                                e.detail.keyboardEvent.preventDefault();
                            };

                            const element = <any>document.createElement("iron-a11y-keys");
                            element.keys = keys;
                            element.addEventListener("keys-pressed", eventListener);

                            const registration: Keyboard.IKeybindingRegistration = {
                                keys: keys.split(" "),
                                element: element,
                                listener: eventListener,
                                priority: keybinding.priority || 0,
                                nonExclusive: keybinding.nonExclusive
                            };

                            this._keybindingRegistrations.push(registration);
                            Polymer.dom(this.root).appendChild(element);

                            this.app._registerKeybindings(registration);
                        };

                        for (const keys in this.keybindings) {
                            registerKeybinding(keys);
                        }
                    }
                    else {
                        if (this._keybindingRegistrations) {
                            while (this._keybindingRegistrations.length > 0) {
                                const reg = this._keybindingRegistrations.splice(0, 1)[0];

                                this.app._unregisterKeybindings(reg);

                                reg.element.removeEventListener("keys-pressed", reg.listener);
                                Polymer.dom(this.root).removeChild(reg.element);
                            }
                        }
                    }
                };
            }

            const extendFunction = (proto: any, p: string, elementName: string): Function => {
                if (verboseSkipLogFunctions.indexOf(p) === -1 && (verboseLogElements.indexOf(elementName) > -1 || verboseLogFunctions.indexOf(p) > -1)) {
                    return function () {
                        if (!this._uniqueId)
                            this._uniqueId = Unique.get();

                        console.group(p + (p === "attributeChanged" ? ": " + arguments[0] : "") + " (" + elementName + "#" + this._uniqueId + ")");
                        const result = proto[p].apply(this, arguments);
                        console.groupEnd();
                        return result;
                    };
                }
                else
                    return proto[p];
            };

            for (const p in obj.prototype) {
                const getter = obj.prototype.__lookupGetter__(p);
                const setter = obj.prototype.__lookupSetter__(p);
                if (getter || setter) {
                    Object.defineProperty(wcPrototype, p, {
                        get: getter || Polymer.nop,
                        set: setter || Polymer.nop,
                        enumerable: true,
                        configurable: true
                    });
                }
                else if (p !== "constructor" && typeof obj.prototype[p] === "function") {
                    if (p.startsWith("_set") && p.length > 4) {
                        const property = p.substr(4, 1).toLowerCase() + p.slice(5);
                        if (info.properties[property] && (<any>info.properties[property]).readOnly)
                            continue;
                    }

                    wcPrototype[p] = extendFunction(obj.prototype, p, elementName);
                }
            }


            const wc = Polymer(wcPrototype);
            for (const method in obj) {
                if (obj.hasOwnProperty(method) && method !== "getName" && method !== "registerOverride" && method !== "_finalizeRegistration" && method !== "publish")
                    wc[method] = obj[method];
            }

            if (ns)
                ns[name] = wc;

            return wc;
        }

        static register(obj: Function, info: IWebComponentRegistrationInfo, prefix?: string, ns?: any): Function;
        static register(info?: IWebComponentRegistrationInfo, prefix?: string);
        static register(info?: IWebComponentRegistrationInfo, prefix?: string): (obj: any) => void {
            if (!info || typeof info === "object") {
                return (obj: Function) => {
                    return WebComponent._register(obj, info, prefix);
                };
            }
            else if (typeof info === "function")
                return WebComponent._register.apply(this, arguments);
        }
    }
}
