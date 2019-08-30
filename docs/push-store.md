# Push-store

*Source: [src/store.ts](../src/push-store.ts)*

An implementation of [Store](store.md) with a very simple interface which allows you to push new state to the store.

## setState

Really the only thing a push-store adds to a `Store` is the `setState` method.
Using this method will set the state of the store to the given argument, and also notify subscribers of the new state.

```typescript
public setState(newState: T);
```
