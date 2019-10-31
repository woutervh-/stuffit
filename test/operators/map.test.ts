import * as chai from 'chai';
import { MapStore } from '../../src/operators/map';
import { PushStore } from '../../src/push-store';
import { counterSubscriber } from '../counter-subscriber';

describe('MapStore', () => {
    let source: PushStore<number>;

    beforeEach(() => {
        source = new PushStore(0);
    });

    describe('#state', () => {
        it('Maps the state using the given project function.', () => {
            const store = new MapStore(source, () => 42);
            const subscription = store.subscribe();
            chai.assert.strictEqual(store.state, 42);
            source.setState(1);
            chai.assert.strictEqual(store.state, 42);
            subscription.unsubscribe();
        });

        it('Passes the source state into the project function.', () => {
            const store = new MapStore(source, (input) => input);
            const subscription = store.subscribe();
            chai.assert.strictEqual(store.state, 0);
            source.setState(42);
            chai.assert.strictEqual(store.state, 42);
            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies subscribers when the underlying source has changed.', () => {
            const store = new MapStore(source, () => 42);
            const subscription = store.compose(counterSubscriber);

            chai.assert.strictEqual(subscription.count, 0);
            source.setState(1);
            chai.assert.strictEqual(subscription.count, 1);
            source.setState(2);
            chai.assert.strictEqual(subscription.count, 2);
            source.setState(2);
            chai.assert.strictEqual(subscription.count, 3);

            subscription.unsubscribe();
        });
    });
});
