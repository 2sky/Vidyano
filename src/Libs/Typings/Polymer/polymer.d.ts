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

interface TemplateInstance {
    item: any;
    index: number;
}

interface TapEvent extends CustomEvent {
    detail: {
        x: number;
        y: number;
        sourceEvent: Event;
    };

    model?: TemplateInstance | any;
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
