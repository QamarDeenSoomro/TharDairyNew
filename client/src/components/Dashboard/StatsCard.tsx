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
    primary: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-blue-600',
    secondary: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 text-purple-600',
    success: 'bg-gradient-to-br from-green-500/10 to-green-600/10 text-green-600',
    warning: 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 text-orange-600',
    info: 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 text-cyan-600',
    danger: 'bg-gradient-to-br from-red-500/10 to-red-600/10 text-red-600',
  };

  const cardGradients = {
    primary: 'bg-gradient-to-br from-blue-50 via-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:via-blue-900/10 dark:to-blue-950/30',
    secondary: 'bg-gradient-to-br from-purple-50 via-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:via-purple-900/10 dark:to-purple-950/30',
    success: 'bg-gradient-to-br from-green-50 via-green-50/50 to-green-100/30 dark:from-green-950/20 dark:via-green-900/10 dark:to-green-950/30',
    warning: 'bg-gradient-to-br from-orange-50 via-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:via-orange-900/10 dark:to-orange-950/30',
    info: 'bg-gradient-to-br from-cyan-50 via-cyan-50/50 to-cyan-100/30 dark:from-cyan-950/20 dark:via-cyan-900/10 dark:to-cyan-950/30',
    danger: 'bg-gradient-to-br from-red-50 via-red-50/50 to-red-100/30 dark:from-red-950/20 dark:via-red-900/10 dark:to-red-950/30',
  };

  return (
    <Card className={cn("border-0 shadow-lg", cardGradients[color])}>
      <CardContent className="p-6">
        {/* Title row */}
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground/80 text-center">{title}</p>
        </div>
        
        {/* Data and icon row with two columns */}
        <div className="grid grid-cols-2 gap-4 items-start">
          {/* Data column */}
          <div className="flex-1 min-w-0 pr-2">
            <p className={cn("text-2xl font-bold leading-tight break-words", textColor || "text-foreground")}>{value}</p>
          </div>
          
          {/* Icon column */}
          <div className="flex justify-end items-start">
            <div className={cn("p-3 rounded-full shadow-md flex-shrink-0", colorClasses[color])}>
              <span className="material-icons text-xl">{icon}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
