import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Flag indicating that a value is not thrown.
 * @internal Do NOT export.
 */
const notThrown = Symbol("Flag indicating that a value is not thrown.");

/**
 * Projects the provided {@linkcode observable|Observable} to an
 * [`AsyncGenerator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator)
 * that [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)s each
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed {@linkcode Value|value} in order.
 * @example
 * ```ts
 * import { nextV * import { eachValueFrom } from "@obserable/each-value-from";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * for await (const value of eachValueFrom(pipe([1, 2, 3], ofIterable()))) {
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
 * import { eachValueFrom } from "@observable/each-value-from";
 * import { throwError } from "@observable/throw-error";
 *
 * try {
 *   for await (const value of eachValueFrom(throwError(new Error("test")))) {
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
 * import { eachValueFrom } from "@observable/each-value-from";
 * import { interval } from "@observable/interval";
 *
 * for await (const value of eachValueFrom(interval(100))) {
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
 * import { eachValueFrom } from "@observable/each-value-from";
 * import { empty } from "@observable/empty";
 * import { pipe } from "@observable/pipe";
 *
 * for await (const value of eachValueFrom(empty)) {
 *   console.log(value);
 * }
 * console.log("Done!");
 *
 * // Console output:
 * // Done!
 * ```
 */
export async function* eachValueFrom<Value>(
  observable: Observable<Value>,
): AsyncGenerator<Value, void, void> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObservable(observable)) throw new ParameterTypeError(0, "Observable");
  const activeSubscriptionController = new AbortController();
  let thrownValue: unknown = notThrown;
  let returned = false;
  const buffer: Array<Value> = [];
  const deferredResolvers: Array<
    Omit<PromiseWithResolvers<IteratorResult<Value, void>>, "promise">
  > = [];

  from(observable).subscribe({
    signal: activeSubscriptionController.signal,
    next(value) {
      if (deferredResolvers.length) deferredResolvers.shift()!.resolve({ value, done: false });
      else buffer.push(value);
    },
    return() {
      returned = true;
      while (deferredResolvers.length) {
        deferredResolvers.shift()!.resolve({ value: undefined, done: true });
      }
    },
    throw(value) {
      thrownValue = value;
      while (deferredResolvers.length) deferredResolvers.shift()!.reject(value);
    },
  });

  try {
    while (true) {
      // If we already have some values in our buffer, we'll yield the next one.
      if (buffer.length > 0) yield buffer.shift()!;
      // If the source has returned, we're done.
      else if (returned) return;
      // If the source has thrown an error, we'll rethrow it.
      else if (thrownValue !== notThrown) throw thrownValue;
      else {
        // Otherwise, we'll wait for the next value.
        const { promise, ...resolvers } = Promise.withResolvers<IteratorResult<Value, void>>();
        deferredResolvers.push(resolvers);
        const result = await promise;
        if (result.done) return;
        else yield result.value;
      }
    }
  } catch (value) {
    throw value;
  } finally {
    activeSubscriptionController.abort();
    deferredResolvers.length = 0;
    buffer.length = 0;
  }
}
