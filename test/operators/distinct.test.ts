import * as chai from 'chai';
import { DistinctStore } from '../../src/operators/distinct';
import { PushStore } from '../../src/push-store';

describe('DistinctStore', () => {
    let source: PushStore<number>;

    beforeEach(() => {
        source = new PushStore(0);
    });

    describe('#state', () => {
        it('Copies the state of the input source.', () => {
            const store = new DistinctStore(source, (previous, next) => previous === next);
            const subscription = store.subscribe();

            chai.assert.strictEqual(store.state, 0);
            source.setState(1);
            chai.assert.strictEqual(store.state, 1);
            source.setState(2);
            chai.assert.strictEqual(store.state, 2);

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Only emits state changes when the source state and the current state do not pass the equality test.', () => {
            let count = 0;
            const store = new DistinctStore(source, (previous, next) => previous === next);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.strictEqual(count, 0);
            source.setState(0);
            chai.assert.strictEqual(count, 0);
            source.setState(1);
            chai.assert.strictEqual(count, 1);
            source.setState(1);
            chai.assert.strictEqual(count, 1);
            source.setState(2);
            chai.assert.strictEqual(count, 2);
            source.setState(3);
            chai.assert.strictEqual(count, 3);
            source.setState(3);
            chai.assert.strictEqual(count, 3);

            subscription.unsubscribe();
        });
    });
});
