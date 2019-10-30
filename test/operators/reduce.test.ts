import * as chai from 'chai';
import { ReduceStore } from '../../src/operators/reduce';
import { PushStore } from '../../src/push-store';

let source: PushStore<number>;

beforeEach(() => {
    source = new PushStore(1);
});

describe('ReduceStore', () => {
    describe('#state', () => {
        it('Reduces over the source states starting with the initial state.', () => {
            const store = new ReduceStore(source, (sum, value) => sum + value, 0);
            const subscription = store.subscribe();
            chai.assert.strictEqual(store.state, 1);
            source.setState(2);
            chai.assert.strictEqual(store.state, 3);
            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies subscribers when the underlying source has changed.', () => {
            let count = 0;
            const store = new ReduceStore(source, (sum, value) => sum + value, 0);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.strictEqual(count, 0);
            source.setState(1);
            chai.assert.strictEqual(count, 1);
            source.setState(2);
            chai.assert.strictEqual(count, 2);
            source.setState(2);
            chai.assert.strictEqual(count, 3);

            subscription.unsubscribe();
        });
    });
});
