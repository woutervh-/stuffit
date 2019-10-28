import { Operator } from '../operator';
import { Store } from '../store';

export class PluckOperator<T, K extends keyof T> extends Operator<T[K]> {
    public constructor(private source: Store<T>, private key: K) {
        super();
        this.addDependency(source, this.update);
    }

    private update = () => {
        this.setInnerState(this.source.state[this.key]);
    }
}

export const pluck = <T, K extends keyof T>(key: K) => (source: Store<T>): PluckOperator<T, K> => {
    return new PluckOperator(source, key);
};
