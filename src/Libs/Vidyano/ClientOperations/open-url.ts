namespace Vidyano {
    export namespace ClientOperations {
        export function openUrl(hooks: ServiceHooks, url: string) {
            if (!url.startsWith("http"))
                url = `http://${url}`;

            window.open(url, "_blank");
        }
    }
}