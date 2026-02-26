# [@observable/from](https://jsr.io/@observable/from)

Converts a custom [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a proper
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable). If the provided `value` is already
an instanceof [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) (which means it has
[`Observable.prototype`](https://jsr.io/@observable/core/doc/~/ObservableConstructor.prototype) in
its prototype chain), it's returned directly. Otherwise, a new
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) object is created that wraps the
original provided `value`.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { Observable } from "@observable/core";
import { from } from "@observable/from";

const observableInstance = new Observable((observer) => {
  // Implementation omitted for brevity.
});
const result = from(observableInstance);

result === observableInstance; // true
result instanceof Observable; // true
```

```ts
import { Observable } from "@observable/core";
import { from } from "@observable/from";

const customObservable: Observable = {
  subscribe(observer) {
    // Implementation omitted for brevity.
  },
};
const result = from(customObservable);

result === customObservable; // false
result instanceof Observable; // true
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/from from the @observable library ecosystem.

WHAT IT DOES:
`from(source)` converts a custom Observable (one that satisfies the Observable interface but isn't an instance of Observable) to a proper Observable instance. If the source is already an `instanceof Observable`, it returns it directly. Otherwise, it creates a new Observable that wraps the original source.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `from` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN (source is already an Observable instance):
```ts
import { Observable } from "@observable/core";
import { from } from "@observable/from";

const observableInstance = new Observable((observer) => {
  observer.next(1);
  observer.return();
});
const result = from(observableInstance);

result === observableInstance;  // true (returned directly)
result instanceof Observable;   // true
```

USAGE PATTERN (custom Observable object):
```ts
import { Observable } from "@observable/core";
import { from } from "@observable/from";

const customObservable: Observable<number> = {
  subscribe(observer) {
    observer.next(1);
    observer.return();
  },
};
const result = from(customObservable);

result === customObservable;    // false (wrapped in new Observable)
result instanceof Observable;   // true
```

IMPORTANT:
- Returns source directly if it's already an `instanceof Observable`
- Wraps source in a new Observable if it only satisfies the interface
- Useful for ensuring you have a true Observable instance with prototype methods
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
