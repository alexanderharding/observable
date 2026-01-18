# [@observable/distinct-until-changed](https://jsr.io/@observable/distinct-until-changed)

Only [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s values from the
[source](https://jsr.io/@observable/core#source) that are distinct from the previous value according
to a specified comparator or `Object.is` if one is not provided.

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

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
