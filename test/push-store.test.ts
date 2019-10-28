import * as assert from 'assert';
import { PushStore } from '../src/push-store';

describe('PushStore', () => {
    let store: PushStore<number>;

    describe('#constructor', () => {
        it('Initializes with the given state.', () => {
            store = new PushStore(42);
            assert.deepStrictEqual(42, store.state);
        });
    });

    describe('#setState', () => {
        it('Allows the state of the store to be set.', () => {
            store = new PushStore(0);
            assert.deepStrictEqual(store.state, 0);
            store.setState(1);
            assert.deepStrictEqual(store.state, 1);
            store.setState(2);
            assert.deepStrictEqual(store.state, 2);
        });
    });
});