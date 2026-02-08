import { isObservable, type Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Flag indicating that a value is not thrown.
 * @internal Do NOT export.
 */
const notThrown = Symbol("Flag indicating that a value is not thrown.");

/**
 * Projects the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * to an [`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)
 * that yields each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value.
 * @example
 * ```ts
 * import { asAsyncIterable } from "@observable/as-async-iterable";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * for await (const value of pipe([1, 2, 3], ofIterable(), asAsyncIterable())) {
 *   console.log(value);
 * }
 * console.log("Done!");
 *
 * // Console output:
 * // 1
 * // 2
 * // 3
 * // "Done!"
 * ```
 * @example
 * ```ts
 * import { asAsyncIterable } from "@observable/as-async-iterable";
 * import { throwError } from "@observable/throw-error";
 * import { pipe } from "@observable/pipe";
 *
 * try {
 *   for await (const value of pipe(throwError(new Error("test")), asAsyncIterable())) {
 *     console.log(value);
 *   }
 * } catch (error) {
 *   console.log(error);
 *   // Console output:
 *   // Error: test
 * }
 * ```
 * @example
 * ```ts
 * import { asAsyncIterable } from "@observable/as-async-iterable";
 * import { interval } from "@observable/interval";
 * import { pipe } from "@observable/pipe";
 *
 * for await (const value of pipe(interval(100), asAsyncIterable());) {
 *   console.log(value);
 *   if (value === 5) break;
 * }
 *
 * // Console output:
 * // 0
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * ```
 * @example
 * ```ts
 * import { asAsyncIterable } from "@observable/as-async-iterable";
 * import { empty } from "@observable/empty";
 * import { pipe } from "@observable/pipe";
 *
 * for await (const value of pipe(empty, asAsyncIterable())) {
 *   console.log(value);
 * }
 * console.log("Done!");
 *
 * // Console output:
 * // Done!
 * ```
 */
export function asAsyncIterable<Value>(): (
  source: Observable<Value>,
) => AsyncIterable<Value, void, void> {
  return function asAsyncIterableFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    return {
      [Symbol.asyncIterator]() {
        let activeSubscriptionController: AbortController | undefined;
        let thrownValue: unknown = notThrown;
        let returned = false;
        const values: Array<Value> = [];
        const deferredResolvers: Array<
          Omit<PromiseWithResolvers<IteratorResult<Value>>, "promise">
        > = [];

        return {
          next() {
            if (!activeSubscriptionController) {
              // We only want to start the subscription when the user starts iterating.
              activeSubscriptionController = new AbortController();
              source.subscribe({
                signal: activeSubscriptionController.signal,
                next(value) {
                  if (deferredResolvers.length) {
                    const { resolve } = deferredResolvers.shift()!;
                    resolve({ value, done: false });
                  } else values.push(value);
                },
                return() {
                  returned = true;
                  while (deferredResolvers.length) {
                    const { resolve } = deferredResolvers.shift()!;
                    resolve({ value: undefined, done: true });
                  }
                },
                throw(value) {
                  thrownValue = value;
                  while (deferredResolvers.length) {
                    const { reject } = deferredResolvers.shift()!;
                    reject(value);
                  }
                },
              });
            }

            // If we already have some values in our buffer, we'll return the next one.
            if (values.length) {
              return Promise.resolve({ value: values.shift()!, done: false });
            }

            // This was already returned, so we're just going to return a done result.
            if (returned) {
              return Promise.resolve({ value: undefined, done: true });
            }

            // There was an error, so we're going to return an error result.
            if (thrownValue !== notThrown) return Promise.reject(thrownValue);

            // Otherwise, we need to make them wait for a value.
            const { promise, ...resolvers } = Promise.withResolvers<IteratorResult<Value>>();
            deferredResolvers.push(resolvers);
            return promise;
          },
          return() {
            activeSubscriptionController?.abort();
            return Promise.resolve({ value: undefined, done: true });
          },
          throw(value) {
            activeSubscriptionController?.abort();
            return Promise.reject(value);
          },
        };
      },
    };
  };
}
