import { Store } from './store';

export class PushStore<T> extends Store<T> {
    public constructor(initialState: T) {
        super();
        this.setInnerState(initialState);
    }

    public setState(newState: T) {
        this.setInnerState(newState);
        this.notify();
    }
}
