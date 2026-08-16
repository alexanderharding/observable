import { Observable, Observer } from "@observable/core";
import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "@std/assert";
import { from } from "./mod.ts";

Deno.test("from should throw if no arguments are provided", () => {
  assertThrows(
    // @ts-expect-error: Testing invalid arguments
    () => from(),
    TypeError,
    "1 argument required but 0 present",
  );
});

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
    const observable = from(custom);
    observable.subscribe(observer);

    // Assert
    assertInstanceOf(observable, Observable);
    assertEquals(subscribeCalls, [[observer]]);
  },
);

Deno.test(
  "from should return the same Observable if it is already a proper Observable",
  () => {
    // Arrange
    const expected = new Observable(() => {});

    // Act
    const actual = from(expected);

    // Assert
    assertStrictEquals(actual, expected);
  },
);
