import { useTransactions, usePayments, useDashboard, useVendors, useCustomers } from "@/hooks/useFirestore";
import StatsCard from "@/components/Dashboard/StatsCard";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { payments, loading: paymentsLoading } = usePayments();
  const { stats, loading: statsLoading } = useDashboard();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { customers, loading: customersLoading } = useCustomers();

  if (statsLoading || transactionsLoading || paymentsLoading || vendorsLoading || customersLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your milk supply chain operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Today's Milk Received"
          value={`${stats.todayReceived}L`}
          icon="move_down"
          color="primary"
        />
        <StatsCard
          title="Today's Milk Sent"
          value={`${stats.todaySent}L`}
          icon="move_up"
          color="secondary"
        />
        <StatsCard
          title="Today's Profit"
          value={`${stats.todayProfit.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}`}
          icon="trending_up"
          color="success"
        />
        <StatsCard
          title="Pending Payments"
          value={`${stats.pendingPayments.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}`}
          icon="pending"
          color="warning"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly Milk Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Chart: Weekly milk received vs sent</span>
            </div>
          </CardContent>
        </Card>

        <RecentActivity 
          transactions={recentTransactions}
          payments={recentPayments}
          vendors={vendors}
          customers={customers}
        />
      </div>
    </div>
  );
}
