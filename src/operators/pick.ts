import { Store } from '../store';
import { Subscription } from '../subscription';

export class PickStore<T, K extends keyof T> extends Store<{ [Key in K]: T[Key] }> {
    private source: Store<T>;
    private keys: K[];
    private subscription: Subscription | undefined = undefined;

    constructor(source: Store<T>, keys: K[]) {
        super(PickStore.pick(source.state, keys));
        this.source = source;
        this.keys = keys;
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

    private handleNext = () => {
        this.setInnerState(PickStore.pick(this.source.state, this.keys));
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
