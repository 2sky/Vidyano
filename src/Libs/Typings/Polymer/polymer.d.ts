interface PolymerProperties {
    [name: string]: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor | {
        type: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor;
        computed?: string;
        reflectToAttribute?: boolean;
        readOnly?: boolean;
        observer?: string;
    };
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
    querySelector(selectors: string): Element | Vidyano.WebComponents.WebComponent;
    querySelectorAll(selectors: string): NodeList;
    appendChild(newChild: Node | Vidyano.WebComponents.WebComponent): Node | Vidyano.WebComponents.WebComponent;
    removeChild(oldChild: Node | Vidyano.WebComponents.WebComponent): Node | Vidyano.WebComponents.WebComponent;
    replaceChild(newChild: Node | Vidyano.WebComponents.WebComponent, oldChild: Node | Vidyano.WebComponents.WebComponent): Node;
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

declare var Polymer: {
    (polymer: any): void;
    dom(element: Node | Vidyano.WebComponents.WebComponent): PolymerDomApi;
    getRegisteredPrototype(tagName: string): any;

    whenReady(callback: () => void): void;

    /**
     * no-operation function for handy stubs
     */
    nop(): void;

    api: any;
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

interface Observer {
    /**
     * Begins observation. Returns the current value of the observation.
     */
    open(callback: Function): any;
    /**
     * Report any changes now (does nothing if there are no changes to report).
     */
    deliver(): void;
    /**
     * If there are changes to report, ignore them. Returns the current value of the observation.
     */
    discardChanges(): any;
    /**
     * Ends observation. Frees resources and drops references to observed objects.
     */
    close(): void;
}

/**
 * PathObserver observes a "value-at-a-path" from a given object.
 */
interface PathObserver extends Observer {
    /**
     * Begins observation.
     */
    open(callback: (newValue: any, oldValue: any) => void): void;
    /**
     * Attempts to update the underlying value.
     */
    setValue(value: any): void;

    state: number;
}

/**
 * PathObserver observes a "value-at-a-path" from a given object.
 */
declare var PathObserver: {
    new (element: any, path: string): PathObserver;
    new (element: any, path: Path): PathObserver;
}

interface ArraySplice {
    /**
     * Index position that the change occurred.
     */
    index: number;
    /**
     * An array of values representing the sequence of elements which were removed
     */
    removed: number[];
    /**
     * The number of elements which were inserted.
     */
    addedCount: number;
}

/**
 * ArrayObserver observes the index-positions of an Array and reports changes as the minimal set of "splices" which would have had the same effect.
 */
interface ArrayObserver<T> extends Observer {
    /**
     * Begins observation.
     */
    open(callback: (splices: ArraySplice[]) => void): void;
}

/**
 * ArrayObserver observes the index-positions of an Array and reports changes as the minimal set of "splices" which would have had the same effect.
 */
declare var ArrayObserver: {
    new <T>(array: Array<T>): ArrayObserver<T>;

    /**
     * Transform a copy of an old state of an array into a copy of its current state, given the current state and the splices reported from the ArrayObserver.
     */
    applySplices(previous, current, splices: ArraySplice[]): void;
}

/**
 * ObjectObserver observes the set of own-properties of an object and their values.
 */
interface ObjectObserver extends Observer {
    /**
     * Begins observation.
     */
    open(callback: (added: any, removed: any, changed: any, getOldValueFn: (property: string) => any) => void): void;
}

/**
 * ObjectObserver observes the set of own-properties of an object and their values.
 */
declare var ObjectObserver: {
    new (obj: any): ObjectObserver;
}

interface CompoundObserver extends Observer {
    addPath(element: any, path: string): void;
    addPath(element: any, path: Path): void;
    addObserver(observer: Observer): void;
    /**
     * Begins observation.
     */
    open(callback: (newValues: any[], oldValues: any[]) => void): void;
}

declare var CompoundObserver: {
    new (reportChangesOnOpen?: boolean): CompoundObserver;
}

interface Path {
    /**
     * Returns the current of the path from the provided object. If eval() is available, a compiled getter will be used for better performance.
     */
    getValueFrom(obj: any): any;
    /**
     * Attempts to set the value of the path from the provided object. Returns true IFF the path was reachable and set.
     */
    setValueFrom(obj: any, newValue: any): boolean;
}

declare var Path: {
    get(path: string): Path;
}