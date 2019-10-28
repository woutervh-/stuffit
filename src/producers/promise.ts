import { createFulfilled, createRejected, pending, PromiseResult } from 'promise-result';
import { MaterializedStore } from '../materialized-store';

export class PromiseStore<T> extends MaterializedStore<PromiseResult<T>> {
    public constructor(promise: Promise<T>) {
        super(pending);
        promise.then(this.handlePromiseResult).catch(this.handlePromiseError);
    }

    private handlePromiseResult = (result: T) => {
        const fulfilled = createFulfilled(result);
        this.setState(fulfilled);
    }

    private handlePromiseError = (error: unknown) => {
        const rejected = error instanceof Error
            ? createRejected(error)
            : createRejected(new Error('Promise was rejected.'));
        this.setState(rejected);
    }
}

export const fromPromise = <T>(promise: Promise<T>): PromiseStore<T> => {
    return new PromiseStore(promise);
};
