import { Dependency } from '../dependency';
import { Store } from '../store';

export class HistoryStore<T> extends Store<(T | undefined)[]> {
    private dependency: Dependency<T>;

    public constructor(source: Store<T>, frames: number) {
        super(HistoryStore.initialHistory(frames, source.state));
        this.dependency = new Dependency(source, this.handleNext);
    }

    protected preStart() {
        this.dependency.start();
        this.dependency.update();
    }

    protected start() {
        //
    }

    protected stop() {
        this.dependency.stop();
    }

    private handleNext = (value: T) => {
        const history = this.state.slice();
        history.shift();
        history.push(value);
        this.setInnerState(history);
    }

    private static initialHistory<T>(frames: number, initialState: T) {
        const history: (T | undefined)[] = [];
        for (let i = 0; i < frames - 1; i++) {
            history.push(undefined);
        }
        history.push(initialState);
        return history;
    }
}

export const history = (frames: number) => <T>(source: Store<T>): HistoryStore<T> => {
    return new HistoryStore(source, frames);
};
