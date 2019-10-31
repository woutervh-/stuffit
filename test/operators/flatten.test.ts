import * as chai from 'chai';
import { FlattenStore } from '../../src/operators/flatten';
import { PushStore } from '../../src/push-store';
import { Store } from '../../src/store';
import { Subscription } from '../../src/subscription';

describe('FlattenStore', () => {
    let innerSource: PushStore<number>;
    let outerSource: PushStore<Store<number>>;

    beforeEach(() => {
        innerSource = new PushStore(0);
        outerSource = new PushStore(innerSource as Store<number>);
    });

    describe('#state', () => {
        it('Flattens the source to emit the inner source values.', () => {
            const store = new FlattenStore(outerSource);
            const subscription = store.subscribe();

            chai.assert.strictEqual(store.state, 0);
            innerSource.setState(1);
            chai.assert.strictEqual(store.state, 1);
            innerSource.setState(2);
            chai.assert.strictEqual(store.state, 2);

            subscription.unsubscribe();
        });

        it('Switches the inner source when the outer source is updated, only emitting values from the new inner source.', () => {
            const store = new FlattenStore(outerSource);
            const subscription = store.subscribe();

            innerSource.setState(1);
            chai.assert.strictEqual(store.state, 1);

            outerSource.setState(new PushStore(2));
            chai.assert.strictEqual(store.state, 2);
            outerSource.setState(new PushStore(3));
            chai.assert.strictEqual(store.state, 3);

            const newInnerSource = new PushStore(4);
            outerSource.setState(newInnerSource);
            chai.assert.strictEqual(store.state, 4);
            newInnerSource.setState(5);
            chai.assert.strictEqual(store.state, 5);

            subscription.unsubscribe();
        });

        it('Updates to any new inner or outer source changes when it is started.', () => {
            let subscription: Subscription;
            const store = new FlattenStore(outerSource);

            innerSource.setState(1);
            chai.assert.strictEqual(store.state, 0);
            innerSource.setState(2);
            chai.assert.strictEqual(store.state, 0);

            subscription = store.subscribe();
            chai.assert.strictEqual(store.state, 2);
            subscription.unsubscribe();

            outerSource.setState(new PushStore(3));
            chai.assert.strictEqual(store.state, 2);
            subscription = store.subscribe();
            chai.assert.strictEqual(store.state, 3);
            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Notifies the subscriber whenever the inner or outer source change state.', () => {
            let count = 0;
            const store = new FlattenStore(outerSource);
            const subscription = store.subscribe(() => count += 1);

            innerSource.setState(1);
            chai.assert.strictEqual(count, 1);

            outerSource.setState(new PushStore(2));
            chai.assert.strictEqual(count, 2);
            outerSource.setState(new PushStore(3));
            chai.assert.strictEqual(count, 3);

            const newInnerSource = new PushStore(4);
            outerSource.setState(newInnerSource);
            chai.assert.strictEqual(count, 4);
            newInnerSource.setState(5);
            chai.assert.strictEqual(count, 5);

            subscription.unsubscribe();
        });
    });
});
