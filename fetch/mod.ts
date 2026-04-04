import type { Observable } from "@observable/core";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { asyncAwait } from "@observable/async-await";
import { tap } from "@observable/tap";
import { finalize } from "@observable/finalize";
import { catchError } from "@observable/catch-error";
import { throwError } from "@observable/throw-error";
import { empty } from "@observable/empty";

/**
 * Uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to
 * make an HTTP request.
 * @example
 * Response
 * ```ts
 * import { fetch } from "@observable/fetch";
 *
 * const controller = new AbortController();
 * fetch("https://www.example.com/api/data").subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" Response { type: "cors", url: "https://www.example.com/api/data", redirected: false, status: 200, ok: true, ... }
 * // "return"
 * ```
 * @example
 * JSON body
 * ```ts
 * import { fetch } from "@observable/fetch";
 * import { Observable } from "@observable/core";
 * import { switchMap } from "@observable/switch-map";
 * import { pipe } from "@observable/pipe";
 * import { asyncAwait } from "@observable/async-await";
 *
 * const controller = new AbortController();
 * const response = fetch("https://www.example.com/api/data", {
 *   headers: { "Content-Type": "application/json" }
 * });
 * const data = pipe(
 *   response,
 *   switchMap((response) => asyncAwait(response.json())),
 * );
 *
 * data.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" { "id": 1, "name": "John Doe" }
 * // "return"
 * ```
 */
export function fetch(
  input: string | URL,
  init?: Omit<RequestInit, "signal">,
): Observable<Response> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof input !== "string" && !isURL(input)) {
    throw new TypeError("Parameter 1 is not of type '(String | URL)'");
  }
  // Normally we'd check the entire RequestInit interface, but it's complex and we don't need to be
  // that strict here. We'll still do minor type checking though.
  if (typeof init !== "undefined" && (typeof init !== "object" || init === null)) {
    throw new TypeError("Parameter 2 is not of type 'Object'");
  }
  return defer(() => {
    let hasResponse = false;
    const activeFetchController = new AbortController();
    return pipe(
      asyncAwait(globalThis.fetch(input, { ...init, signal: activeFetchController.signal })),
      // Once the response is received, we no longer want to abort the fetch request on teardown.
      // Aborting in such circumstances would also abort subsequent methods (like `json()`).
      tap(() => hasResponse = true),
      finalize(() => !hasResponse && activeFetchController.abort()),
      catchError((error) =>
        // If the consumer has unsubscribed, we should NOT treat it as an error in Observables.
        (error instanceof DOMException && error.name === "AbortError") ? empty : throwError(error)
      ),
    );
  });
}

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode URL} interface.
 * @internal Do NOT export
 */
function isURL(value: unknown): value is URL {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    value instanceof URL ||
    ((typeof value === "object" && value !== null) &&
      "href" in value &&
      typeof value.href === "string" &&
      "origin" in value &&
      typeof value.origin === "string" &&
      "protocol" in value &&
      typeof value.protocol === "string" &&
      "username" in value &&
      typeof value.username === "string" &&
      "password" in value &&
      typeof value.password === "string" &&
      "host" in value &&
      typeof value.host === "string" &&
      "hostname" in value &&
      typeof value.hostname === "string" &&
      "port" in value &&
      typeof value.port === "string" &&
      "pathname" in value &&
      typeof value.pathname === "string" &&
      "search" in value &&
      typeof value.search === "string" &&
      "searchParams" in value &&
      "hash" in value &&
      typeof value.hash === "string" &&
      "toString" in value &&
      typeof value.toString === "function" &&
      "toJSON" in value &&
      typeof value.toJSON === "function")
  );
}
