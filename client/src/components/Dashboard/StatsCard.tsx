import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon?: string; // Make icon optional for backward compatibility
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';
  textColor?: string;
  details?: {
    quantity?: string;
    amount?: string;
    averageRate?: string;
  };
}

// Utility function to format numbers for display
function formatDisplayValue(value: string): string {
  // Extract number from string (remove currency symbols, units like 'L', etc.)
  const numMatch = value.match(/-?\d+\.?\d*/);
  if (!numMatch) return value;
  
  const num = parseFloat(numMatch[0]);
  const suffix = value.replace(numMatch[0], ''); // Get the suffix (L, units, etc.)
  
  // Round to whole numbers and format compactly
  if (Math.abs(num) >= 1000000) {
    // For millions, show like "1.2M"
    const millions = (num / 1000000).toFixed(1).replace('.0', '');
    return `${millions}M${suffix}`;
  } else if (Math.abs(num) >= 1000) {
    // For thousands, show like "10K"
    const thousands = (num / 1000).toFixed(1).replace('.0', '');
    return `${thousands}K${suffix}`;
  } else {
    // For smaller numbers, round to whole number
    return `${Math.round(num)}${suffix}`;
  }
}

export default function StatsCard({ title, value, icon, color, textColor, details }: StatsCardProps) {
  // Format the value for display
  const displayValue = formatDisplayValue(value);
  
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
      <CardContent className="p-4">
        {/* Title row */}
        <div className="mb-3">
          <p className="text-sm font-medium text-muted-foreground/80 text-center">{title}</p>
        </div>
        
        {/* If details are provided, show detailed view */}
        {details ? (
          <div className="space-y-2">
            {details.quantity && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Quantity:</span>
                <span className="text-sm font-semibold text-foreground">{details.quantity}</span>
              </div>
            )}
            {details.amount && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Amount:</span>
                <span className="text-sm font-semibold text-foreground">{details.amount}</span>
              </div>
            )}
            {details.averageRate && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Avg Rate/L:</span>
                <span className="text-sm font-semibold text-foreground">{details.averageRate}</span>
              </div>
            )}
          </div>
        ) : (
          /* Fallback to simple display */
          <div className="text-center">
            <p className={cn("font-bold leading-none", 
              displayValue.length > 15 ? "text-lg" :
              displayValue.length > 12 ? "text-xl" :
              displayValue.length > 8 ? "text-2xl" : 
              displayValue.length > 6 ? "text-3xl" : "text-4xl", 
              textColor || "text-foreground")}>{displayValue}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
