import { Memoize } from '../memoize';
import { Operator } from '../operator';
import { Store } from '../store';

export class MapOperator<T, U> extends Operator<U> {
    private getState = Memoize.one((version: number) => {
        return this.project(this.source.state);
    });

    public constructor(private source: Store<T>, private project: (value: T) => U) {
        super();
        this.addDependency(source);
    }

    public get state() {
        return this.getState(this.source.version);
    }

    protected handleChange() {
        this.incrementVersion();
        this.notify();
    }
}

export const map = <T, U>(project: (value: T) => U) => (source: Store<T>): MapOperator<T, U> => {
    return new MapOperator(source, project);
};
