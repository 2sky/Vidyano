interface PolymerProperty {
    type: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor;
    computed?: string;
    reflectToAttribute?: boolean;
    readOnly?: boolean;
    observer?: string;
    value?: number | boolean | string | Function;
    notify?: boolean;
}

 interface PolymerProperties {
     [name: string]: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor | PolymerProperty; 
}

/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

interface Constructor<T> {
    new (...args: any[]): T;
}

/**
 * An interface to match all Objects, but not primitives.
 */
interface Base { }

/**
 * A subclass-factory style mixin that extends `superclass` with a new subclass
 * that implements the interface `M`.
 */
type Mixin<M> =
    <C extends Base>(superclass: Constructor<C>) => Constructor<M & C>;

/**
 * The Polymer function and namespace.
 */
declare class Polymer {

    /**
     * The "Polymer function" for backwards compatibility with Polymer 1.x.
     */
    static (definition: any): void;

    /**
     * Forces several classes of asynchronously queued tasks to flush.
     */
    static flush(): void;

    static importHref(href: string, onLoad?: (event: Event) => void, onError?: (event: Event) => void, optAsync?: boolean): HTMLLinkElement;

    /**
     * A base class for Polymer custom elements that includes the
     * `Polymer.MetaEffects`, `Polymer.BatchedEffects`, `Polymer.PropertyEffects`,
     * etc., mixins.
     */
    static Element: PolymerElementConstructor;

    static ElementMixin: Mixin<PolymerElement>;

    static PropertyEffects: Mixin<PolymerPropertyEffects>;

    static BatchedEffects: Mixin<PolymerBatchedEffects>;

    static GestureEventListeners: Mixin<PolymerGestureEventListeners>;
}

declare namespace Polymer {
    export interface FlattenedNodesObserverInfo {
        addedNodes: Node[];
        removedNodes: Node[];
        target: Element;
    }

    export class FlattenedNodesObserver {
        static getFlattenedNodes(node: Node): Node[];

        constructor(target: Node, callback: (info: FlattenedNodesObserverInfo) => void);

        connect(): void;
        disconnect(): void;
        flush();
    }

    export interface IAsyncModule {
        run(fnc: Function): number;
        cancel(handle: number): void;
    }

    export interface IAsyncTimeOutModule extends IAsyncModule {
        after(delay: number): IAsyncModule;
    }

    export class Async {
        static microTask: IAsyncModule;
        static timeOut: IAsyncTimeOutModule;
    }

    export class Debouncer {
        static debounce: (debouncer: Debouncer, asyncModule: IAsyncModule, callBack: () => void) => Debouncer;
        cancel(): void;
        flush(): void;
        isActive(): boolean;
    }

    export interface TapEventDetail {
        x: number;
        y: number;
        sourceEvent: Event;
    }

    export interface TapEvent extends CustomEvent {
        detail: TapEventDetail;
    }
}

declare interface PolymerElementConstructor {
    new (): PolymerElement;
}

declare class PolymerElement extends PolymerMetaEffects {
    static finalized: boolean;
    static finalize(): void;
    static readonly template: HTMLTemplateElement;
    $: {
        [key: string]: HTMLElement;
    };
    ready(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    updateStyles(properties: any): void;
    resolveUrl(url: string, baseURI?: string): string;
    resolveCss(cssText: string, baseURI: string): string;
    pathFromUrl(url: string): string;
    rootPath: string;
}

declare class PolymerPropertyEffects extends HTMLElement {
    ready(): void;
    linkPaths(to: string, from: string): void;
    unlinkPaths(path: string): void;
    notifySplices(path: string, splices: any[]): void;
    get(path: string | (string | number)[], root?: any): any;
    set(path: string | (string | number)[], value: any): void;
    push(path: string, ...items: any[]): any;
    pop(path: string): any;
    shift(path: string): any;
    unshift(path: string): number;
    splice(path: string, start: number, removeCount?: number, ...items: Array<any>): Array<any>;
    notifyPath(path: string, value: any): void;
}

declare class PolymerBatchedEffects extends PolymerPropertyEffects {
    // _propertiesChanged(currentProps, changedProps, oldProps): void;
    // _setPropertyToNodeFromAnnotation(node, prop, value): void;
    // _setPropertyFromNotification(path, value, event): void;
    // _setPropertyFromComputation(prop, value): void;
    // _enqueueClient(client): void;
    // _flushClients(): void;
    setProperties(props: any): void;
}

declare class PolymerMetaEffects extends PolymerBatchedEffects {
    // _clearPropagateEffects(): void;
    // _createPropertyFromInfo(name: string, info): void;
    // _setPropertyDefaults(properties): void;
}

declare interface PolymerGestureEventListeners {
    _addEventListenerToNode(node: Node, eventName: string, handler: EventListener);
    _removeEventListenerFromNode(node: Node, eventName: string, handler: EventListener);
}

declare var ShadyCSS: {
    getComputedStyleValue(element: HTMLElement, propertyName: string): string;
    nativeCss: boolean;
    nativeShadow: boolean;
}