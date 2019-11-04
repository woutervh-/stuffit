import * as chai from 'chai';
import { PickStore } from '../../src/operators/pick';
import { PushStore } from '../../src/push-store';
import { counterSubscriber } from '../counter-subscriber';

describe('PickStore', () => {
    let source: PushStore<{ x: number, y: number }>;

    beforeEach(() => {
        source = new PushStore({ x: 0, y: 0 });
    });

    describe('#state', () => {
        it('Plucks the input object on the given key', () => {
            const store = new PickStore(source, ['x']);
            const subscription = store.subscribe();

            chai.assert.deepStrictEqual(store.state, { x: 0 });
            source.setState({ x: 1, y: 0 });
            chai.assert.deepStrictEqual(store.state, { x: 1 });
            source.setState({ x: 1, y: 1 });
            chai.assert.deepStrictEqual(store.state, { x: 1 });
            source.setState({ x: 2, y: 2 });
            chai.assert.deepStrictEqual(store.state, { x: 2 });

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies the subscriber every time the source changes state.', () => {
            const store = new PickStore(source, ['x']);
            const subscription = store.compose(counterSubscriber);

            chai.assert.strictEqual(subscription.count, 0);
            source.setState({ x: 0, y: 0 });
            chai.assert.strictEqual(subscription.count, 1);

            subscription.unsubscribe();
        });
    });
});
