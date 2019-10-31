import * as chai from 'chai';
import { ObjectCombinePropertiesStore } from '../../src/operators/object-combine-properties';
import { PushStore } from '../../src/push-store';
import { Store } from '../../src/store';
import { counterSubscriber } from '../counter-subscriber';
// import { counterSubscriber } from '../counter-subscriber';

describe('ObjectCombinePropertiesStore', () => {
    let source: PushStore<{ zero?: Store<number>, one?: Store<number>, two?: Store<number> }>;
    let zeroRemainderSource: PushStore<number>;
    let oneRemainderSource: PushStore<number>;
    let twoRemainderSource: PushStore<number>;

    beforeEach(() => {
        zeroRemainderSource = new PushStore(0);
        oneRemainderSource = new PushStore(1);
        twoRemainderSource = new PushStore(2);
        source = new PushStore<{ zero?: Store<number>, one?: Store<number>, two?: Store<number> }>({
            zero: zeroRemainderSource,
            one: oneRemainderSource,
            two: twoRemainderSource
        });
    });

    describe('#state', () => {
        it('Initially starts with an array of the state of each store.', () => {
            const store = new ObjectCombinePropertiesStore(source);
            chai.assert.deepStrictEqual(store.state, { zero: 0, one: 1, two: 2 });
        });

        it('Updates the properties when a source updates its state.', () => {
            const store = new ObjectCombinePropertiesStore(source);
            const subscription = store.subscribe();

            zeroRemainderSource.setState(3);
            chai.assert.deepStrictEqual(store.state, { zero: 3, one: 1, two: 2 });
            oneRemainderSource.setState(4);
            chai.assert.deepStrictEqual(store.state, { zero: 3, one: 4, two: 2 });
            twoRemainderSource.setState(5);
            chai.assert.deepStrictEqual(store.state, { zero: 3, one: 4, two: 5 });

            subscription.unsubscribe();
        });

        it('Updates the properties when the main source updates its state.', () => {
            const store = new ObjectCombinePropertiesStore(source);
            const subscription = store.subscribe();

            source.setState({ zero: zeroRemainderSource, one: oneRemainderSource });
            chai.assert.deepStrictEqual(store.state, { zero: 0, one: 1 });
            source.setState({ zero: zeroRemainderSource });
            chai.assert.deepStrictEqual(store.state, { zero: 0 });
            source.setState({});
            chai.assert.deepStrictEqual(store.state, {});
            zeroRemainderSource.setState(4);
            chai.assert.deepStrictEqual(store.state, {});
            source.setState({ zero: zeroRemainderSource });
            chai.assert.deepStrictEqual(store.state, { zero: 4 });

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Does not update when a previously used store changes state.', () => {
            const store = new ObjectCombinePropertiesStore(source);
            const subscription = store.compose(counterSubscriber);

            source.setState({ zero: zeroRemainderSource, one: oneRemainderSource });
            chai.assert.strictEqual(subscription.count, 1);
            twoRemainderSource.setState(5);
            chai.assert.strictEqual(subscription.count, 1);
            source.setState({ zero: zeroRemainderSource, two: twoRemainderSource });
            chai.assert.strictEqual(subscription.count, 2);
            twoRemainderSource.setState(8);
            chai.assert.strictEqual(subscription.count, 3);

            subscription.unsubscribe();
        });

        it('Updates to the most current state when it is started.', () => {
            const store = new ObjectCombinePropertiesStore(source);

            chai.assert.deepStrictEqual(store.state, { zero: 0, one: 1, two: 2 });
            twoRemainderSource.setState(5);
            chai.assert.deepStrictEqual(store.state, { zero: 0, one: 1, two: 2 });

            const subscription = store.subscribe();
            chai.assert.deepStrictEqual(store.state, { zero: 0, one: 1, two: 5 });

            subscription.unsubscribe();
        });
    });
});
