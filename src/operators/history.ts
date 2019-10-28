import { Store } from '../store';
import { Subscription } from '../subscription';

export class HistoryStore<T> extends Store<(T | undefined)[]> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;

    public constructor(source: Store<T>, frames: number) {
        super(HistoryStore.emptyHistory(frames));
        this.source = source;
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

    private handleNext = (value: T) => {
        const history = this.state.slice();
        history.shift();
        history.push(value);
        this.setInnerState(history);
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
