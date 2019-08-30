# Producers

In the world of stores, producers create data.
Whenever new data is available, the producer will emit a state change and update the state of the store it implements with the new value.

## fromInterval

*Lazy producer*

Emits incrementally increasing numbers at a regular interval while subscribed to.
As it is a lazy producer, the incremental increase is stopped when the store is in a deactivated state.

*Example*

```typescript
import * as Stuffit from 'stuffit';

// Once subscribed to, this store will emit increasing numbers every 5 seconds.
// The initial state is 0; the subsequent state changes will produce the values 1, 2, 3...
const intervalStore = Stuffit.Producers.fromInterval(5000);
```

## fromPromise

*Eager producer*

Takes a promise and transforms the state and data from the promise into an object.
Initially the state of this store will be a **pending** state.
Then, after the promise resolves, the store will change to a **fulfilled** state containing the resolved value.
Otherwise, if the promise rejects, the store will change to a **rejected** state containing the rejected error.

*Example*

```typescript
import * as Stuffit from 'stuffit';

// Create a store from a promise:
const fetchStore = Stuffit.Producers.fromPromise(fetch('http://example.org'));
// Initially the state will be "pending".
// Then the state either becomes "fulfilled" or "rejected" depending on the result of the promise.
fetchStore.subscribe((promiseResult) => {
    if (promiseResult.status === 'pending') {
        // Render a progress bar...
    } else if (promiseResult.status === 'rejected') {
        // Render an error message with `promiseResult.error`
    } else {
        // Do something with the result in `promiseResult.result`
    }
});
```

## fromValue

*Lazy producer*

A simple producer which only accepts some initial state and stays at that state indefinitely.
It doesn't do much, but can be useful in some situations.

*Example*

```typescript
import * as Stuffit from 'stuffit';

const valueStore = Stuffit.Producers.fromValue(42);
// The store's initial state is 42 and it will never emit a state change.
```
