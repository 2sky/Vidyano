namespace Vidyano.WebComponents {
    const verboseLogElements = [];
    const verboseLogFunctions = [];
    const verboseSkipLogFunctions = [];

    class Operations {
        areSame(value1: any, value2: any): boolean {
            return value1 === value2;
        }

        areNotSame(value1: any, value2, any): boolean {
            return value1 !== value2;
        }

        areEqual(value1: any, value2: any): boolean {
            return value1 == value2;
        }

        areNotEqual(value1: any, value2, any): boolean {
            return value1 != value2;
        }

        some(...args: any[]): boolean {
            return args.some(a => !!a && (!Array.isArray(a) || a.length > 0));
        }

        every(...args: any[]) {
            args.every(a => !!a && (!Array.isArray(a) || a.length > 0));
        }

        none(...args: any[]) {
            return args.every(a => !a && (!Array.isArray(a) || a.length === 0));
        }

        isNull(value: any): boolean {
            return value == null;
        }

        isNotNull(value: any): boolean {
            return value != null;
        }

        isEmpty(value: string): boolean {
            return !value;
        }

        isNotEmpty(value: string): boolean {
            return !!value;
        }
    }

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
        }

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
        properties?: Polymer.Properties;
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
         * If true, the component will add readonly isDesktop, isTablet, isPhone properties with reflectToAttribute
         */
        mediaQueryAttributes?: boolean;

        /*
         * If true, the component will add a readonly isAppSensitive property with reflectToAttribute. The value will be toggled by the app.
         */
        sensitive?: boolean;
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

    export abstract class WebComponent<T extends AppBase = AppBase> extends Polymer.GestureEventListeners(Polymer.Element) {
        readonly service: Vidyano.Service;
        readonly translations: { [key: string]: string; };
        protected readonly isAppSensitive: boolean;
        className: string;
        classList: DOMTokenList;
        tagName: string;
        style: CSSStyleDeclaration;
        isConnected: boolean;

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

        get app(): T {
            return <T>window["app"];
        }

        get domHost(): HTMLElement {
            const root = this["getRootNode"]();
            return (root instanceof DocumentFragment) ? (<any>root).host : root;
        }

        todo_checkEventTarget(target: EventTarget): EventTarget {
            console.assert(false, "Check event target", target);
            return target;
        }

        ensureArgumentValues(args: IArguments): boolean {
            return !Array.from(args).some(a => a === undefined);
        }

        private _ensureComputedValues(fn: string, prop: string, ...args: any[]): any {
            if (args.some(a => a === undefined))
                return this[prop];

            return (<Function>this[fn]).apply(this, args);
        }

        private _ensureObserverValues(fn: string, ...args: any[]): any {
            if (args.some(a => a === undefined))
                return;

            (<Function>this[fn]).apply(this, args);
        }

        $: { [key: string]: HTMLElement };

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

        /**
         * Dispatches a custom event with an optional detail value.
         * @param {string} type Name of event type.
         * @param {*=} detail Detail value containing event-specific payload.
         * @param {{ bubbles: (boolean|undefined), cancelable: (boolean|undefined), composed: (boolean|undefined) }=}
         *  options Object specifying options.  These may include:
         *  `bubbles` (boolean, defaults to `true`),
         *  `cancelable` (boolean, defaults to false), and
         *  `node` on which to fire the event (HTMLElement, defaults to `this`).
         * @return {!Event} The new event that was fired.
         */
        fire(type: string, detail?: any, options?: { node?: Node, bubbles?: boolean, cancelable?: boolean, composed?: boolean }): Event {
            options = options || {};
            detail = (detail === null || detail === undefined) ? {} : detail;
            let event = new CustomEvent(type, {
                detail: detail,
                bubbles: options.bubbles === undefined ? true : options.bubbles,
                cancelable: Boolean(options.cancelable),
                composed: options.composed === undefined ? true : options.composed
            });

            const node = options.node || this;
            node.dispatchEvent(event);

            return event;
        }

        protected sleep(milliseconds: number): Promise<never> {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        }

        translateMessage(key: string, ...params: string[]): string {
            if (!key || !this.app || !this.service || !this.service.language)
                return key;

            return this.service.getTranslatedMessage.apply(this.service, [key].concat(params));
        }

        importHref(href: string): Promise<HTMLLinkElement> {
            const _importHref = Polymer.importHref;
            return new Promise((resolve, reject) => {
                _importHref.call(this, href, e => resolve(), err => {
                    console.error(err);
                    reject(err);
                });
            });
        }

        protected _focusElement(element: string | HTMLElement, maxAttempts?: number, interval?: number, attempt: number = 0) {
            const input = typeof element === "string" ? <HTMLElement>this.shadowRoot.querySelector(`#${element}`) : <HTMLElement>element;
            if (input) {
                const activeElement = <HTMLElement>document.activeElement;
                input.focus();

                if (activeElement !== document.activeElement)
                    return;
            }

            if (attempt < (maxAttempts || 10))
                setTimeout(() => this._focusElement(input || element, maxAttempts, interval, attempt + 1), interval || 100);
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

        private static _addTemplateProperty(obj: Function, elementName: string) {
            const addStyleModules = (template: HTMLTemplateElement = <HTMLTemplateElement>(Polymer.DomModule.import(elementName, "template"))) => {
                if (template == null)
                    return;

                const userStyleModuleTemplate = <HTMLTemplateElement>Polymer.DomModule.import(`${elementName}-style-module`, "template");
                const userStyle = userStyleModuleTemplate != null ? userStyleModuleTemplate.content.querySelector("style") : null;

                const baseStyle = (<HTMLTemplateElement>Polymer.DomModule.import("vi-base-style-module", "template")).content.querySelector("style").cloneNode(true);
                // Add vi-base-style-module
                template.content.insertBefore(baseStyle, template.content.firstChild);

                // Add vi-flex-layout-style-module if template contains layout or flex class
                const temp = document.createElement("div");
                temp.appendChild(template.cloneNode(true));
                if (/class="[^"]*?(layout|flex)[^"]*?"/.test(temp.innerHTML)) {
                    const flexLayoutStyleModuleTemplate = <HTMLTemplateElement>Polymer.DomModule.import("vi-flex-layout-style-module", "template");
                    const flexLayoutStyle = flexLayoutStyleModuleTemplate.content.querySelector("style");
                    if (flexLayoutStyle != null)
                        baseStyle.parentNode.insertBefore(flexLayoutStyle.cloneNode(true), baseStyle.nextSibling);
                }

                if (userStyle != null)
                    template.content.appendChild(userStyle);

                return template;
            };

            Object.defineProperty(obj, "template", {
                enumerable: false,
                configurable: false,
                get: !(Vidyano.WebComponents.AppBase && obj.prototype instanceof Vidyano.WebComponents.AppBase) ? addStyleModules : () => {
                    const appTemplate = <HTMLTemplateElement>(Polymer.DomModule.import("vi-app-base", "template")).cloneNode(true);
                    const customTemplate = <HTMLTemplateElement>Polymer.DomModule.import(elementName, "template");
                    appTemplate.content.appendChild(customTemplate.content);

                    return addStyleModules(appTemplate);
                }
            });
        }

        private static _register(obj: Function, info: IWebComponentRegistrationInfo = {}, prefix: string = "vi", ns?: any) {
            const name = obj.name;
            const elementName = prefix + name.replace(/([A-Z])/g, m => "-" + m[0].toLowerCase());

            obj["is"] = elementName;

            if (!obj.hasOwnProperty("template"))
                Vidyano.WebComponents.WebComponent._addTemplateProperty(obj, elementName);

            info.properties = info.properties || {};
            obj["properties"] = info.properties;

            info.properties.isConnected = Boolean;

            for (const p in <Polymer.Properties>info.properties) {
                const prop = info.properties[p];
                if (typeof prop === "object") {
                    if (prop.computed && !/\)$/.test(prop.computed)) {
                        if (prop.computed[0] !== "!")
                            prop.computed = "_forwardComputed(" + prop.computed + ")";
                        else
                            prop.computed = "_forwardNegate(" + prop.computed.substring(1) + ")";
                    }
                }
            }

            info.properties.isConnected = Boolean;

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

            obj["observers"] = info.observers || (info.observers = []);

            info.forwardObservers = info.forwardObservers || [];
            info.forwardObservers.push("service.language");
            info.forwardObservers.push("service.language.messages");

            info.forwardObservers.groupBy(path => {
                const functionIndex = path.indexOf("(");
                return (functionIndex > 0 ? path.substr(functionIndex + 1) : path).split(".", 2)[0];
            }).forEach(source => {
                const methodName = "_observablePropertyObserver_" + source.key;
                info.observers.push(methodName + "(" + source.key + ", isConnected)");

                obj.prototype[methodName] = function (sourceObj: any, isConnected: boolean) {
                    if (sourceObj == null)
                        return;

                    const forwardObserversCollectionName = `_forwardObservers_${source.key}`;
                    const forwardObservers = this[forwardObserversCollectionName] || (this[forwardObserversCollectionName] = []) || [];

                    while (forwardObservers.length > 0)
                        forwardObservers.pop()();

                    if (!isConnected)
                        return;

                    source.value.forEach(p => {
                        const functionIndex = p.indexOf("(");
                        const path = functionIndex > 0 ? p.substr(functionIndex + source.key.length + 2, p.length - (functionIndex + source.key.length + 2) - 1) : p.substr(source.key.length + 1);

                        let observer = functionIndex > 0 ? this[p.substr(0, functionIndex)] : null;
                        if (observer)
                            observer = observer.bind(this);

                        forwardObservers.push(this._forwardObservable(sourceObj, path, source.key, observer));
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

            if (info.keybindings) {
                (info.observers = info.observers || []).push("_keybindingsObserver(isConnected)");

                obj.prototype._keybindingsObserver = function (isConnected: boolean) {
                    if (isConnected) {
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

                                const registrations = this._keybindingRegistrations.find(r => r.keys.some(k => k === combo));
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
                            // TODO
                            //this.shadowRoot.appendChild(element);

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
                                // TODO
                                //this.shadowRoot.removeChild(reg.element);
                            }
                        }
                    }
                };
            }

            if (info.mediaQueryAttributes) {
                info.properties.isDesktop = {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };

                info.properties.isTablet = {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };

                info.properties.isPhone = {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };

                info.observers.push("_mediaQueryObserver(app)");

                obj.prototype._mediaQueryObserver = function (app: Vidyano.WebComponents.App) {
                    if (this._mediaQueryObserverInfo) {
                        this._mediaQueryObserverInfo.app.removeEventListener("media-query-changed", this._mediaQueryObserverInfo.listener);
                        this._mediaQueryObserverInfo = null;
                    }

                    if (app) {
                        this._mediaQueryObserverInfo = {
                            app: app,
                            listener: (e: Event) => {
                                this["_setIsDesktop"](e["detail"] === "desktop");
                                this["_setIsTablet"](e["detail"] === "tablet");
                                this["_setIsPhone"](e["detail"] === "phone");
                            }
                        };

                        this["_setIsDesktop"](app["isDesktop"]);
                        this["_setIsTablet"](app["isTablet"]);
                        this["_setIsPhone"](app["isPhone"]);

                        app.addEventListener("media-query-changed", this._mediaQueryObserverInfo.listener);
                    }
                };
            }

            if (info.sensitive) {
                info.properties.isAppSensitive = {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                };

                info.observers.push("_appSensitiveObserver(app)");

                obj.prototype._appSensitiveObserver = function (app: Vidyano.WebComponents.App) {
                    if (this.app) {
                        this["_setIsAppSensitive"](app.sensitive);
                        const _this = this;
                        this.app.addEventListener("sensitive-changed", this["_appSensitiveListener"] = function (e) { _this["_setIsAppSensitive"](e.detail); });
                    }
                    else {
                        this.app.removeEventListener("sensitive-changed", this["_appSensitiveListener"]);
                    }
                };
            }

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
            //    if (obj.hasOwnProperty(method) && method !== "getName" && method !== "registerOverride" && method !== "_finalizeRegistration" && method !== "publish") {
            //        const descriptor = Object.getOwnPropertyDescriptor(obj, method);
            //        if (descriptor.value)
            //            wc[method] = obj[method];
            //        else
            //            Object.defineProperty(wc, method, descriptor);
            //    }
            //}

            //if (ns)
            //    ns[name] = wc;

            const fncRegex = /([^(]+)\(([^)]+)\)/;

            for (let p in info.properties) {
                if (typeof info.properties[p] === "object") {
                    const prop = <Polymer.Property>info.properties[p];
                    if (prop.computed && !prop.computed.startsWith("_forwardComputed(") && !prop.computed.startsWith("_forwardNegate(")) {
                        if (!prop.computed.startsWith("_compute") && elementName.startsWith("vi-"))
                            console.error(`Naming convention violation for computed property "${p}" on element "${elementName}"`);

                        const parts = fncRegex.exec(prop.computed);
                        prop.computed = `_ensureComputedValues("${parts[1]}", "${p}", ${parts[2]})`;
                    }
                }
            }

            for (let p in info.observers) {
                const parts = fncRegex.exec(info.observers[p]);
                info.observers[p] = `_ensureObserverValues("${parts[1]}", ${parts[2]})`;
            }

            for (let fn of Object.getOwnPropertyNames(Operations.prototype)) {
                if (fn === "constructor")
                    continue;

                obj.prototype[`op.${fn}`] = Operations.prototype[fn];
            }

            window.customElements.define(elementName, obj);

            return obj;
        }

        private static registrations: { [key: string]: IWebComponentRegistrationInfo; } = {};
        static register(info?: IWebComponentRegistrationInfo, prefix?: string, ns?: string): (obj: any) => void;
        static register(target: Function, info: IWebComponentRegistrationInfo, prefix?: string, ns?: string): (obj: any) => void;
        static register(infoOrTarget?: IWebComponentRegistrationInfo | Function, prefixOrInfo?: string | IWebComponentRegistrationInfo, prefixOrNs?: string, ns?: string): (obj: any) => void {
            if (!infoOrTarget || typeof infoOrTarget === "object") {
                return (target: Function) => {
                    const info: IWebComponentRegistrationInfo = Vidyano.WebComponents.WebComponent._clone(WebComponent.registrations[Object.getPrototypeOf(target).name] || {});

                    const targetInfo = <IWebComponentRegistrationInfo>infoOrTarget;
                    if (targetInfo) {
                        if (targetInfo.properties)
                            info.properties = info.properties ? Vidyano.extend(info.properties, targetInfo.properties) : targetInfo.properties;

                        if (targetInfo.hostAttributes)
                            info.hostAttributes = info.hostAttributes ? Vidyano.extend(info.hostAttributes, targetInfo.hostAttributes) : targetInfo.hostAttributes;

                        if (targetInfo.listeners)
                            info.listeners = info.listeners ? Vidyano.extend(info.listeners, targetInfo.listeners) : targetInfo.listeners;

                        if (targetInfo.keybindings)
                            info.keybindings = info.keybindings ? Vidyano.extend(info.keybindings, targetInfo.keybindings) : targetInfo.keybindings;

                        if (targetInfo.observers)
                            info.observers ? info.observers.push(...targetInfo.observers) : (info.observers = targetInfo.observers);

                        if (targetInfo.behaviors)
                            info.behaviors ? info.behaviors.push(...targetInfo.behaviors) : (info.behaviors = targetInfo.behaviors);

                        if (targetInfo.forwardObservers)
                            info.forwardObservers ? info.forwardObservers.push(...targetInfo.forwardObservers) : (info.forwardObservers = targetInfo.forwardObservers);

                        if (typeof targetInfo.mediaQueryAttributes !== "undefined")
                            info.mediaQueryAttributes = targetInfo.mediaQueryAttributes;

                        if (typeof targetInfo.sensitive !== "undefined")
                            info.sensitive = targetInfo.sensitive;
                    }

                    const prefix = <string>prefixOrInfo;
                    const ns = prefixOrNs;
                    const wc = WebComponent._register(target, Vidyano.WebComponents.WebComponent._clone(info), prefix, ns);

                    WebComponent.registrations[wc.name] = info;

                    return wc;
                };
            }
            else if (typeof infoOrTarget === "function")
                return WebComponent._register.apply(this, arguments);
        }

        static registerAbstract(info?: IWebComponentRegistrationInfo, prefix?: string, ns?: string): (obj: any) => void {
            return (target: Function) => {
                WebComponent.registrations[Object(target).name] = info;
            };
        }

        private static _clone(source: any, depth: number = 0): any {
            const output = Array.isArray(source) ? [] : {};
            for (let key in source) {
                if (key === "behaviors" && depth === 0) {
                    output[key] = source[key];
                    continue;
                }

                const value = source[key];
                output[key] = (value != null && typeof value === "object") ? Vidyano.WebComponents.WebComponent._clone(value, depth + 1) : value;
            }

            return output;
        }
    }
}