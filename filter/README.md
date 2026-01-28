# [@observable/filter](https://jsr.io/@observable/filter)

Filters [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
[source](https://jsr.io/@observable/core#source) that satisfy a specified predicate.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { filter } from "@observable/filter";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe([1, 2, 3, 4, 5], ofIterable(), filter((value) => value % 2 === 0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "next" 4
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/filter from the @observable library ecosystem.

WHAT IT DOES:
`filter()` only emits values from the source that satisfy the specified predicate function.

CRITICAL: This library is NOT RxJS. Key differences:
- `filter` is a standalone function used with `pipe()` — NOT a method on Observable
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { filter } from "@observable/filter";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  pipe([1, 2, 3, 4, 5], ofIterable()),
  filter((value) => value % 2 === 0)
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 2, 4
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WRONG USAGE:
```ts
// ✗ WRONG: filter is NOT a method on Observable
pipe([1, 2, 3], ofIterable()).filter(x => x > 1)  // This does NOT work!
```

TYPE NARROWING:
The predicate can be a type guard for type narrowing:
```ts
pipe(
  pipe([1, "a", 2, "b"], ofIterable()),
  filter((x): x is number => typeof x === "number"),
).subscribe({ ... });  // TypeScript knows values are numbers
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
