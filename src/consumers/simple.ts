import { Sink } from '../sink';
import { Store } from '../store';

export class SimpleSink<T> extends Sink<T> {
    private listener: (value: T) => void;

    public constructor(source: Store<T>, listener: (value: T) => void) {
        super(source);
        this.listener = listener;
    }

    protected handleNext(value: T) {
        this.listener(value);
    }
}

export const simple = <T>(listener: (value: T) => void) => (source: Store<T>): SimpleSink<T> => {
    return new SimpleSink(source, listener);
};
