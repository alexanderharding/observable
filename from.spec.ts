import { assertEquals, assertInstanceOf, assertStrictEquals } from "@std/assert";
import { Observer } from "@xan/observer";
import { from } from "./from.ts";
import { Observable } from "./observable.ts";

Deno.test(
  "from should convert a custom observable to a proper observable",
  () => {
    // Arrange
    const observer = new Observer();
    const subscribeCalls: Array<Parameters<Observable<number>["subscribe"]>> = [];
    const subscribeFn = (observer: Observer<number>) => {
      assertInstanceOf(observer, Observer);
      subscribeCalls.push([observer]);
      observer.next(1);
      observer.next(2);
      observer.return();
    };
    const custom: Observable<number> = { subscribe: subscribeFn };

    // Act
    const observable = from(custom);
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
    const expected = new Observable<number>((observer) => {
      observer.next(1);
      observer.next(2);
      observer.return();
    });

    // Act
    const actual = from(expected);

    // Assert
    assertStrictEquals(actual, expected);
  },
);
