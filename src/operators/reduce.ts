import { Dependency } from '../dependency';
import { Store } from '../store';

export class ReduceStore<T, U> extends Store<U> {
    private dependency: Dependency<T>;

    constructor(source: Store<T>, private reduce: (accumulator: U, currentValue: T) => U, initialValue: U) {
        super(reduce(initialValue, source.state));
        this.dependency = new Dependency(source, this.handleNext);
    }

    protected preStart() {
        this.dependency.start();
        this.dependency.update();
    }

    protected start() {
        //
    }

    protected stop() {
        this.dependency.stop();
    }

    private handleNext = (value: T) => {
        this.setInnerState(this.reduce(this.state, value));
    }
}

export const reduce = <T, U>(reduce: (accumulator: U, currentValue: T) => U, initialValue: U) => (source: Store<T>): ReduceStore<T, U> => {
    return new ReduceStore(source, reduce, initialValue);
};
