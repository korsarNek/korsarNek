export function debounce<TCallback extends (...args: any[]) => void>(callback: TCallback, timeout: number): (...args: Parameters<TCallback>) => void {
    let timerId: number | undefined = undefined;
    return function <T>(this: T, ...args) {
        const context = this;
        if (timerId === undefined) {
            timerId = window.setTimeout(() => {
                timerId = undefined;
                return callback.apply(context, args);
            }, timeout);
        }
    };
}

/**
 * Delays calling the callback until the timeout is reached. The arguments are from the last call to the returned action. The delay can also be cancelled.
 * 
 * @param callback 
 * @param timeout ms
 * @returns 
 */
export function delayedLastCancellable<TCallback extends (...args: any[]) => void>(callback: TCallback, timeout: number): { cancel: () => void; action: (...args: Parameters<TCallback>) => void; } {
    let timerId: number | undefined = undefined;
    let context: any = undefined;
    let lastArgs: any[] | undefined = undefined;
    return {
        action: function<T>(this: T, ...args) {
            context = this;
            lastArgs = args;
            if (timerId === undefined) {
                timerId = window.setTimeout(() => {
                    timerId = undefined;
                    return callback.apply(context, lastArgs);
                }, timeout);
            }
        },
        cancel: () => {
            clearTimeout(timerId);
            timerId = undefined;
        }
    }
}