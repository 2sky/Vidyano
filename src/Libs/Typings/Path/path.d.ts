declare module Vidyano {
    export interface Route {
        enter(fnc: Function): Route;
        to(fnc: Function): Route;
        exit(fnc: Function): Route;
        params: any;
        path: string;
    }

    export interface PathRescueArguments {
        current: string;
    }

    export interface PathArguments {
        path: string;
        params: { [key: string]: string };
    }

    export interface PathStatic {
        map(path: string): Route;
        root(path: string): void;
        routes: {
            current: string;
            defined: {
                [key: string]: Route
            };
        };
        listen(): void;
        rescue(fnc: Function): void;
        history: {
            pushState(state: any, title: string, path: string);
            replaceState(state: any, title: string, path: string);
            listen();
        };
        match(path: string, parameterize: boolean): Route;
    }

    export var Path: PathStatic;
}