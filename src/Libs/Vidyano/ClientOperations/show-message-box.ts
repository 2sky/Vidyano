namespace Vidyano {
    export namespace ClientOperations {
        export function showMessageBox(hooks: ServiceHooks, title: string, message: string, rich: boolean = false, delay: number = 0): void {
            setTimeout(function () {
                hooks.onMessageDialog(title, message, rich, hooks.service.getTranslatedMessage("OK"));
            }, delay);
        }
    }
}