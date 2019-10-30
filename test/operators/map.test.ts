import * as chai from 'chai';
import { MapStore } from '../../src/operators/map';
import { PushStore } from '../../src/push-store';

let source: PushStore<number>;

beforeEach(() => {
    source = new PushStore(0);
});

describe('MapStore', () => {
    describe('#state', () => {
        it('Maps the state using the given project function.', () => {
            const store = new MapStore(source, () => 42);
            const subscription = store.subscribe(() => { /**/ });
            chai.assert.strictEqual(store.state, 42);
            source.setState(1);
            chai.assert.strictEqual(store.state, 42);
            subscription.unsubscribe();
        });

        it('Passes the source state into the project function.', () => {
            const store = new MapStore(source, (input) => input);
            const subscription = store.subscribe(() => { /**/ });
            chai.assert.strictEqual(store.state, 0);
            source.setState(42);
            chai.assert.strictEqual(store.state, 42);
            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies subscribers when the underlying source has changed.', () => {
            let count = 0;
            const store = new MapStore(source, () => 42);
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
