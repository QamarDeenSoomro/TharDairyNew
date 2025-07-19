import { useState } from "react";
import { usePayments, useVendors, useCustomers } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentForm from "@/components/Forms/PaymentForm";
import PaymentTable from "@/components/Tables/PaymentTable";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Payments() {
  const { payments, loading: paymentsLoading } = usePayments();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { customers, loading: customersLoading } = useCustomers();
  const { t } = useLanguage();

  const loading = paymentsLoading || vendorsLoading || customersLoading;

  const totalReceived = payments
    .filter(p => p.type === 'received')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = payments
    .filter(p => p.type === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const recentPayments = payments.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t.paymentManagement}</h2>
        <p className="text-muted-foreground">{t.paymentManagementDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t.recordPayment}</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm vendors={vendors} customers={customers} />
          </CardContent>
        </Card>

        {/* Payment Summary and Recent Payments */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.paymentSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t.totalReceived}</p>
                  <p className="text-xl font-bold text-green-600">{totalReceived.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <TrendingDown className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t.totalPaid}</p>
                  <p className="text-xl font-bold text-orange-600">{totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>{t.recentPayments}</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTable 
                payments={recentPayments} 
                vendors={vendors} 
                customers={customers}
                showPagination={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
