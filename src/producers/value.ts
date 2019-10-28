import { Store } from '../store';

export class ValueStore<T> extends Store<T> {
    public constructor(private initialState: T) {
        super();
    }

    public get state() {
        return this.initialState;
    }
}

export const fromValue = <T>(initialState: T): ValueStore<T> => {
    return new ValueStore(initialState);
};
