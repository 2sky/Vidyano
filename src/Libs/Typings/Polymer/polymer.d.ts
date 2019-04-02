declare namespace Polymer {
    interface FlattenedNodesObserverInfo {
        target: _Element;
        addedNodes: _Element[];
        removedNodes: _Element[];
    }

    interface Property {
        type: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor;
        computed?: string;
        reflectToAttribute?: boolean;
        readOnly?: boolean;
        observer?: string;
        value?: number | boolean | string | Function;
        notify?: boolean;
    }

    interface Properties {
        [name: string]: ObjectConstructor | StringConstructor | BooleanConstructor | DateConstructor | NumberConstructor | ArrayConstructor | Property;
    }

    interface GestureEvent extends Event {
        x: number;
        y: number;
        sourceEvent: Event;
    }

    interface DownEvent extends GestureEvent {
    }

    interface UpEvent extends GestureEvent {
    }

    interface TapEvent extends GestureEvent {
        model: any;
        detail: {
            sourceEvent: Event;
            x: number;
            y: number;
        }
    }

    interface TrackEvent extends GestureEvent {
        detail: TrackEventDetail;
    }

    interface TrackEventDetail {
        /**
          * state - a string indicating the tracking state:
          * - start - fired when tracking is first detected (finger/button down and moved past a pre-set distance threshold)
          * - track - fired while tracking
         * - end - fired when tracking ends
        */
        state: "start" | "track" | "end";
        /** clientX coordinate for event */
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

    interface Template extends Node {
        render();
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

    namespace Templatize {
        function templatize(template: HTMLTemplateElement, owner?: Polymer.PropertyEffects | null, options?: object | null): { new(model: any): TemplateInstanceBase & TemplateInstance };
    }
}

declare namespace ShadyCSS {
    function getComputedStyleValue(el: Element, propertyName: string): string;
}

interface Event {
    composedPath(): HTMLElement[];
}