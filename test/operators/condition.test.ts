import * as chai from 'chai';
import { ConditionalStore } from '../../src/operators/conditional';
import { PushStore } from '../../src/push-store';

describe('ConditionalStore', () => {
    let ifSource: PushStore<number>;
    let elseSource: PushStore<number>;
    let source: PushStore<boolean>;

    beforeEach(() => {
        ifSource = new PushStore(0);
        elseSource = new PushStore(1);
        source = new PushStore<boolean>(true);
    });

    describe('#state', () => {
        it('Switches to the the if- or else-source dependending on the outcome of the boolean source.', () => {
            const store = new ConditionalStore(source, ifSource, elseSource);
            const subscription = store.subscribe();

            chai.assert.strictEqual(store.state, 0);
            source.setState(false);
            chai.assert.strictEqual(store.state, 1);
            source.setState(true);
            chai.assert.strictEqual(store.state, 0);
            source.setState(false);
            chai.assert.strictEqual(store.state, 1);

            subscription.unsubscribe();
        });

        it('Copies the current branch source changes to the state.', () => {
            const store = new ConditionalStore(source, ifSource, elseSource);
            const subscription = store.subscribe();

            chai.assert.strictEqual(store.state, 0);
            ifSource.setState(2);
            chai.assert.strictEqual(store.state, 2);
            ifSource.setState(4);
            chai.assert.strictEqual(store.state, 4);

            subscription.unsubscribe();
        });
    });

    describe('#subscribe', () => {
        it('Triggers notifications when either the boolean source or the active branch emits new values.', () => {
            let count = 0;
            const store = new ConditionalStore(source, ifSource, elseSource);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.strictEqual(count, 0);
            source.setState(false);
            chai.assert.strictEqual(count, 1);
            elseSource.setState(3);
            chai.assert.strictEqual(count, 2);

            subscription.unsubscribe();
        });

        it('Does not trigger notification if the boolean source emits subsequent identical values.', () => {
            let count = 0;
            const store = new ConditionalStore(source, ifSource, elseSource);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.strictEqual(count, 0);
            source.setState(false);
            chai.assert.strictEqual(count, 1);
            source.setState(false);
            chai.assert.strictEqual(count, 1);

            subscription.unsubscribe();
        });

        it('Does not trigger notification if the branch which is inactive changes state.', () => {
            let count = 0;
            const store = new ConditionalStore(source, ifSource, elseSource);
            const subscription = store.subscribe(() => count += 1);

            chai.assert.strictEqual(count, 0);
            source.setState(false);
            chai.assert.strictEqual(count, 1);
            ifSource.setState(2);
            chai.assert.strictEqual(count, 1);

            subscription.unsubscribe();
        });
    });
});
