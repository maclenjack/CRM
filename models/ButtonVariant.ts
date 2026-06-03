import { DefaultEnum } from '@/models';

export class ButtonVariant extends DefaultEnum {
  public static readonly PRIMARY = new ButtonVariant(
    'PRIMARY',
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500'
  );
  public static readonly SECONDARY = new ButtonVariant(
    'SECONDARY',
    'bg-neutral-600 text-white hover:bg-neutral-700 active:bg-neutral-800 focus:ring-neutral-500'
  );
  public static readonly ACCENT = new ButtonVariant(
    'ACCENT',
    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus:ring-accent-500'
  );

  private constructor(
    public readonly id: string,
    public readonly className: string
  ) {
    super(id);
  }

  public static override values(): ButtonVariant[] {
    return [this.PRIMARY, this.SECONDARY, this.ACCENT];
  }
}
