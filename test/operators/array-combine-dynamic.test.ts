import * as chai from 'chai';
import { ArrayCombineDynamicStore } from '../../src/operators/array-combine-dynamic';
import { PushStore } from '../../src/push-store';
import { Store } from '../../src/store';
import { counterSubscriber } from '../counter-subscriber';

describe('ArrayCombineDynamicStore', () => {
    let source: PushStore<Store<number>[]>;
    let zeroRemainderSource: PushStore<number>;
    let oneRemainderSource: PushStore<number>;
    let twoRemainderSource: PushStore<number>;

    beforeEach(() => {
        zeroRemainderSource = new PushStore(0);
        oneRemainderSource = new PushStore(1);
        twoRemainderSource = new PushStore(2);
        source = new PushStore<Store<number>[]>([zeroRemainderSource, oneRemainderSource, twoRemainderSource]);
    });

    describe('#state', () => {
        it('Initially starts with an array of the state of each store.', () => {
            const store = new ArrayCombineDynamicStore(source);
            chai.assert.deepStrictEqual(store.state, [0, 1, 2]);
        });

        it('Updates the array whenever one of the sources changes state.', () => {
            const store = new ArrayCombineDynamicStore(source);
            const subscription = store.subscribe();

            zeroRemainderSource.setState(3);
            chai.assert.deepStrictEqual(store.state, [3, 1, 2]);
            zeroRemainderSource.setState(6);
            chai.assert.deepStrictEqual(store.state, [6, 1, 2]);
            oneRemainderSource.setState(4);
            chai.assert.deepStrictEqual(store.state, [6, 4, 2]);
            twoRemainderSource.setState(5);
            chai.assert.deepStrictEqual(store.state, [6, 4, 5]);

            subscription.unsubscribe();
        });

        it('Updates the array when the main source changes its sources.', () => {
            const store = new ArrayCombineDynamicStore(source);
            const subscription = store.subscribe();

            source.setState([zeroRemainderSource, oneRemainderSource]);
            chai.assert.deepStrictEqual(store.state, [0, 1]);
            source.setState([zeroRemainderSource, twoRemainderSource]);
            chai.assert.deepStrictEqual(store.state, [0, 2]);
            source.setState([twoRemainderSource, zeroRemainderSource]);
            chai.assert.deepStrictEqual(store.state, [2, 0]);
            twoRemainderSource.setState(5);
            chai.assert.deepStrictEqual(store.state, [5, 0]);

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Does not update when a previously used store updates its state.', () => {
            const store = new ArrayCombineDynamicStore(source);
            const subscription = store.compose(counterSubscriber);

            chai.assert.strictEqual(subscription.count, 0);
            source.setState([zeroRemainderSource, oneRemainderSource]);
            chai.assert.strictEqual(subscription.count, 1);
            oneRemainderSource.setState(4);
            chai.assert.strictEqual(subscription.count, 2);
            twoRemainderSource.setState(5);
            chai.assert.strictEqual(subscription.count, 2);

            subscription.unsubscribe();
        });
    });
});
