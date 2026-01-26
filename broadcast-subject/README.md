# [@observable/broadcast-subject](https://jsr.io/@observable/broadcast-subject)

A variant of [`Subject`](https://jsr.io/@xan/subject/doc/~/Subject) whose
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values are
[`structured cloned`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) and sent
only to [consumers](https://jsr.io/@observable/core#consumer) of _other_
[`BroadcastSubject`](https://jsr.io/@observable/broadcast-subject/doc/~/BroadcastSubject) instances
with the same name even if they are in different browsing contexts (e.g. browser tabs). Logically,
[consumers](https://jsr.io/@observable/core#consumer) of the
[`BroadcastSubject`](https://jsr.io/@observable/broadcast-subject/doc/~/BroadcastSubject) do not
receive it's _own_ [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { BroadcastSubject } from "@observable/broadcast-subject";

// Setup subjects
const name = "test";
const controller = new AbortController();
const subject1 = new BroadcastSubject<number>(name);
const subject2 = new BroadcastSubject<number>(name);

// Subscribe to subjects
subject1.subscribe({
  signal: controller.signal,
  next: (value) => console.log("subject1 received", value, "from subject1"),
  return: () => console.log("subject1 returned"),
  throw: (value) => console.log("subject1 threw", value),
});
subject2.subscribe({
  signal: controller.signal,
  next: (value) => console.log("subject2 received", value, "from subject2"),
  return: () => console.log("subject2 returned"),
  throw: (value) => console.log("subject2 threw", value),
});

subject1.next(1); // subject2 received 1 from subject1
subject2.next(2); // subject1 received 2 from subject2
subject2.return(); // subject2 returned
subject1.next(3); // No console output since subject2 is already returned
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/broadcast-subject from the @observable library ecosystem.

WHAT IT DOES:
`BroadcastSubject` is a Subject that broadcasts values ONLY to OTHER BroadcastSubject instances with the same name, across different browsing contexts (e.g., browser tabs). It does NOT receive its own emissions.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Subject uses `next()`, `return()`, `throw()` — NOT `next()`, `complete()`, `error()`
- Uses browser's BroadcastChannel API under the hood

USAGE PATTERN:
```ts
import { BroadcastSubject } from "@observable/broadcast-subject";

// In Tab 1:
const subject1 = new BroadcastSubject<number>("myChannel");
const controller1 = new AbortController();

subject1.subscribe({
  signal: controller1.signal,
  next: (value) => console.log("Tab1 received:", value),
  return: () => console.log("Tab1 done"),
  throw: (error) => console.error(error),
});

// In Tab 2:
const subject2 = new BroadcastSubject<number>("myChannel");
const controller2 = new AbortController();

subject2.subscribe({
  signal: controller2.signal,
  next: (value) => console.log("Tab2 received:", value),
  return: () => console.log("Tab2 done"),
  throw: (error) => console.error(error),
});

subject1.next(1);  // Tab2 receives 1 (Tab1 does NOT)
subject2.next(2);  // Tab1 receives 2 (Tab2 does NOT)
```

KEY BEHAVIOR:
- Values are structured cloned across contexts
- Subject does NOT receive its own emissions
- Same name = same channel

USE CASES:
- Sync state across browser tabs
- Cross-tab communication
- Logout from all tabs
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
