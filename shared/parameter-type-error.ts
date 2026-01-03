export class ParameterTypeError extends TypeError {
  constructor(index: number, expected: string) {
    super(`Parameter ${index + 1} is not of type '${expected}'`);
  }
}
