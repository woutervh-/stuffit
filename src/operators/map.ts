import { Operator } from '../operator';
import { Store } from '../store';

export class MapOperator<T, U> extends Operator<U> {
    public constructor(private source: Store<T>, private project: (value: T) => U) {
        super();
        this.addDependency(source, this.update);
    }

    protected update = () => {
        this.setInnerState(this.project(this.source.state));
    }
}

export const map = <T, U>(project: (value: T) => U) => (source: Store<T>): MapOperator<T, U> => {
    return new MapOperator(source, project);
};
