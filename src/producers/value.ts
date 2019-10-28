import { Store } from '../store';

export class ValueStore<T> extends Store<T> {
    public constructor(initialState: T) {
        super();
        this.setInnerState(initialState);
    }
}

export const fromValue = <T>(initialState: T): ValueStore<T> => {
    return new ValueStore(initialState);
};
