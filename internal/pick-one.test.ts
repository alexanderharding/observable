import { assertStrictEquals } from "@std/assert/strict-equals";
import { pickOne } from "./pick-one.ts";
import { assertAlmostEquals } from "@std/assert";

Deno.test("pickOne should distribute - 1:1 w/o weights", () => {
  // Arrange
  const options = ["A", "B"];
  const results = new Map(options.map((option) => [option, 0]));

  // Act
  const trials = 100_000;
  for (let i = 0; i < trials; i++) {
    const option = pickOne(options);
    assertStrictEquals(results.has(option), true);
    results.set(option, results.get(option)! + 1);
  }

  // Assert
  options.forEach((option) => {
    const percentage = results.get(option)! / trials;
    const expectedPercentage = 1 / options.length;
    assertAlmostEquals(percentage, expectedPercentage, 2);
  });
});
