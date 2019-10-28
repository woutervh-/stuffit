const equals = (left: unknown[], right: unknown[]) => {
    if (left.length !== right.length) {
        return false;
    }
    for (let i = 0; i < left.length; i++) {
        if (left[i] !== right[i]) {
            return false;
        }
    }
    return true;
};

export const memoize = <T extends Function>(fn: T): T => {
    let lastValues: { args: unknown[], returnValue: unknown } | null = null;

    return function (this: unknown, ...args: unknown[]) {
        if (lastValues && equals(args, lastValues.args)) {
            return lastValues.returnValue;
        } else {
            const returnValue = fn.apply(this, args);
            lastValues = { args, returnValue };
            return returnValue;
        }
    } as unknown as T;
};
