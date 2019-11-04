import * as chai from 'chai';
import { ObjectSplitPropertiesStore } from '../../src/operators/object-split-properties';
import { PushStore } from '../../src/push-store';
import { Store } from '../../src/store';
import { counterSubscriber } from '../counter-subscriber';

describe('ObjectSplitPropertiesStore', () => {
    let source: PushStore<{ zero?: number, one?: number, two?: number }>;

    beforeEach(() => {
        source = new PushStore<(typeof source)['state']>({
            zero: 0,
            one: 1,
            two: 2
        });
    });

    describe('#state', () => {
        it('Initially starts with sources that match the initial state.', () => {
            const store = new ObjectSplitPropertiesStore(source);

            chai.assert.instanceOf(store.state.zero!, Store);
            chai.assert.instanceOf(store.state.one!, Store);
            chai.assert.instanceOf(store.state.two!, Store);
            chai.assert.strictEqual(store.state.zero!.state, 0);
            chai.assert.strictEqual(store.state.one!.state, 1);
            chai.assert.strictEqual(store.state.two!.state, 2);
        });

        it('Updates each store with the correct values when the source changes.', () => {
            const store = new ObjectSplitPropertiesStore(source);
            const subscription = store.subscribe();

            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.strictEqual(store.state.zero!.state, 3);
            chai.assert.strictEqual(store.state.one!.state, 4);
            chai.assert.strictEqual(store.state.two!.state, 5);

            source.setState({ zero: 3, one: 4, two: 8 });
            chai.assert.strictEqual(store.state.zero!.state, 3);
            chai.assert.strictEqual(store.state.one!.state, 4);
            chai.assert.strictEqual(store.state.two!.state, 8);

            source.setState({ zero: 3, one: 4 });
            chai.assert.strictEqual(store.state.zero!.state, 3);
            chai.assert.strictEqual(store.state.one!.state, 4);

            source.setState({ zero: 3, one: 4, two: 11 });
            chai.assert.strictEqual(store.state.zero!.state, 3);
            chai.assert.strictEqual(store.state.one!.state, 4);
            chai.assert.strictEqual(store.state.two!.state, 11);

            subscription.unsubscribe();
        });

        it('Keeps existing stores identical until they are not needed.', () => {
            const store = new ObjectSplitPropertiesStore(source);
            const subscription = store.subscribe();

            const zero = store.state.zero;
            const one = store.state.one;
            const two = store.state.two;

            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.strictEqual(store.state.zero!, zero);
            chai.assert.strictEqual(store.state.one!, one);
            chai.assert.strictEqual(store.state.two!, two);

            source.setState({ zero: 3, one: 4, two: 8 });
            chai.assert.strictEqual(store.state.zero!, zero);
            chai.assert.strictEqual(store.state.one!, one);
            chai.assert.strictEqual(store.state.two!, two);

            source.setState({ zero: 3, one: 4 });
            chai.assert.strictEqual(store.state.zero!, zero);
            chai.assert.strictEqual(store.state.one!, one);
            chai.assert.strictEqual(store.state.two, undefined);

            source.setState({ zero: 3, one: 4, two: 11 });
            chai.assert.strictEqual(store.state.zero!, zero);
            chai.assert.strictEqual(store.state.one!, one);
            chai.assert.notStrictEqual(store.state.two!, two);

            subscription.unsubscribe();
        });

        it('Only updates the individual stores when the source changes their respective values.', () => {
            const store = new ObjectSplitPropertiesStore(source);
            const subscription = store.subscribe();

            const zeroSubscription = store.state.zero!.compose(counterSubscriber);
            const oneSubscription = store.state.one!.compose(counterSubscriber);
            const twoSubscription = store.state.two!.compose(counterSubscriber);

            chai.assert.strictEqual(zeroSubscription.count, 0);
            chai.assert.strictEqual(oneSubscription.count, 0);
            chai.assert.strictEqual(twoSubscription.count, 0);

            source.setState({ zero: 0, one: 1, two: 5 });
            chai.assert.strictEqual(zeroSubscription.count, 0);
            chai.assert.strictEqual(oneSubscription.count, 0);
            chai.assert.strictEqual(twoSubscription.count, 1);

            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.strictEqual(zeroSubscription.count, 1);
            chai.assert.strictEqual(oneSubscription.count, 1);
            chai.assert.strictEqual(twoSubscription.count, 1);

            source.setState({ zero: 6, one: 4, two: 8 });
            chai.assert.strictEqual(zeroSubscription.count, 2);
            chai.assert.strictEqual(oneSubscription.count, 1);
            chai.assert.strictEqual(twoSubscription.count, 2);

            subscription.unsubscribe();
            zeroSubscription.unsubscribe();
            oneSubscription.unsubscribe();
            twoSubscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies the subscriber when one of the properties are removed or when a new property is added.', () => {
            const store = new ObjectSplitPropertiesStore(source);
            const subscription = store.compose(counterSubscriber);

            chai.assert.strictEqual(subscription.count, 0);
            source.setState({ zero: 3, one: 4 });
            chai.assert.strictEqual(subscription.count, 1);
            source.setState({ zero: 6 });
            chai.assert.strictEqual(subscription.count, 2);
            source.setState({ zero: 6, one: 7, two: 8 });
            chai.assert.strictEqual(subscription.count, 3);

            subscription.unsubscribe();
        });

        it('Does not notify the subscriber when only the values of the object change.', () => {
            const store = new ObjectSplitPropertiesStore(source);
            const subscription = store.compose(counterSubscriber);

            chai.assert.strictEqual(subscription.count, 0);
            source.setState({ zero: 0, one: 1, two: 2 });
            chai.assert.strictEqual(subscription.count, 0);
            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.strictEqual(subscription.count, 0);

            source.setState({ zero: 3, one: 4 });
            chai.assert.strictEqual(subscription.count, 1);
            source.setState({ zero: 6, one: 7 });
            chai.assert.strictEqual(subscription.count, 1);

            subscription.unsubscribe();
        });

        it('Updates to the most recent state when the store is started.', () => {
            const store = new ObjectSplitPropertiesStore(source);

            source.setState({ zero: 3, one: 4, two: 5 });
            chai.assert.strictEqual(store.state.zero!.state, 0);
            chai.assert.strictEqual(store.state.one!.state, 1);
            chai.assert.strictEqual(store.state.two!.state, 2);

            const subscription = store.subscribe();
            chai.assert.strictEqual(store.state.zero!.state, 3);
            chai.assert.strictEqual(store.state.one!.state, 4);
            chai.assert.strictEqual(store.state.two!.state, 5);

            subscription.unsubscribe();
        });

        it('Keeps the same value stores during starting/stopping the store.', () => {
            const store = new ObjectSplitPropertiesStore(source);

            const zero = store.state.zero;
            const one = store.state.one;
            const two = store.state.two;

            source.setState({ zero: 3, one: 4, two: 5 });
            const subscription = store.subscribe();

            chai.assert.strictEqual(store.state.zero!, zero);
            chai.assert.strictEqual(store.state.one!, one);
            chai.assert.strictEqual(store.state.two!, two);

            subscription.unsubscribe();
        });
    });
});
