# [@observable/distinct](https://jsr.io/@observable/distinct)

Only [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s values from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that are distinct from all previous
values.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { distinct } from "@observable/distinct";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe([1, 2, 2, 3, 1, 3], ofIterable(), distinct()).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// return
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/distinct from the @observable library ecosystem.

WHAT IT DOES:
`distinct()` only emits values that have never been emitted before (across the entire stream). Uses a Set internally to track seen values.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `distinct` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { distinct } from "@observable/distinct";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  pipe([1, 2, 2, 3, 1, 3, 4], ofIterable()),
  distinct()
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3, 4
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

BEHAVIOR:
- First occurrence of each value is emitted
- Subsequent duplicates are filtered out
- Comparison is based on value identity (like Set behavior)

SEE ALSO:
- `distinctUntilChanged()` — only filters consecutive duplicates
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
