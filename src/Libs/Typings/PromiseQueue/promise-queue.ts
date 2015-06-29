declare class Queue {
    constructor(maxConcurrentPromises: number, maxQueuedPromises?: number);
    add<T>(work: () => Promise<T>): Promise<T>;
    getQueueLength(): number;
}