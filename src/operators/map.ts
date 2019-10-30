import { Dependency } from '../dependency';
import { Store } from '../store';

export class MapStore<T, U> extends Store<U> {
    private dependency: Dependency<T>;

    public constructor(source: Store<T>, private project: (value: T) => U) {
        super(project(source.state));
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
        this.setInnerState(this.project(state));
    }
}

export const map = <T, U>(project: (value: T) => U) => (source: Store<T>): MapStore<T, U> => {
    return new MapStore(source, project);
};
