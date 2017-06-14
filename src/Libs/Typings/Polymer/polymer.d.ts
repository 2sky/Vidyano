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

interface PolymerDomApiClassList {
    add(className: string): void;
    remove(className: string): void;
    toggle(className: string): void;
}

interface PolymerDomApi {
    getDistributedNodes(): HTMLElement[];
    getDestinationInsertionPoints(): HTMLElement[];
    flush(): void;
    childNodes: Node[];
    children: HTMLElement[];
    classList: PolymerDomApiClassList;
    firstChild: Node;
    firstElementChild: Element;
    innerHTML: string;
    lastChild: Node;
    lastElementChild: Element;
    nextElementSibling: Element;
    nextSibling: Node;
    node: Node;
    parentNode: Node;
    previousElementSibling: Element;
    previousSibling: Node;
    textContent: string;
    insertBefore(newChild: Node | Vidyano.WebComponents.WebComponent, refChild?: Node | Vidyano.WebComponents.WebComponent): Node;
    removeAttribute(name?: string): void;
    setAttribute(name?: string, value?: string): void;
    querySelector(selectors: string): Node | HTMLElement | Vidyano.WebComponents.WebComponent;
    querySelectorAll(selectors: string): NodeList;
    appendChild(newChild: Node | Vidyano.WebComponents.WebComponent): Node | Vidyano.WebComponents.WebComponent;
    removeChild(oldChild: Node | Vidyano.WebComponents.WebComponent): Node | Vidyano.WebComponents.WebComponent;
    replaceChild(newChild: Node | Vidyano.WebComponents.WebComponent, oldChild: Node | Vidyano.WebComponents.WebComponent): Node;
    getEffectiveChildNodes(): Node[];
    observeNodes(callBack: (info: PolymerDomChangedInfo) => void): PolymerDomChangeObserver;
    unobserveNodes(observer: PolymerDomChangeObserver);
}

interface PolymerDomChangedInfo {
    addedNodes: Node[];
    removedNodes: Node[];
    target: Element;
}

interface PolymerDomChangeObserver {
}

interface PolymerTrackEvent extends CustomEvent {
    detail: {
        sourceEvent?: Event;
    }
}

interface PolymerTrackDetail {
    /**
    state - a string indicating the tracking state:
        - start - fired when tracking is first detected (finger/button down and moved past a pre-set distance threshold)
        - track - fired while tracking
        - end - fired when tracking ends
    */
    state: string;
    /** clientX coordinate for event */
    x: number;
    /** clientY coordinate for event */
    y: number;
    /** change in pixels horizontally since the first track event */
    dx: number;
    /** change in pixels vertically since the first track event */
    dy: number;
    /** change in pixels horizontally since last track event */
    ddx: number;
    /** change in pixels vertically since last track event */
    ddy: number;
    /** a function that may be called to determine the element currently being hovered */
    hover(): Element | Vidyano.WebComponents.WebComponent;
}

interface PolymerTemplate extends Node {
    stamp: (model: any) => TemplateInstance;
}

interface TemplateInstance {
    item: any;
    index: number;
    root: DocumentFragment;

    /**
     * Notifies Polymer for a change in the given path.
     */
    notifyPath: (path: string, value: any, fromAbove?: boolean) => void;
}

interface TapEvent extends CustomEvent {
    detail: {
        x: number;
        y: number;
        sourceEvent: Event;
        preventer?: Event;
    };

    model?: TemplateInstance | any;
}

interface PolymerGestures {
    add: (node: HTMLElement, eventName: string, handler: Function) => void;
    remove: (node: HTMLElement, eventName: string, handler: Function) => void;
}

declare var Polymer: {
    (polymer: any): any;
    dom(element: Node | Vidyano.WebComponents.WebComponent): PolymerDomApi;
    getRegisteredPrototype(tagName: string): any;

    /**
     * Returns true if the element is a Polymer web component.
     */
    isInstance(element: HTMLElement): boolean;

    whenReady(callback: () => void): void;

    /**
     * no-operation function for handy stubs
     */
    nop(): void;

    api: any;

    Gestures: PolymerGestures;
};
declare var CustomElements: {
    registry: {
        [tag: string]: {
            ctor: any;
        }
    }

    ready: boolean;
    useNative: boolean;
};
