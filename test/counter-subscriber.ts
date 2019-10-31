import { Store } from '../src/store';
import { Subscription } from '../src/subscription';

interface CounterSubscription extends Subscription {
    count: number;
}

interface CounterSubscriptionInternal extends CounterSubscription {
    subscription: Subscription | null;
    start(): void;
}

export const counterSubscriber = <T>(store: Store<T>): CounterSubscription => {
    const subscription: CounterSubscriptionInternal = {
        count: 0,
        subscription: null,
        start() {
            this.subscription = store.subscribe(() => this.count += 1);
        },
        unsubscribe() {
            this.subscription!.unsubscribe();
        }
    };
    subscription.start();
    return subscription;
};
