import { Operator } from '../operator';
import { Store } from '../store';

export class ReduceOperator<T, U> extends Operator<U> {
    constructor(private source: Store<T>, private reduce: (accumulator: U, currentValue: T) => U, initialValue: U) {
        super();
        this.setInnerState(initialValue);
        this.addDependency(source, this.update);
    }

    private update = () => {
        this.setInnerState(this.reduce(this.state, this.source.state));
    }
}

export const reduce = <T, U>(reduce: (accumulator: U, currentValue: T) => U, initialValue: U) => (source: Store<T>): ReduceOperator<T, U> => {
    return new ReduceOperator(source, reduce, initialValue);
};
