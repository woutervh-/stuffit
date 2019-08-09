import { Store } from '../store';

export class ValueStore<T> extends Store<T> {
    protected start() {
        //
    }

    protected stop() {
        //
    }
}

export const fromValue = <T>(initialState: T): ValueStore<T> => {
    return new ValueStore(initialState);
};
