import { createFulfilled, createRejected, pending, PromiseResult } from 'promise-result';
import { Store } from '../store';

export class PromiseStore<T> extends Store<PromiseResult<T>> {
    public constructor(promise: Promise<T>) {
        super(pending);
        promise.then(this.handlePromiseResult).catch(this.handlePromiseError);
    }

    private handlePromiseResult = (result: T) => {
        const fulfilled = createFulfilled(result);
        this.setInnerState(fulfilled);
    }

    private handlePromiseError = (error: unknown) => {
        const rejected = error instanceof Error
            ? createRejected(error)
            : createRejected(new Error('Promise was rejected.'));
        this.setInnerState(rejected);
    }
}

export const fromPromise = <T>(promise: Promise<T>): PromiseStore<T> => {
    return new PromiseStore(promise);
};
