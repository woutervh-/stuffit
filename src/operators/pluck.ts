import { Store } from '../store';
import { Subscription } from '../subscription';

export class PluckStore<T, K extends keyof T> extends Store<T[K]> {
    private source: Store<T>;
    private key: K;
    private subscription: Subscription | undefined = undefined;

    public constructor(source: Store<T>, key: K) {
        super(source.state[key]);
        this.source = source;
        this.key = key;
    }

    protected start = () => {
        if (this.subscription === undefined) {
            this.subscription = this.source.subscribe(this.handleNext);
        }
    }

    protected stop = () => {
        if (this.subscription !== undefined) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }

    private handleNext = () => {
        this.setInnerState(this.source.state[this.key]);
    }
}

export const pluck = <T, K extends keyof T>(key: K) => (source: Store<T>): PluckStore<T, K> => {
    return new PluckStore(source, key);
};
