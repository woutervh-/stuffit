import { Dependency } from '../dependency';
import { Store } from '../store';

export class DistinctStore<T> extends Store<T> {
    private dependency: Dependency<T>;

    public constructor(source: Store<T>, private testEquality: (previous: T, next: T) => boolean) {
        super(source.state);
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
        if (!this.testEquality(this.state, value)) {
            this.setInnerState(value);
        }
    }
}

export const distinct = <T>(testEquality: (previous: T, next: T) => boolean) => (source: Store<T>): DistinctStore<T> => {
    return new DistinctStore(source, testEquality);
};

export const distinctStrictEquality = <T>(source: Store<T>): DistinctStore<T> => {
    return new DistinctStore(source, (previous, next) => previous === next);
};
