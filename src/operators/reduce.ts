import { Store } from '../store';
import { Subscription } from '../subscription';

export class ReduceStore<T, U> extends Store<U> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;
    private reduce: (accumulator: U, currentValue: T) => U;
    private innerState: U;

    constructor(source: Store<T>, reduce: (accumulator: U, currentValue: T) => U, initialValue: U) {
        super();
        this.source = source;
        this.reduce = reduce;
        this.innerState = reduce(initialValue, source.state);
    }

    public get state() {
        return this.innerState;
    }

    protected start() {
        if (this.subscription === undefined) {
            this.subscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop() {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    private handleNext = (value: T) => {
        this.innerState = this.reduce(this.state, value);
        this.notify();
    }
}

export const reduce = <T, U>(reduce: (accumulator: U, currentValue: T) => U, initialValue: U) => (source: Store<T>): ReduceStore<T, U> => {
    return new ReduceStore(source, reduce, initialValue);
};
