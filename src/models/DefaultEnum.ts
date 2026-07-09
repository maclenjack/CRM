export class DefaultEnum {
  protected constructor(public readonly id: string) {}

  public static values(): DefaultEnum[] {
    throw new Error(
      "Abstract static method 'values()' must be implemented by child class."
    );
  }

  public static get<T extends DefaultEnum>(id: string): T | undefined {
    return this.values().find((variant) => variant.id === id) as T | undefined;
  }
}
