interface Window {
    requestIdleCallback: (callback: Function) => number;
    cancelIdleCallback: (handle: number) => void;
}
