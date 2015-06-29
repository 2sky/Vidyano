module Vidyano.WebComponents {
    var verboseLogElements = [];
    var verboseLogFunctions = [];
    var verboseSkipLogFunctions = [];

    export enum PathObserverState {
        Unopened,
        Opened,
        Closed,
        Resetting
    };

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

    ////////////////////////////////////////////////////
    // Get browser scrollbar width and height
    ////////////////////////////////////////////////////

    export var scrollbarWidth = function (): number {
        var width = <number>scrollbarWidth["cached"];
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
        if (w1 == w2) w2 = outer.clientWidth;

        width = scrollbarWidth["cached"] = (w1 - w2);

        document.body.removeChild(outer);

        return width;
    }

    export interface WebComponentRegistrationInfo {
        properties?: PolymerProperties;
        hostAttributes?: { [name: string]: any };
        listeners?: { [eventName: string]: string };
        observers?: string[];
        extends?: string;

        // NOTE: This is not default Polymer functionality, we use this to forward Vidyano.Common.Observable notifications
        forwardObservers?: string[];
    }

    export interface ObserveChainDisposer {
        (): void;
    }

    export class WebComponent {
        /**
         * $ contains all names of elements in the shady DOM with an id attribute.
         */
        $: { [id: string]: HTMLElement };

        /**
        * Returns a list of the elements within the document (using depth-first pre-order traversal of the document's nodes) that match the specified group of selectors. The object returned is a NodeList.
        */
        $$: (selectors: string) => HTMLElement | WebComponents.WebComponent;

        /**
         * Shady DOM entry point.
         */
        root: HTMLElement | WebComponent;

        /**
         * Binds the property to the specific observer.
         */
        bindProperty: (property: string, observable: Observer) => { close(): void };
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
        /**
          * Fire an event.
          * @method fire
          * @returns {Object} event
          * @param {string} type An event name.
          * @param {any} detail
          * @param {Node} onNode Target node.
          */
        fire: (type: string, detail: any, options?: { onNode?: Node; bubbles?: boolean; cancelable?: boolean; }) => CustomEvent;

        /**
         * Dynamically imports an HTML document.
         */
        importHref: (href: string, onLoad?: (e: CustomEvent) => void, onFail?: (e: CustomEvent) => void) => void;

        /**
         * Takes a URL relative to the <dom-module> of an imported Polymer element, and returns a path relative to the current document.
         * This method can be used, for example, to refer to an asset delivered alongside an HTML import.
         */
        resolveUrl: (href: string) => string;

        set: (path: string, value: any, root?: WebComponent) => void;

        notifyPath: (path: string, value: any, fromAbove?: boolean) => void;

        /**
         * Appends the node or webComponent to this component.
         */
        appendChild: { <TNode extends Node>(node: TNode): TNode; <TWebComponent>(component: TWebComponent): TWebComponent; };

        /**
         * Gets the attribute value with the specified name.
         */
        getAttribute: (name?: string) => string;
        className: string;
        classList: DOMTokenList;
        tagName: string;
        style: CSSStyleDeclaration;
        isAttached: boolean;
        app: Vidyano.WebComponents.App;
        private _setIsAttached: (val: boolean) => void;
        private _appRequested: boolean;
        protected translations: any;

        protected _setApp: (app: Vidyano.WebComponents.App) => void;

        get asElement(): HTMLElement {
            return <HTMLElement><any>this;
        }

        attached() {
            if(!this.app)
                this._setApp(<Vidyano.WebComponents.App>(this instanceof Vidyano.WebComponents.App ? this : this.findParent<Vidyano.WebComponents.App>(Vidyano.WebComponents.App)));

            if (!this.translations && this.app && this.app.service && this.app.service.language)
                this.translations = this.app.service.language.messages;

            this._setIsAttached(true);
        }

        detached() {
            this._setIsAttached(false);
        }

        attributeChanged(attribute?: string, oldValue?: any, newValue?: any) {
        }

        empty() {
            Polymer.dom(this).children.forEach(c => {
                Polymer.dom(this).removeChild(c);
            });
        }

        findParent<T>(type: any): T {
            var element = <Node>this.asElement;
            while (element != null && !(element instanceof type)) {
                element = (<any>element).host || element.parentNode;
            }

            return <T><any>element;
        }

        translateMessage(key: string, ...params: string[]): string {
            if (!this.app || !this.app.service)
                return key;

            return this.app.service.getTranslatedMessage.apply(this.app.service, [key].concat(params));
        }

        protected escapeHTML(val: string): string {
            var span = document.createElement("span");
            span.innerText = val;

            return span.innerHTML;
        }

        protected _forwardObservable(source: Vidyano.Common.Observable<any> | Array<any>, path: string, pathPrefix: string, callback?: (path: string) => void): ObserveChainDisposer {
            var paths = path.split(".", 2);
            var disposers: ObserveChainDisposer[] = [];
            var subDispose = null;
            var pathToNotify = pathPrefix ? pathPrefix + "." + paths[0] : paths[0];

            if (Array.isArray(source)) {
                (<any>source).forEach((item, idx) => {
                    disposers.push(this._forwardObservable(item, path, pathPrefix + "." + idx, callback));
                });
            }
            else {
                var dispose = (<Vidyano.Common.Observable<any>>source).propertyChanged.attach((sender, detail) => {
                    if (detail.propertyName == paths[0]) {
                        if (subDispose) {
                            subDispose();
                            disposers.remove(subDispose);
                        }

                        var newValue = detail.newValue;
                        if (newValue && paths.length == 2) {
                            subDispose = this._forwardObservable(newValue, paths[1], pathToNotify, callback);
                            disposers.push(subDispose);
                        }

                        this.notifyPath(pathToNotify, newValue);
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

            return () => {
                disposers.forEach(d => d());
                disposers.splice(0, disposers.length);
            };
        }

        // This function simply returns the value. This can be used to reflect a property on an observable object as an attribute.
        private _forwardComputed(value: any): any {
            return value;
        }

        static getName(fnc: Function): string {
            var results = /function (.+)\(/.exec(fnc.toString());
            return results && results[1] || "";
        }

        static register(obj: any, ns?: any, prefix: string = "vi", info: WebComponentRegistrationInfo = {}, finalized?: (ctor: any) => void) {
            var name = WebComponent.getName(obj);
            var elementName = prefix + name.replace(/([A-Z])/g, m => "-" + m[0].toLowerCase());

            var wcPrototype = <any>info;
            (<any>wcPrototype).is = elementName;

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

                Enumerable.from(info.forwardObservers).groupBy(path => {
                    var functionIndex = path.indexOf("(");
                    return (functionIndex > 0 ? path.substr(functionIndex + 1) : path).split(".", 2)[0];
                }, path => path).forEach(source => {
                    var methodName = "_observablePropertyObserver_" + source.key();
                    info.observers.push(methodName + "(" + source.key() + ", isAttached)");

                    var properties = source.toArray();
                    wcPrototype[methodName] = function (sourceObj: any, attached: boolean) {
                        if (!this._forwardObservers)
                            this._forwardObservers = [];

                        while (this._forwardObservers.length > 0)
                            this._forwardObservers.pop()();

                        properties.forEach(p => {
                            var functionIndex = p.indexOf("(");
                            var path = functionIndex > 0 ? p.substr(functionIndex + source.key().length + 2, p.length - (functionIndex + source.key().length + 2) - 1) : p.substr(source.key().length + 1);

                            var observer = functionIndex > 0 ? this[p.substr(0, functionIndex)] : null;
                            if (observer)
                                observer = observer.bind(this);

                            this._forwardObservers.push(this._forwardObservable(sourceObj, path, source.key(), observer));
                            if (observer && sourceObj && attached) {
                                var valuePath = path.slice().split(".").reverse();
                                var value = sourceObj;

                                do value = value[valuePath.pop()];
                                while (value && valuePath.length > 0);

                                observer(value);
                            }
                        });
                    };
                });
            }

            var extendFunction = (proto: any, p: string, elementName: string): Function => {
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
                        if (info.properties[property] && (<any>info.properties[property]).readOnly)
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
        }

        //x TODO: REMOVE
        static registerTODO(obj: any, ns?: any, prefix: string = "vi", properties: PolymerProperties = {}, computed: { [name: string]: string } = {}, finalized?: (ctor: any) => void) {
        }

        //x TODO: REMOVE
        static registerLightTODO(obj: any, ns?: any, prefix: string = "vi", publish: any = {}, computed: { [name: string]: string } = {}, finalized?: (ctor: any) => void) {
        }
    }
}