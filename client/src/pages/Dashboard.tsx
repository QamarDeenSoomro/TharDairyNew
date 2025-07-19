import { useTransactions, usePayments, useDashboard, useVendors, useCustomers } from "@/hooks/useFirestore";
import StatsCard from "@/components/Dashboard/StatsCard";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from 'date-fns';
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo } from 'react';

export default function Dashboard() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { payments, loading: paymentsLoading } = usePayments();
  const { stats, loading: statsLoading } = useDashboard();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { customers, loading: customersLoading } = useCustomers();
  const { t, isRTL } = useLanguage();

  // Date filter state
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate filtered statistics based on date filter
  const filteredStats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    switch (dateFilter) {
      case 'today':
        startDate = startOfDay(now);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          startDate = startOfDay(now);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59);
        } else {
          startDate = startOfDay(new Date(customStartDate));
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59);
        }
        break;
      default:
        startDate = startOfDay(now);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59);
    }

    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Filter payments by date range
    const filteredPayments = payments.filter(p => {
      const paymentDate = new Date(p.date || p.createdAt);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    // Calculate received milk stats
    const receivedTransactions = filteredTransactions.filter(t => t.type === 'receive');
    const receivedQuantity = receivedTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const receivedAmount = receivedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

    // Calculate sent milk stats
    const sentTransactions = filteredTransactions.filter(t => t.type === 'send');
    const sentQuantity = sentTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const sentAmount = sentTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

    // Calculate profit (sent amount - received amount - daily expenses)
    const profit = sentAmount - receivedAmount;

    // Calculate pending payments (this might need adjustment based on your business logic)
    const totalReceived = filteredPayments.filter(p => p.type === 'received').reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = filteredPayments.filter(p => p.type === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = Math.abs(totalReceived - totalPaid);

    return {
      receivedQuantity,
      receivedAmount,
      sentQuantity,
      sentAmount,
      profit,
      pendingPayments,
      startDate,
      endDate
    };
  }, [dateFilter, customStartDate, customEndDate, transactions, payments]);

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

      {/* Date Filter */}
      <div className="mb-6 p-4 bg-card rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <Label htmlFor="dateFilter" className="text-sm font-medium">Filter Period</Label>
            <Select value={dateFilter} onValueChange={(value: 'today' | 'week' | 'month' | 'custom') => setDateFilter(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {dateFilter === 'custom' && (
            <>
              <div className="flex-1">
                <Label htmlFor="startDate" className="text-sm font-medium">From</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="text-sm font-medium">To</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Showing data from {format(filteredStats.startDate, 'MMM dd, yyyy')} to {format(filteredStats.endDate, 'MMM dd, yyyy')}
        </div>
      </div>

      {/* Stats Cards - Reorganized with Milk in One Column */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Milk Statistics Column */}
        <div className="space-y-4">
          <StatsCard
            title="Milk Received"
            value={`${Math.round(filteredStats.receivedQuantity)}L`}
            color="primary"
            details={{
              quantity: `${Math.round(filteredStats.receivedQuantity)}L`,
              amount: `${new Intl.NumberFormat('en-US').format(Math.round(filteredStats.receivedAmount))}`,
              averageRate: `${new Intl.NumberFormat('en-US').format(filteredStats.receivedQuantity > 0 ? Math.round(filteredStats.receivedAmount / filteredStats.receivedQuantity) : 0)}/L`
            }}
          />
          <StatsCard
            title="Milk Sent"
            value={`${Math.round(filteredStats.sentQuantity)}L`}
            color="secondary"
            details={{
              quantity: `${Math.round(filteredStats.sentQuantity)}L`,
              amount: `${new Intl.NumberFormat('en-US').format(Math.round(filteredStats.sentAmount))}`,
              averageRate: `${new Intl.NumberFormat('en-US').format(filteredStats.sentQuantity > 0 ? Math.round(filteredStats.sentAmount / filteredStats.sentQuantity) : 0)}/L`
            }}
          />
        </div>

        {/* Other Stats */}
        <StatsCard
          title="Balance Milk"
          value={`${Math.round(filteredStats.receivedQuantity - filteredStats.sentQuantity)}L`}
          color={(filteredStats.receivedQuantity - filteredStats.sentQuantity) < 0 ? "danger" : "info"}
          textColor={(filteredStats.receivedQuantity - filteredStats.sentQuantity) < 0 ? "text-red-600" : undefined}
        />
        <StatsCard
          title="Period Profit"
          value={`${new Intl.NumberFormat('en-US').format(Math.round(filteredStats.profit))}`}
          color="success"
        />
        <StatsCard
          title="Pending Payments"
          value={`${new Intl.NumberFormat('en-US').format(Math.round(filteredStats.pendingPayments))}`}
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
