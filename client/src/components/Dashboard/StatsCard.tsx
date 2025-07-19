import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';
  textColor?: string;
}

export default function StatsCard({ title, value, icon, color, textColor }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    warning: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", textColor || "text-foreground")}>{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            <span className="material-icons">{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
