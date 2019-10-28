import { Operator } from '../operator';
import { Store } from '../store';

export class PickOperator<T, K extends keyof T> extends Operator<{ [Key in K]: T[Key] }> {
    public constructor(private source: Store<T>, private keys: K[]) {
        super();
        this.addDependency(source, this.update);
    }

    private update = () => {
        this.setInnerState(PickOperator.pick(this.source.state, this.keys));
    }

    private static pick<T, K extends keyof T>(value: T, keys: K[]): { [Key in K]: T[Key] } {
        const picked: { [Key in K]: T[Key] } = {} as { [Key in K]: T[Key] };
        for (const key of keys) {
            picked[key] = value[key];
        }
        return picked;
    }
}

export const pick = <T, K extends keyof T>(...keys: K[]) => (source: Store<T>): PickOperator<T, K> => {
    return new PickOperator(source, keys);
};
