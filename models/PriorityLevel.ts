import { DefaultEnum } from '@/models';

export class PriorityLevel extends DefaultEnum {
  public static readonly HIGH = new PriorityLevel(
    'HIGH',
    'bg-danger text-white'
  );
  public static readonly MEDIUM = new PriorityLevel(
    'MEDIUM',
    'bg-warning text-white'
  );
  public static readonly LOW = new PriorityLevel('LOW', 'bg-info text-white');

  private constructor(
    public readonly id: string,
    public readonly className: string
  ) {
    super(id);
  }

  public static override values(): PriorityLevel[] {
    return [this.HIGH, this.MEDIUM, this.LOW];
  }

  public toString(): string {
    return this.id.charAt(0).toUpperCase() + this.id.slice(1).toLowerCase();
  }
}
