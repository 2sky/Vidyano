function executeAsync<T>(functionName: string, args: any[], done: (result: T) => void) {
    var fnc = window[functionName];
    const interval = setInterval(() => {
        const result = fnc.apply(window, args);
        if (result !== undefined) {
            clearInterval(interval);
            done(result);
        }
    }, 250);
}