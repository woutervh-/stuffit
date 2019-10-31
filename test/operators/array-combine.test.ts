import * as chai from 'chai';
import { ArrayCombineStore } from '../../src/operators/array-combine';
import { PushStore } from '../../src/push-store';
import { counterSubscriber } from '../counter-subscriber';

describe('ArrayCombineStore', () => {
    let evenSource: PushStore<number>;
    let oddSource: PushStore<number>;

    beforeEach(() => {
        evenSource = new PushStore(0);
        oddSource = new PushStore(1);
    });

    describe('#state', () => {
        it('Copies all the states of the sources and combines them into an array.', () => {
            const store = new ArrayCombineStore([evenSource, oddSource]);
            const subscription = store.subscribe();

            chai.assert.deepStrictEqual(store.state, [0, 1]);
            evenSource.setState(2);
            chai.assert.deepStrictEqual(store.state, [2, 1]);
            oddSource.setState(3);
            chai.assert.deepStrictEqual(store.state, [2, 3]);

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies the subscriber whenever one of the underlying sources changes state.', () => {
            const store = new ArrayCombineStore([evenSource, oddSource]);
            const subscription = store.compose(counterSubscriber);

            chai.assert.deepStrictEqual(subscription.count, 0);
            evenSource.setState(2);
            chai.assert.deepStrictEqual(subscription.count, 1);
            oddSource.setState(3);
            chai.assert.deepStrictEqual(subscription.count, 2);
            oddSource.setState(5);
            chai.assert.deepStrictEqual(subscription.count, 3);

            subscription.unsubscribe();
        });
    });
});
