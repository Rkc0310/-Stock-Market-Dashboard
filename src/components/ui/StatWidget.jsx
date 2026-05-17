import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export function StatWidget({ title, value, changeValue, changePercentage, isPositive, linkTo }) {
  const content = (
    <Card className={cn("transition-all hover:border-primary/50 relative", linkTo ? "cursor-pointer hover:-translate-y-1" : "")}>
      <CardContent className="p-5 flex flex-col gap-2">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</div>
        <div className="text-2xl font-bold tracking-tight">${typeof value === 'number' ? value.toFixed(2) : value}</div>
        <div className="mt-2 flex items-center gap-1.5 text-sm font-medium">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
          <span className={isPositive ? "text-success" : "text-destructive"}>
            {isPositive ? '+' : '-'}${Math.abs(Number(changeValue)).toFixed(2)} ({isPositive ? '+' : ''}{changePercentage.toFixed(2)}%)
          </span>
          <span className="text-muted-foreground ml-1">Today</span>
        </div>
      </CardContent>
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block">{content}</Link>;
  }
  return content;
}
