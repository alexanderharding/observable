import { Observable } from "@observable/core";
import { MinimumArgumentsRequiredError } from "@observable/internal";

/**
 * Uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to
 * make an HTTP request.
 * @example
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
 * ```ts
 * import { fetch } from "@observable/fetch";
 * import { Observable } from "@observable/core";
 * import { switchMap } from "@observable/switch-map";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const response = fetch("https://www.example.com/api/data");
 * const data = pipe(
 *   response,
 *   switchMap((response) =>
 *     new Observable(async (observer) => {
 *       try {
 *         observer.next(await response.json());
 *         observer.return();
 *       } catch (value) {
 *         observer.throw(value);
 *       }
 *     })
 *   ),
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
  input: RequestInfo | URL,
  init?: Omit<RequestInit, "signal">,
): Observable<Response> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return new Observable(
    async (observer) => {
      const unsubscribeListenerController = new AbortController();
      const activeFetchController = new AbortController();
      observer.signal.addEventListener(
        "abort",
        () => activeFetchController.abort(observer.signal.reason),
        { once: true, signal: unsubscribeListenerController.signal },
      );
      try {
        const response = await globalThis.fetch(
          input,
          { ...init, signal: activeFetchController.signal },
        );
        // Once the response is received, we no longer want to abort the fetch request on teardown.
        // Aborting in such circumstances would also abort subsequent methods (like `json()`).
        unsubscribeListenerController.abort();
        observer.next(response);
        observer.return();
      } catch (value) {
        if (value instanceof DOMException && value.name === "AbortError") {
          // The consumer has unsubscribed which should not be treated
          // as an error in Observables.
          return;
        }
        observer.throw(value);
      }
    },
  );
}
