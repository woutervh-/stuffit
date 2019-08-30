# Subscription

A simple interface with a single function that allows the subscriber to stop its subscription.

```typescript
interface Subscription {
    unsubscribe: () => void;
}
```
