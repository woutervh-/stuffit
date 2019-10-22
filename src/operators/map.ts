import { Store } from '../store';
import { Subscription } from '../subscription';

export class MapStore<T, U> extends Store<U> {
    private source: Store<T>;
    private project: (value: T) => U;
    private subscription: Subscription | undefined = undefined;

    public constructor(source: Store<T>, project: (value: T) => U) {
        super();
        this.source = source;
        this.project = project;
    }

    public get state() {
        return this.project(this.source.state);
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
        this.notify();
    }
}

export const map = <T, U>(project: (value: T) => U) => (source: Store<T>): MapStore<T, U> => {
    return new MapStore(source, project);
};
