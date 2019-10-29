import { Memoize } from '../memoize';
import { Operator } from '../operator';
import { Store } from '../store';

export class HistoryOperator<T> extends Operator<(T | undefined)[]> {
    private getState = Memoize.one((version: number) => {
        const history = this.history.slice();
        history.shift();
        history.push(this.source.state);
        return history;
    });

    private history: (T | undefined)[];

    public constructor(private source: Store<T>, frames: number) {
        super();
        this.history = HistoryOperator.emptyHistory(frames);
        this.addDependency(source);
    }

    public get state() {
        this.history = this.getState(this.source.version);
        return this.history;
    }

    protected handleChange() {
        this.incrementVersion();
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

export const history = (frames: number) => <T>(source: Store<T>): HistoryOperator<T> => {
    return new HistoryOperator(source, frames);
};
