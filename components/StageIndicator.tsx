import { clsx } from 'clsx';

import { PipelineStage } from '@/types';

export function StageIndicator({
  stage,
}: {
  stage: string;
  isActive: boolean;
}) {
  const stages: string[] = Object.values(PipelineStage);
  const index = stages.indexOf(stage);
  return (
    <div className="flex items-center space-x-2">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            className={clsx(
              'size-4 rounded-full',
              i <= index ? 'bg-primary' : 'border border-border'
            )}
          />
          {i < stages.length - 1 && <span className="mx-1">→</span>}
        </div>
      ))}
    </div>
  );
}
