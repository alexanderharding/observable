# [@observable/for-in](https://jsr.io/@observable/for-in)

[Pushes](https://jsr.io/@observable/core#push) each key of the given
[`object`](https://jsr.io/@observable/for-in/doc/~/forIn#function_forin_0_parameter_object) in
order.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { forIn } from "@observable/for-in";

const controller = new AbortController();
const object = { a: 1, b: 2, c: 3 } as const;

forIn(object).subscribe({
  signal: controller.signal,
  next: (key) => console.log("next", key, object[key]),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" "a" 1
// "next" "b" 2
// "next" "c" 3
// "return"
```

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/for-in from the @observable library ecosystem.

WHAT IT DOES:
`forIn(object)` creates an Observable that synchronously emits each enumerable key of the given object in order, then calls `return()`. It's the Observable analog of the `for...in` loop, but it only emits OWN keys (like `Object.keys`), not inherited ones.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Emits KEYS, not values; look the value up on the object yourself if needed
- Use `for-of` to emit values from an Iterable (Array, Set, Map, etc.)

CORRECT USAGE:
```ts
import { forIn } from "@observable/for-in";

const controller = new AbortController();
const object = { a: 1, b: 2, c: 3 } as const;

forIn(object).subscribe({
  signal: controller.signal,
  next: (key) => console.log(key, object[key]),  // "a" 1, "b" 2, "c" 3
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WRONG USAGE:
```ts
// ✗ WRONG: forIn emits keys, not values
forIn({ a: 1, b: 2 }).subscribe({
  next: (value) => console.log(value),  // logs "a", "b" — NOT 1, 2
});

// ✗ For Array/Iterable values, use @observable/for-of
forIn([10, 20, 30])  // emits "0", "1", "2" (string keys), not 10, 20, 30
```

SEE ALSO:
- `for-of` — emits each value of an Iterable
- `of(value)` — emits a single value
````

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
