# [@observable/distinct-until-changed](https://jsr.io/@observable/distinct-until-changed)

Only [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s values from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that are distinct from the previous
value according to a specified {@linkcode comparator} or `Object.is` if one is not provided.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { distinctUntilChanged } from "@observable/distinct-until-changed";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 1, 1, 2, 2, 3]), distinctUntilChanged()).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (value) => console.log(value),
});

// Console output:
// 1
// 2
// 3
// return
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/distinct-until-changed from the @observable library ecosystem.

WHAT IT DOES:
`distinctUntilChanged(comparator?)` only emits when the current value is different from the previous value. Uses `Object.is` by default, or a custom comparator if provided.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `distinctUntilChanged` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { distinctUntilChanged } from "@observable/distinct-until-changed";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  of([1, 1, 1, 2, 2, 3, 1]),  // Note: 1 repeats at end
  distinctUntilChanged()
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3, 1
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WITH CUSTOM COMPARATOR:
```ts
pipe(
  of([{ id: 1 }, { id: 1 }, { id: 2 }]),
  distinctUntilChanged((a, b) => a.id === b.id)
).subscribe({ ... });  // { id: 1 }, { id: 2 }
```

DIFFERENCE FROM `distinct()`:
- `distinct()` — filters ALL duplicates ever seen
- `distinctUntilChanged()` — only filters CONSECUTIVE duplicates

SEE ALSO:
- `distinct()` — filters all duplicates across the stream
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
