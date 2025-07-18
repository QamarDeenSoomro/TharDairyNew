import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    warning: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn('p-3 rounded-full', colorClasses[color])}>
            <span className="material-icons">{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
