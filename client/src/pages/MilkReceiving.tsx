import { useState } from "react";
import { useVendors, useTransactions } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MilkReceiveForm from "@/components/Forms/MilkReceiveForm";
import MilkTransactionActions from "@/components/Tables/MilkTransactionActions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MilkReceiving() {
  const { t } = useLanguage();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { transactions, loading: transactionsLoading } = useTransactions();

  const recentReceipts = transactions
    .filter(t => t.type === 'receive')
    .slice(0, 5);

  if (vendorsLoading || transactionsLoading) {
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
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t.milkReceivingManagement}</h2>
        <p className="text-muted-foreground">{t.milkReceivingDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receiving Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t.addMilkReceipt}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <MilkReceiveForm vendors={vendors} />
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>{t.recentReceipts}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {recentReceipts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t.noRecentReceipts}</p>
              ) : (
                recentReceipts.map((receipt) => {
                  const vendor = vendors.find(v => v.id === receipt.vendorId);
                  return (
                    <div key={receipt.id} className="border border-border rounded-md p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <span className="text-sm font-medium text-foreground">
                          {vendor?.name || t.unknownVendor}
                        </span>
                        <div className="flex items-center gap-2">
                          {(receipt as any).savedOnHard && (
                            <span className="material-icons text-green-600 text-sm" title="Saved on hard copy">
                              check_circle
                            </span>
                          )}
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(receipt.date!), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">{t.type}:</span>
                          <span className="text-foreground ml-1 capitalize">{receipt.milkType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t.qty}:</span>
                          <span className="text-foreground ml-1">{receipt.quantity}L</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-muted-foreground">{t.amount}:</span>
                          <span className="text-foreground ml-1">{receipt.totalAmount}</span>
                        </div>
                      </div>
                      <MilkTransactionActions 
                        transaction={receipt} 
                        vendors={vendors} 
                        onEdit={() => {}} 
                        onDelete={() => {}} 
                      />
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
