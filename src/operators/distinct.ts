import { Store } from '../store';
import { Subscription } from '../subscription';

export class DistinctStore<T> extends Store<T> {
    private source: Store<T>;
    private testEquality: (previous: T, next: T) => boolean;
    private subscription: Subscription | undefined = undefined;
    private currentState: T;

    constructor(source: Store<T>, testEquality: (previous: T, next: T) => boolean) {
        super();
        this.source = source;
        this.testEquality = testEquality;
        this.currentState = source.state;
    }

    public get state() {
        return this.currentState;
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

    private handleNext = (value: T) => {
        if (!this.testEquality(this.currentState, value)) {
            this.currentState = value;
            this.notify(value);
        }
    }
}

export const distinct = <T>(testEquality: (previous: T, next: T) => boolean) => (source: Store<T>): DistinctStore<T> => {
    return new DistinctStore(source, testEquality);
};

export const distinctStrictEquality = <T>(source: Store<T>): DistinctStore<T> => {
    return new DistinctStore(source, (previous, next) => previous === next);
};
