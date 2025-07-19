import { useTransactions, usePayments, useDashboard, useVendors, useCustomers } from "@/hooks/useFirestore";
import StatsCard from "@/components/Dashboard/StatsCard";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { payments, loading: paymentsLoading } = usePayments();
  const { stats, loading: statsLoading } = useDashboard();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { customers, loading: customersLoading } = useCustomers();
  const { t, isRTL } = useLanguage();

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

  // Generate weekly milk flow data
  const weeklyMilkFlow = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59);
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dayStart && transactionDate <= dayEnd;
      });
      
      const received = dayTransactions
        .filter(t => t.type === 'receive')
        .reduce((sum, t) => sum + t.quantity, 0);
      
      const sent = dayTransactions
        .filter(t => t.type === 'send')
        .reduce((sum, t) => sum + t.quantity, 0);
      
      data.push({
        date: format(date, 'MMM dd'),
        received,
        sent,
        balance: received - sent
      });
    }
    
    return data;
  };

  const chartData = weeklyMilkFlow();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t.dashboard}</h2>
        <p className="text-muted-foreground">Overview of Thar Dairy's operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <StatsCard
          title={t.todaysMilkReceived}
          value={`${Math.round(stats.todayReceived)}L`}
          color="primary"
          details={{
            quantity: `${Math.round(stats.todayReceived)}L`,
            amount: `Rs. ${Math.round(stats.todayReceivedAmount || 0)}`,
            averageRate: `Rs. ${stats.todayReceived > 0 ? Math.round((stats.todayReceivedAmount || 0) / stats.todayReceived) : 0}/L`
          }}
        />
        <StatsCard
          title={t.todaysMilkSent}
          value={`${Math.round(stats.todaySent)}L`}
          color="secondary"
          details={{
            quantity: `${Math.round(stats.todaySent)}L`,
            amount: `Rs. ${Math.round(stats.todaySentAmount || 0)}`,
            averageRate: `Rs. ${stats.todaySent > 0 ? Math.round((stats.todaySentAmount || 0) / stats.todaySent) : 0}/L`
          }}
        />
        <div className="col-span-2 lg:col-span-1">
          <StatsCard
            title={t.balanceMilk}
            value={`${Math.round(stats.todayReceived - stats.todaySent)}L`}
            color={(stats.todayReceived - stats.todaySent) < 0 ? "danger" : "info"}
            textColor={(stats.todayReceived - stats.todaySent) < 0 ? "text-red-600" : undefined}
          />
        </div>
        <StatsCard
          title={t.todaysProfit}
          value={`Rs. ${Math.round(stats.todayProfit)}`}
          color="success"
        />
        <StatsCard
          title={t.pendingPaymentsAmount}
          value={`Rs. ${Math.round(stats.pendingPayments)}`}
          color="warning"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t.weeklyMilkFlow}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    fontSize={12}
                    className="text-muted-foreground"
                    label={{ value: t.liters, angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      `${value}L`,
                      name === 'received' ? t.received : name === 'sent' ? t.sent : t.balanceMilk
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => 
                      value === 'received' ? t.received : value === 'sent' ? t.sent : t.balanceMilk
                    }
                  />
                  <Bar 
                    dataKey="received" 
                    fill="hsl(var(--primary))" 
                    name="received"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="sent" 
                    fill="hsl(142 71% 45%)" 
                    name="sent"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
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
