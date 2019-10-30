import { Dependency } from '../dependency';
import { Store } from '../store';

export class PickStore<T, K extends keyof T> extends Store<{ [Key in K]: T[Key] }> {
    private dependency: Dependency<T>;

    public constructor(source: Store<T>, private keys: K[]) {
        super(PickStore.pick(source.state, keys));
        this.dependency = new Dependency(source, this.handleNext);
    }

    protected preStart() {
        this.dependency.update();
    }

    protected start() {
        this.dependency.stop();
    }

    protected stop() {
        this.dependency.stop();
    }

    private handleNext = (state: T) => {
        this.setInnerState(PickStore.pick(state, this.keys));
    }

    private static pick<T, K extends keyof T>(value: T, keys: K[]): { [Key in K]: T[Key] } {
        const picked: { [Key in K]: T[Key] } = {} as { [Key in K]: T[Key] };
        for (const key of keys) {
            picked[key] = value[key];
        }
        return picked;
    }
}

export const pick = <T, K extends keyof T>(...keys: K[]) => (source: Store<T>): PickStore<T, K> => {
    return new PickStore(source, keys);
};
