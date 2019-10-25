export interface Subscription {
    unsubscribe(): void;
    activate(): void;
    deactivate(): void;
}
