import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';
  textColor?: string;
}

// Utility function to format numbers for display
function formatDisplayValue(value: string): string {
  // Extract number from string (remove currency symbols, units like 'L', etc.)
  const numMatch = value.match(/-?\d+\.?\d*/);
  if (!numMatch) return value;
  
  const num = parseFloat(numMatch[0]);
  const suffix = value.replace(numMatch[0], ''); // Get the suffix (L, units, etc.)
  
  // Round to whole numbers and format with commas
  if (Math.abs(num) >= 1000000) {
    // For millions, show like "1.2M"
    return `${(num / 1000000).toFixed(1).replace('.0', '')}M${suffix}`;
  } else if (Math.abs(num) >= 1000) {
    // For thousands, show with comma like "1,000"
    return `${Math.round(num).toLocaleString()}${suffix}`;
  } else {
    // For smaller numbers, round to whole number
    return `${Math.round(num)}${suffix}`;
  }
}

export default function StatsCard({ title, value, icon, color, textColor }: StatsCardProps) {
  // Format the value for display
  const displayValue = formatDisplayValue(value);
  
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
        
        {/* Data and icon row with 60-40 split */}
        <div className="grid grid-cols-5 gap-2 items-center">
          {/* Data column - 60% (3 columns) */}
          <div className="col-span-3 min-w-0">
            <p className={cn("font-bold leading-none whitespace-nowrap overflow-hidden text-ellipsis", 
              displayValue.length > 12 ? "text-base" :
              displayValue.length > 8 ? "text-lg" : 
              displayValue.length > 6 ? "text-xl" : "text-2xl", 
              textColor || "text-foreground")}>{displayValue}</p>
          </div>
          
          {/* Icon column - 40% (2 columns) */}
          <div className="col-span-2 flex justify-end">
            <div className={cn("p-3 rounded-full shadow-md flex-shrink-0", colorClasses[color])}>
              <span className="material-icons text-xl">{icon}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
