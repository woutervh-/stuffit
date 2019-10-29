type FunctionArguments<T> = T extends (...args: infer U) => unknown ? U : never;

export class Memoize {
    public static arrayEquals(left: unknown[], right: unknown[]): boolean {
        if (left.length !== right.length) {
            return false;
        }
        for (let i = 0; i < left.length; i++) {
            if (left[i] !== right[i]) {
                return false;
            }
        }
        return true;
    }

    public static one<T extends Function>(fn: T, equals: (left: FunctionArguments<T>, right: FunctionArguments<T>) => boolean = Memoize.arrayEquals): T {
        let lastValues: { args: FunctionArguments<T>, returnValue: unknown } | null = null;

        return function (this: unknown, ...args: FunctionArguments<T>) {
            if (lastValues && equals(args, lastValues.args)) {
                return lastValues.returnValue;
            } else {
                const returnValue = fn.apply(this, args);
                lastValues = { args, returnValue };
                return returnValue;
            }
        } as unknown as T;
    }
}
