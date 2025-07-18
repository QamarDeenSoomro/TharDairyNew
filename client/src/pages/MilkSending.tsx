import { useState } from "react";
import { useCustomers, useTransactions } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MilkSendForm from "@/components/Forms/MilkSendForm";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function MilkSending() {
  const { customers, loading: customersLoading } = useCustomers();
  const { transactions, loading: transactionsLoading } = useTransactions();

  const recentSends = transactions
    .filter(t => t.type === 'send')
    .slice(0, 5);

  if (customersLoading || transactionsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Milk Sending</h2>
        <p className="text-muted-foreground">Record milk sent to customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sending Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Milk Delivery</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <MilkSendForm customers={customers} />
          </CardContent>
        </Card>

        {/* Recent Sends */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {recentSends.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent deliveries</p>
              ) : (
                recentSends.map((send) => {
                  const customer = customers.find(c => c.id === send.customerId);
                  return (
                    <div key={send.id} className="border border-border rounded-md p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <span className="text-sm font-medium text-foreground">
                          {customer?.name || 'Unknown Customer'}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(send.date!), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="text-foreground ml-1 capitalize">{send.milkType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="text-foreground ml-1">{send.quantity}L</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="text-foreground ml-1">₹{send.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
