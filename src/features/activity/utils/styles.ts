export function getActivityBadgeStyles(type: string): string {
  switch (type) {
    case 'CALL':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30';
    case 'EMAIL':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30';
    case 'MEETING':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/30';
    case 'DEADLINE':
      return 'bg-destructive/10 text-destructive dark:bg-destructive/20 border-destructive/20';
    case 'LUNCH':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30';
    default: // TASK
      return 'bg-muted text-muted-foreground border-border/50';
  }
}
