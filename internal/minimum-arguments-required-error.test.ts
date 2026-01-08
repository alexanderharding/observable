import { assertInstanceOf, assertStrictEquals } from "@std/assert";
import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

Deno.test("MinimumArgumentsRequiredError should be a TypeError", () => {
  // Arrange / Act
  const error = new MinimumArgumentsRequiredError();

  // Assert
  assertInstanceOf(error, TypeError);
});

Deno.test(
  "MinimumArgumentsRequiredError should have the correct message when called with no arguments",
  () => {
    // Arrange / Act
    const error = new MinimumArgumentsRequiredError();

    // Assert
    assertStrictEquals(error.message, "1 argument required but 0 present");
  },
);

Deno.test(
  "MinimumArgumentsRequiredError should have the correct message when called with arguments and expected is greater than 1",
  () => {
    // Arrange / Act
    const error = new MinimumArgumentsRequiredError(5, 2);

    // Assert
    assertStrictEquals(error.message, "5 arguments required but 2 present");
  },
);

Deno.test(
  "MinimumArgumentsRequiredError should have the correct message when called with arguments and expected is 1",
  () => {
    // Arrange / Act
    const error = new MinimumArgumentsRequiredError(1, 0);

    // Assert
    assertStrictEquals(error.message, "1 argument required but 0 present");
  },
);
