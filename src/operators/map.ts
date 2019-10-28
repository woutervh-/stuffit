import { memoize } from '../memoize';
import { Operator } from '../operator';
import { Store } from '../store';

export class MapOperator<T, U> extends Operator<U> {
    private getState = memoize(<T, U>(state: T, project: (value: T) => U) => {
        return project(state);
    });

    public constructor(private source: Store<T>, private project: (value: T) => U) {
        super();
        this.addDependency(source);
    }

    public get state() {
        return this.getState(this.source.state, this.project);
    }
}

export const map = <T, U>(project: (value: T) => U) => (source: Store<T>): MapOperator<T, U> => {
    return new MapOperator(source, project);
};
