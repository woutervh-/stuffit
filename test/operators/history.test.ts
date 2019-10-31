import * as chai from 'chai';
import { HistoryStore } from '../../src/operators/history';
import { PushStore } from '../../src/push-store';

describe('HistoryStore', () => {
    let source: PushStore<number>;

    beforeEach(() => {
        source = new PushStore(0);
    });

    describe('#state', () => {
        it('Holds the history of the source in its state up to a specified maximum frames.', () => {
            const store = new HistoryStore(source, 5);
            const subscription = store.subscribe();

            chai.assert.deepStrictEqual(store.state, [undefined, undefined, undefined, undefined, 0]);
            source.setState(1);
            chai.assert.deepStrictEqual(store.state, [undefined, undefined, undefined, 0, 1]);
            source.setState(2);
            chai.assert.deepStrictEqual(store.state, [undefined, undefined, 0, 1, 2]);
            source.setState(3);
            chai.assert.deepStrictEqual(store.state, [undefined, 0, 1, 2, 3]);
            source.setState(4);
            chai.assert.deepStrictEqual(store.state, [0, 1, 2, 3, 4]);
            source.setState(5);
            chai.assert.deepStrictEqual(store.state, [1, 2, 3, 4, 5]);

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Will notify subscribers whenever the source changes.', () => {
            let count = 0;
            const store = new HistoryStore(source, 5);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.strictEqual(count, 0);
            source.setState(1);
            chai.assert.strictEqual(count, 1);
            source.setState(2);
            chai.assert.strictEqual(count, 2);

            subscription.unsubscribe();
        });
    });
});
