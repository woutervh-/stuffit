import { Dependency } from '../dependency';
import { Store } from '../store';

export class FlattenStore<T> extends Store<T> {
    private outerDependency: Dependency<Store<T>>;
    private innerDependency: Dependency<T>;

    public constructor(source: Store<Store<T>>) {
        super(source.state.state);
        this.outerDependency = new Dependency(source, this.handleNextOuter);
        this.innerDependency = new Dependency(source.state, this.handleNextInner);
    }

    protected preStart() {
        this.innerDependency.start();
        this.innerDependency.update();
        this.outerDependency.start();
        this.outerDependency.update();
    }

    protected start() {
        //
    }

    protected stop() {
        this.innerDependency.stop();
        this.outerDependency.stop();
    }

    private handleNextOuter = (store: Store<T>) => {
        if (this.innerDependency.hasStarted()) {
            this.innerDependency.stop();
        }
        this.innerDependency = new Dependency(store, this.handleNextInner);
        this.innerDependency.start();
        this.setInnerState(store.state);
    }

    private handleNextInner = (state: T) => {
        this.setInnerState(state);
    }
}

export const flatten = <T>(source: Store<Store<T>>): FlattenStore<T> => {
    return new FlattenStore(source);
};
