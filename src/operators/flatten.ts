import { Store } from '../store';
import { Subscription } from '../subscription';

export class FlattenStore<T> extends Store<T> {
    private source: Store<Store<T>>;
    private outerSubscription: Subscription | undefined = undefined;
    private innerSubscription: Subscription | undefined = undefined;

    constructor(source: Store<Store<T>>) {
        super(source.state.state);
        this.source = source;
    }

    protected start() {
        if (this.outerSubscription === undefined) {
            this.outerSubscription = this.source.subscribe(this.handleNextOuter);
        }
    }

    protected stop() {
        if (this.outerSubscription !== undefined) {
            this.outerSubscription.unsubscribe();
            this.outerSubscription = undefined;
        }
        if (this.innerSubscription !== undefined) {
            this.innerSubscription.unsubscribe();
            this.innerSubscription = undefined;
        }
    }

    private handleNextOuter = (store: Store<T>) => {
        if (this.innerSubscription !== undefined) {
            this.innerSubscription.unsubscribe();
            this.innerSubscription = undefined;
        }
        this.innerSubscription = store.subscribe(this.handleNextInner);
    }

    private handleNextInner = () => {
        this.setInnerState(this.source.state.state);
    }
}

export const flatten = <T>(source: Store<Store<T>>): FlattenStore<T> => {
    return new FlattenStore(source);
};
