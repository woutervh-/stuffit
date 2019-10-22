import { Store } from '../store';
import { Subscription } from '../subscription';

export class FlattenStore<T> extends Store<T> {
    private source: Store<Store<T>>;
    private outerSubscription: Subscription | undefined = undefined;
    private innerSubscription: Subscription | undefined = undefined;

    public constructor(source: Store<Store<T>>) {
        super();
        this.source = source;
    }

    public get state() {
        return this.source.state.state;
    }

    protected start() {
        if (this.innerSubscription === undefined) {
            this.innerSubscription = this.source.state.subscribe(this.handleNextInner);
        }
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
        this.notify();
    }

    private handleNextInner = () => {
        this.notify();
    }
}

export const flatten = <T>(source: Store<Store<T>>): FlattenStore<T> => {
    return new FlattenStore(source);
};
