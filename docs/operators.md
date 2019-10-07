# Stuffit Operators

Operators are (higher-order) functions that take one or more stores as input and produce a new store as output.
They can be applied as functions directly, or they can be used in combination with the [pipe](store.md#pipe) method of stores in order to make chaining easier.

## combine

*Lazy operator*

Combines multiple stores into a single result.
Whenever one of the source stores emits a new value, the combine operator will update its state and emit a new combination of all the source stores values.

*Example*

```typescript
import * as Stuffit from 'stuffit';

Stuffit.Operators
    .combine(
        // Emits a new value every 5 seconds: 0, 1, 2, ...
        Stuffit.Producers.fromInterval(5000),
        // Just emits 'a'.
        Stuffit.Producers.fromValue('a')
    )
    .subscribe(console.log);
    // Will log [0, 'a'], [1, 'a'], [2, 'a']...
```

## distinct (aliases: skip)

*Lazy operator*

Will only update the state and emit a new value when the value coming from the source store is distinct from its previous value.

*Example*

```typescript
import * as Stuffit from 'stuffit';

const store = new Stuffit.PushStore(0);

// Check for strict equality; there also is the operator Stuffit.Operators.distinctStrictEquality which is equivalent to this.
store
    .pipe(Stuffit.Operators.distinct((a, b) => a === b))
    .subscribe(console.log);

store.setState(0); // Nothing happens.
store.setState(1); // "1" will be logged.
store.setState(1); // Nothing happens.
```

## flatten

*Lazy operator*

Flattens nested stores.
If a store ("outer store") emits other stores ("inner stores") as its values, this operator will emit the values from the last seen "inner store".

*Example*

```typescript
import * as Stuffit from 'stuffit';

const outerStore = new Stuffit.PushStore(Stuffit.Producers.fromValue(0));
outerStore
    .pipe(Stuffit.Operators.flatten)
    .subscribe(console.log);

outerStore.setState(Stuffit.Producers.fromValue(10)); // "10" will be logged".
outerStore.setState(Stuffit.Producers.fromInterval(5000)); // Will log a number every 5 seconds: "0", "1", "2", ...
```

## history

*Lazy operator*

Keeps track of previous values emitted by the source.
The number of values it will remember can be specified as a parameter to the operator.
The most recent values are at the end of the array.

*Example*

```typescript
import * as Stuffit from 'stuffit';

// Emit a number every second: "0", "1", "2", ...
Stuffit.Producers.fromInterval(1000)
    // Keep track of the 5 most recent values from the source.
    .pipe(Stuffit.Operators.history(5))
    .subscribe(console.log);

// Will log the following:
// [undefined, undefined, undefined, undefined, 0]
// [undefined, undefined, undefined, 0, 1]
// [undefined, undefined, 0, 1, 2]
// [undefined, 0, 1, 2, 3]
// [0, 1, 2, 3, 4]
// [1, 2, 3, 4, 5]
// ...
```

## map

*Lazy operator*

Maps values from the source store using a project function.

*Example*

```typescript
import * as Stuffit from 'stuffit';

const store = new Stuffit.PushStore(0);
const mappedStore = store.pipe(Stuffit.Operators.map((value) => value * 2));

console.log(mappedStore.state); // Will log "0".
store.setState(1);
console.log(mappedStore.state); // WIll log "2".
```

## pick

*Lazy operator*

Will pick keys/values from the objects emitted by the source store.
Only the keys/values specified by the parameter to the pick operator will be included in the emitted value.

*Example*

```typescript
import * as Stuffit from 'stuffit';

const store = new Stuffit.PushStore({ first: 'John', last: 'Doe', phone: '012 345678' });
const pickedStore = store.pipe(Stuffit.Operators.pick('first', 'last'));
console.log(pickedStores.state); // Will log { first: 'John', last: 'Doe' }.
```

## pluck

*Lazy operator*

Take a single value from the objects emitted by the source store.
The given parameter is used as the key to choose the value from the objects.

*Example*

```typescript
import * as Stuffit from 'stuffit';

const store = new Stuffit.PushStore({ first: 'John', last: 'Doe' });

const plucked = store
    .pipe(Stuffit.Operators.pluck('first'));

console.log(plucked.state); // Will log "John".

plucked.subscribe(console.log);
store.setState({ first: 'Jane', last: 'Doe' }); // Will log "Jane".
```

## reduce

*Lazy operator*

Take an initial value and a reduce function and apply the reduce function as new values arrive from the source.

*Example*

```typescript
import * as Stuffit from 'stuffit';

const store = new Stuffit.PushStore(2);

const reduced = store
    .pipe(Stuffit.Operators.reduce((previous, next) => previous + next, 1));

console.log(reduced.state); // Will log "3" because initially the supplied initial value 1 and the initial source value 2 and reduced to 1 + 2.

store.setState(3);

console.log(reducer.state); // Will log "6".
```

## throttle

*Lazy operator*

Throttles the source store such that the throttled store will only update at most once during the timeout period specified by the parameter.
Trailing updates are remembered and will cause the throttled store to update.

*Example*

```typescript
import * as Stuffit from 'stuffit';

const store = new Stuffit.PushStore('first');

// Throttle to update only once every 10 milliseconds.
const throttled = Stuffit.Operators.throttle(10)(store);
throttled.subscribe(console.log);

store.setState('second'); // Will immediately log "second".
store.setState('third'); // Nothing happens.
store.setState('fourth'); // Nothing happens immediately, but after 10 milliseconds "fourth" will be logged.
```
