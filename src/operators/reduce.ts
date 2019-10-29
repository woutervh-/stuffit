import { Memoize } from '../memoize';
import { Operator } from '../operator';
import { Store } from '../store';

export class ReduceOperator<T, U> extends Operator<U> {
    private currentState: U;
    private getState = Memoize.one((version: number) => {
        return this.reduce(this.currentState, this.source.state);
    });

    constructor(private source: Store<T>, private reduce: (accumulator: U, currentValue: T) => U, initialValue: U) {
        super();
        this.addDependency(source);
        this.currentState = initialValue;
    }

    public get state() {
        this.currentState = this.getState(this.source.version);
        return this.currentState;
    }
}

export const reduce = <T, U>(reduce: (accumulator: U, currentValue: T) => U, initialValue: U) => (source: Store<T>): ReduceOperator<T, U> => {
    return new ReduceOperator(source, reduce, initialValue);
};
