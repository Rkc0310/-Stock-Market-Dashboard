import { cn } from '../../lib/utils';

export function Card({ className, children }) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn("px-6 py-4 flex flex-col space-y-1.5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h3 className={cn("font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
}
