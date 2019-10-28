import { Store } from './store';

export class PushStore<T> extends Store<T> {
    public setState(newState: T) {
        this.setInnerState(newState);
    }
}
