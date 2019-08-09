import { Store } from '../store';
import { Subscription } from '../subscription';

export class MapStore<T, U> extends Store<U> {
    private source: Store<T>;
    private project: (value: T) => U;
    private subscription: Subscription | undefined = undefined;

    constructor(source: Store<T>, project: (value: T) => U) {
        super(project(source.state));
        this.source = source;
        this.project = project;
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
        this.setInnerState(this.project(this.source.state));
    }
}

export const map = <T, U>(project: (value: T) => U) => (source: Store<T>): MapStore<T, U> => {
    return new MapStore(source, project);
};
