import * as chai from 'chai';
import * as sinon from 'sinon';
import { DebounceStore } from '../../src/operators/debounce';
import { PushStore } from '../../src/push-store';

let clock: sinon.SinonFakeTimers;
let source: PushStore<number>;

beforeEach(() => {
    clock = sinon.useFakeTimers();
    source = new PushStore(0);
});

afterEach(() => {
    clock.restore();
});

describe('DebounceStore', () => {
    describe('#subscribe', () => {
        it('Will notify subscribers of state changes after the timeout has passed.', () => {
            let count = 0;
            const store = new DebounceStore(source, 100);
            const subscription = store.subscribe(() => count += 1);

            source.setState(1);
            chai.assert.strictEqual(count, 0);
            source.setState(2);
            chai.assert.strictEqual(count, 0);
            source.setState(3);
            chai.assert.strictEqual(count, 0);

            clock.tick(150);

            chai.assert.strictEqual(count, 1);
            source.setState(4);
            chai.assert.strictEqual(count, 1);

            clock.tick(150);

            chai.assert.strictEqual(count, 2);

            clock.tick(150);

            chai.assert.strictEqual(count, 2);
            source.setState(5);

            clock.tick(50);
            chai.assert.strictEqual(count, 2);

            clock.tick(100);
            chai.assert.strictEqual(count, 3);

            subscription.unsubscribe();
        });

        it('Will reset the timeout when a value arrives before the timeout.', () => {
            let count = 0;
            const store = new DebounceStore(source, 100);
            const subscription = store.subscribe(() => count += 1);

            source.setState(1);
            clock.tick(50);
            source.setState(2);
            clock.tick(50);
            source.setState(3);
            clock.tick(50);
            source.setState(4);
            clock.tick(50);

            chai.assert.strictEqual(count, 0);

            clock.tick(100);

            chai.assert.strictEqual(count, 1);

            subscription.unsubscribe();
        });
    });
});
