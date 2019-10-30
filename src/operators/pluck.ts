import { Dependency } from '../dependency';
import { Store } from '../store';

export class PluckStore<T, K extends keyof T> extends Store<T[K]> {
    private dependency: Dependency<T>;

    public constructor(source: Store<T>, private key: K) {
        super(source.state[key]);
        this.dependency = new Dependency(source, this.handleNext);
    }

    protected preStart() {
        this.dependency.update();
    }

    protected start() {
        this.dependency.start();
    }

    protected stop() {
        this.dependency.stop();
    }

    private handleNext = (state: T) => {
        this.setInnerState(state[this.key]);
    }
}

export const pluck = <T, K extends keyof T>(key: K) => (source: Store<T>): PluckStore<T, K> => {
    return new PluckStore(source, key);
};
