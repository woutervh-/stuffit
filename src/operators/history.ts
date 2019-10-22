import { Store } from '../store';
import { Subscription } from '../subscription';

export class HistoryStore<T> extends Store<(T | undefined)[]> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;
    private innerState: (T | undefined)[];

    public constructor(source: Store<T>, frames: number) {
        super();
        this.source = source;
        this.innerState = HistoryStore.emptyHistory(frames);
    }

    public get state() {
        return this.innerState;
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
        const history = this.innerState.slice();
        history.shift();
        history.push(value);
        this.innerState = history;
        this.notify();
    }

    private static emptyHistory(frames: number) {
        const history: undefined[] = [];
        for (let i = 0; i < frames; i++) {
            history.push(undefined);
        }
        return history;
    }
}

export const history = (frames: number) => <T>(source: Store<T>): HistoryStore<T> => {
    return new HistoryStore(source, frames);
};
