import * as chai from 'chai';
import { PluckStore } from '../../src/operators/pluck';
import { PushStore } from '../../src/push-store';

let source: PushStore<{ x: number }>;

beforeEach(() => {
    source = new PushStore({ x: 0 });
});

describe('PluckStore', () => {
    describe('#state', () => {
        it('Plucks the input object on the given key', () => {
            const store = new PluckStore(source, 'x');
            const subscription = store.subscribe(() => { /**/ });

            chai.assert.strictEqual(store.state, 0);
            source.setState({ x: 1 });
            chai.assert.strictEqual(store.state, 1);
            source.setState({ x: 2 });
            chai.assert.strictEqual(store.state, 2);

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Will update its state to the latest version of the source when starting.', () => {
            const store = new PluckStore(source, 'x');

            chai.assert.strictEqual(store.state, 0);
            source.setState({ x: 1 });
            chai.assert.strictEqual(store.state, 0);

            const subscription = store.subscribe(() => { /**/ });
            chai.assert.strictEqual(store.state, 1);

            subscription.unsubscribe();
        });
    });
});
