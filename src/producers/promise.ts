import { createFulfilled, createRejected, pending, PromiseResult } from 'promise-result';
import { Store } from '../store';

export class PromiseStore<T> extends Store<PromiseResult<T>> {
    private innerState: PromiseResult<T> = pending;

    constructor(promise: Promise<T>) {
        super();
        promise.then(this.handlePromiseResult).catch(this.handlePromiseError);
    }

    public get state() {
        return this.innerState;
    }

    protected start() {
        //
    }

    protected stop() {
        //
    }

    private handlePromiseResult = (result: T) => {
        const fulfilled = createFulfilled(result);

        this.innerState = fulfilled;
        this.notify(fulfilled);
    }

    private handlePromiseError = (error: unknown) => {
        const rejected = error instanceof Error
            ? createRejected(error)
            : createRejected(new Error('Promise was rejected.'));

        this.innerState = rejected;
        this.notify(rejected);
    }
}
