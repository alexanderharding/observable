# [@observable/fetch](https://jsr.io/@observable/fetch)

Uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to make an HTTP
request.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { fetch } from "@observable/fetch";

const controller = new AbortController();
fetch("https://www.example.com/api/data").subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" Response { type: "cors", url: "https://www.example.com/api/data", redirected: false, status: 200, ok: true, ... }
// "return"
```

```ts
import { fetch } from "@observable/fetch";
import { Observable } from "@observable/core";
import { switchMap } from "@observable/switch-map";
import { pipe } from "@observable/pipe";
import { ofPromise } from "@observable/of-promise";

const controller = new AbortController();
const response = fetch("https://www.example.com/api/data", {
  headers: { "Content-Type": "application/json" },
});
const data = pipe(
  response,
  switchMap((response) => pipe(response.json(), ofPromise())),
);

data.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" { "id": 1, "name": "John Doe" }
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/fetch from the @observable library ecosystem.

WHAT IT DOES:
`fetch(input, init?)` creates an Observable that performs an HTTP request using the Fetch API. Emits the Response object and then returns.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Aborting the subscription will abort the in-flight fetch request

USAGE PATTERN:
```ts
import { fetch } from "@observable/fetch";

const controller = new AbortController();

fetch("https://api.example.com/data").subscribe({
  signal: controller.signal,
  next: (response) => console.log(response),  // Response object
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

// To cancel the request:
controller.abort();
```

PARSING RESPONSE BODY:
```ts
import { fetch } from "@observable/fetch";
import { Observable } from "@observable/core";
import { switchMap } from "@observable/switch-map";
import { pipe } from "@observable/pipe";
import { ofPromise } from "@observable/of-promise";

const controller = new AbortController();

pipe(
  fetch("https://api.example.com/data", {
    headers: { "Content-Type": "application/json" }
  }),
  switchMap((response) => pipe(response.json(), ofPromise())),
).subscribe({
  signal: controller.signal,
  next: (data) => console.log(data),  // Parsed JSON
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

BEHAVIOR:
- Emits exactly one `next` with the Response object
- Calls `return()` after emitting the Response
- Calls `throw()` if the fetch request fails (network error, etc.)
- Aborting before response aborts the request silently (no error emitted)
- Aborting after response does NOT abort the Response body stream

SEE ALSO:
- `timeout` — emits after a delay
- `defer` — creates Observable lazily on each subscription
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
