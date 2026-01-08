export class MinimumArgumentsRequiredError extends TypeError {
  constructor(expected = 1, actual = 0) {
    const suffix = expected === 1 ? "" : "s";
    super(`${expected} argument${suffix} required but ${actual} present`);
  }
}
