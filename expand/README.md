# [@observable/expand](https://jsr.io/@observable/expand)

Recursively projects each [source](https://jsr.io/@observable/core#source) value to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { expand } from "@observable/expand";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";

const controller = new AbortController();

// Recursively double values until >= 16
pipe(
  [2],
  ofIterable(),
  expand((value) => value < 16 ? pipe([value * 2], ofIterable()) : empty),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "next" 4
// "next" 8
// "next" 16
// "return"
```

```ts
import { expand } from "@observable/expand";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";

interface Node {
  id: string;
  children: Node[];
}

const tree: Node = {
  id: "root",
  children: [
    { id: "a", children: [{ id: "a1", children: [] }] },
    { id: "b", children: [] },
  ],
};

const controller = new AbortController();

pipe(
  [tree],
  ofIterable(),
  expand((node) => node.children.length ? pipe(node.children, ofIterable()) : empty),
).subscribe({
  signal: controller.signal,
  next: (node) => console.log("visited", node.id),
  return: () => console.log("done"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "visited" "root"
// "visited" "a"
// "visited" "a1"
// "visited" "b"
// "done"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/expand from the @observable library ecosystem.

WHAT IT DOES:
`expand(project)` recursively projects each value to an Observable:
1. Emits the source value
2. Projects it to an inner Observable
3. Emits values from the inner Observable
4. Recursively projects those values too
5. Continues until all inner Observables return

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `expand` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { expand } from "@observable/expand";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";

const controller = new AbortController();

// Recursively double until >= 16
pipe(
  [2],
  ofIterable(),
  expand((value) => value < 16 ? pipe([value * 2], ofIterable()) : empty)
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 2, 4, 8, 16
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

RECURSIVE EXPANSION:
Each emitted value is projected and the results are recursively expanded:
```ts
// Source: [1]
// 1 -> project(1) -> [2]
// 2 -> project(2) -> [4]
// 4 -> project(4) -> empty
// Output: 1, 2, 4
```

INDEX PARAMETER:
The project function receives an index that increments for every value processed:
```ts
expand((value, index) => {
  console.log(index);  // 0, 1, 2, 3, ...
  return project(value);
})
```

WHEN TO USE:
- Tree/graph traversal
- Recursive data structures
- Pagination (fetch page, then fetch next page from result)
- Any recursive expansion pattern

SEE ALSO:
- `mergeMap` — projects each value to Observable, subscribes concurrently (non-recursive)
- `flatMap` — projects each value to Observable, subscribes sequentially (non-recursive)
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
