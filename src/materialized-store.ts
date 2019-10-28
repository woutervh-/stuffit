import { Store } from './store';

export class MaterializedStore<T> extends Store<T> {
    private innerState: T;

    public constructor(initialState: T) {
        super();
        this.innerState = initialState;
    }

    public get state() {
        return this.innerState;
    }

    protected setState(newState: T) {
        this.innerState = newState;
        this.incrementVersion();
    }
}
