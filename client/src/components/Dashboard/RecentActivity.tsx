import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { FirebaseVendor, FirebaseCustomer, FirebaseMilkTransaction, FirebasePayment } from "@/services/firebase-realtime";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecentActivityProps {
  transactions: FirebaseMilkTransaction[];
  payments: FirebasePayment[];
  vendors: FirebaseVendor[];
  customers: FirebaseCustomer[];
}

export default function RecentActivity({ transactions, payments, vendors, customers }: RecentActivityProps) {
  const { t } = useLanguage();
  
  // Helper functions to get names
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return t.unknownVendor;
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || t.unknownVendor;
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return t.unknownCustomer;
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || t.unknownCustomer;
  };

  // Combine and sort activities
  const activities = [
    ...transactions.map(transaction => ({
      id: `transaction-${transaction.id}`,
      type: transaction.type === 'receive' ? 'receive' : 'send',
      description: transaction.type === 'receive' 
        ? `${t.receivedFrom} ${transaction.quantity}L from ${getVendorName(transaction.vendorId)}` 
        : `${t.sentTo} ${transaction.quantity}L to ${getCustomerName(transaction.customerId)}`,
      timestamp: new Date(transaction.date!),
      icon: transaction.type === 'receive' ? 'move_down' : 'move_up',
      color: transaction.type === 'receive' ? 'primary' : 'secondary',
    })),
    ...payments.map(payment => ({
      id: `payment-${payment.id}`,
      type: payment.type,
      description: payment.type === 'received' 
        ? `${t.paymentReceived} ${payment.amount} from ${payment.vendorId ? getVendorName(payment.vendorId) : getCustomerName(payment.customerId)}` 
        : `${t.paymentMade} ${payment.amount} to ${payment.vendorId ? getVendorName(payment.vendorId) : getCustomerName(payment.customerId)}`,
      timestamp: new Date(payment.date!),
      icon: 'payment',
      color: 'success',
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recentActivity}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t.noRecentActivity}</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.color === 'primary' ? 'bg-primary/10' :
                  activity.color === 'secondary' ? 'bg-secondary/10' :
                  'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <span className={`text-sm ${
                    activity.color === 'primary' ? 'text-primary' :
                    activity.color === 'secondary' ? 'text-secondary' :
                    'text-green-600'
                  }`}>
                    {activity.type === 'receive' ? '📥' : activity.type === 'send' ? '📤' : '💰'}
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
