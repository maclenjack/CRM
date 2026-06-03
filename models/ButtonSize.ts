import { DefaultEnum } from '@/models';

export class ButtonSize extends DefaultEnum {
  public static readonly SMALL = new ButtonSize('SMALL', 'px-3 py-1.5 text-sm');
  public static readonly MEDIUM = new ButtonSize(
    'MEDIUM',
    'px-4 py-2 text-base'
  );
  public static readonly LARGE = new ButtonSize('LARGE', 'px-6 py-3 text-lg');

  private constructor(
    public readonly id: string,
    public readonly className: string
  ) {
    super(id);
  }

  public static override values(): ButtonSize[] {
    return [this.SMALL, this.MEDIUM, this.LARGE];
  }
}
