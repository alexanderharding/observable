import { Observable, Observer } from "@xan/observable-core";
import { assertEquals, assertInstanceOf, assertStrictEquals } from "@std/assert";
import { pipe } from "./pipe.ts";
import { asObservable } from "./as-observable.ts";
import { of } from "./of.ts";

Deno.test(
  "from should convert a custom observable to a proper observable",
  () => {
    // Arrange
    const observer = new Observer();
    const subscribeCalls: Array<Parameters<Observable<number>["subscribe"]>> = [];
    const custom: Observable<number> = {
      subscribe(observer) {
        assertInstanceOf(observer, Observer);
        subscribeCalls.push([observer]);
        observer.next(1);
        observer.next(2);
        observer.return();
      },
    };

    // Act
    const observable = pipe(custom, asObservable());
    observable.subscribe(observer);

    // Assert
    assertInstanceOf(observable, Observable);
    assertEquals(subscribeCalls, [[observer]]);
  },
);

Deno.test(
  "from should return the same observer if it is already a proper observer",
  () => {
    // Arrange
    const expected = of([1, 2]);

    // Act
    const actual = pipe(expected, asObservable());

    // Assert
    assertStrictEquals(actual, expected);
  },
);
