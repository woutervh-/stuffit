import { createFulfilled, createRejected, pending, PromiseResult } from 'promise-result';
import { Store } from '../store';

export class PromiseStore<T> extends Store<PromiseResult<T>> {
    private result: PromiseResult<T> = pending;

    public constructor(promise: Promise<T>) {
        super();
        promise.then(this.handlePromiseResult).catch(this.handlePromiseError);
    }

    public get state() {
        return this.result;
    }

    protected start() {
        //
    }

    protected stop() {
        //
    }

    private handlePromiseResult = (result: T) => {
        this.result = createFulfilled(result);
        this.incrementVersion();
        this.notify();
    }

    private handlePromiseError = (error: unknown) => {
        const rejected = error instanceof Error
            ? createRejected(error)
            : createRejected(new Error('Promise was rejected.'));
        this.result = rejected;
        this.incrementVersion();
        this.notify();
    }
}

export const fromPromise = <T>(promise: Promise<T>): PromiseStore<T> => {
    return new PromiseStore(promise);
};
