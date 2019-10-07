import { Store } from '../store';
import { Subscription } from '../subscription';

export class ReduceStore<T, U> extends Store<U> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;
    private reduce: (accumulator: U, currentValue: T) => U;

    constructor(source: Store<T>, reduce: (accumulator: U, currentValue: T) => U, initialValue: U) {
        super(initialValue);
        this.source = source;
        this.reduce = reduce;
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
        this.setInnerState(this.reduce(this.state, value));
    }
}

export const reduce = <T, U>(reduce: (accumulator: U, currentValue: T) => U, initialValue: U) => (source: Store<T>): ReduceStore<T, U> => {
    return new ReduceStore(source, reduce, initialValue);
};
