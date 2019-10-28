import { Store } from '../store';

export class ValueStore<T> extends Store<T> { }

export const fromValue = <T>(initialState: T): ValueStore<T> => {
    return new ValueStore(initialState);
};
