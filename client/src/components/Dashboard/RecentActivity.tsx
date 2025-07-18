import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { MilkTransaction, Payment } from "@shared/schema";

interface RecentActivityProps {
  transactions: MilkTransaction[];
  payments: Payment[];
}

export default function RecentActivity({ transactions, payments }: RecentActivityProps) {
  // Combine and sort activities
  const activities = [
    ...transactions.map(t => ({
      id: `transaction-${t.id}`,
      type: t.type === 'receive' ? 'receive' : 'send',
      description: t.type === 'receive' 
        ? `Received ${t.quantity}L from vendor` 
        : `Sent ${t.quantity}L to customer`,
      timestamp: new Date(t.date!),
      icon: t.type === 'receive' ? 'move_down' : 'move_up',
      color: t.type === 'receive' ? 'primary' : 'secondary',
    })),
    ...payments.map(p => ({
      id: `payment-${p.id}`,
      type: p.type,
      description: p.type === 'received' 
        ? `Payment received ₹${p.amount}` 
        : `Payment made ₹${p.amount}`,
      timestamp: new Date(p.date!),
      icon: 'payment',
      color: 'success',
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.color === 'primary' ? 'bg-primary/10' :
                  activity.color === 'secondary' ? 'bg-secondary/10' :
                  'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <span className={`material-icons text-sm ${
                    activity.color === 'primary' ? 'text-primary' :
                    activity.color === 'secondary' ? 'text-secondary' :
                    'text-green-600'
                  }`}>
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
