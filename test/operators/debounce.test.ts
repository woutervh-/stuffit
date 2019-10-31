import * as chai from 'chai';
import * as sinon from 'sinon';
import { DebounceStore } from '../../src/operators/debounce';
import { PushStore } from '../../src/push-store';
import { counterSubscriber } from '../counter-subscriber';

describe('DebounceStore', () => {
    let clock: sinon.SinonFakeTimers;
    let source: PushStore<number>;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        source = new PushStore(0);
    });

    afterEach(() => {
        clock.restore();
    });

    describe('#subscribe', () => {
        it('Will notify subscribers of state changes after the timeout has passed.', () => {
            const store = new DebounceStore(source, 100);
            const subscription = store.compose(counterSubscriber);

            source.setState(1);
            chai.assert.strictEqual(subscription.count, 0);
            source.setState(2);
            chai.assert.strictEqual(subscription.count, 0);
            source.setState(3);
            chai.assert.strictEqual(subscription.count, 0);

            clock.tick(150);

            chai.assert.strictEqual(subscription.count, 1);
            source.setState(4);
            chai.assert.strictEqual(subscription.count, 1);

            clock.tick(150);

            chai.assert.strictEqual(subscription.count, 2);

            clock.tick(150);

            chai.assert.strictEqual(subscription.count, 2);
            source.setState(5);

            clock.tick(50);
            chai.assert.strictEqual(subscription.count, 2);

            clock.tick(100);
            chai.assert.strictEqual(subscription.count, 3);

            subscription.unsubscribe();
        });

        it('Will reset the timeout when a value arrives before the timeout.', () => {
            const store = new DebounceStore(source, 100);
            const subscription = store.compose(counterSubscriber);

            source.setState(1);
            clock.tick(50);
            source.setState(2);
            clock.tick(50);
            source.setState(3);
            clock.tick(50);
            source.setState(4);
            clock.tick(50);

            chai.assert.strictEqual(subscription.count, 0);

            clock.tick(100);

            chai.assert.strictEqual(subscription.count, 1);

            subscription.unsubscribe();
        });
    });
});
