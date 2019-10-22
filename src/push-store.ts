import { Store } from './store';

export class PushStore<T> extends Store<T> {
    private innerState: T;

    public constructor(initialState: T) {
        super();
        this.innerState = initialState;
    }

    public get state() {
        return this.innerState;
    }

    public setState(newState: T) {
        this.innerState = newState;
        this.notify();
    }

    protected start() {
        //
    }

    protected stop() {
        //
    }
}
