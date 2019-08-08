import { Store } from '../store';
import { Subscription } from '../subscription';

export class HistoryStore<T> extends Store<(T | undefined)[]> {
    private source: Store<T>;
    private subscription: Subscription | undefined = undefined;
    private history: (T | undefined)[] = [];

    constructor(source: Store<T>, frames: number) {
        super();
        this.source = source;
        for (let i = 0; i < frames; i++) {
            this.history.push(undefined);
        }
    }

    public get state() {
        return this.history;
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
        const history = this.history.slice();
        history.shift();
        history.push(value);
        this.history = history;
        this.notify(history);
    }
}

export const history = (frames: number) => <T>(source: Store<T>): HistoryStore<T> => {
    return new HistoryStore(source, frames);
};
