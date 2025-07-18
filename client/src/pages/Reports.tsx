import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchTransactions } from "@/store/slices/transactionSlice";
import { fetchPayments } from "@/store/slices/paymentSlice";
import { fetchVendors } from "@/store/slices/vendorSlice";
import { fetchCustomers } from "@/store/slices/customerSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCSV, exportToExcel } from "@/utils/exportUtils";
import { Download, FileText } from "lucide-react";
import TransactionTable from "@/components/Tables/TransactionTable";

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading: transactionsLoading } = useSelector((state: RootState) => state.transactions);
  const { payments, loading: paymentsLoading } = useSelector((state: RootState) => state.payments);
  const { vendors, loading: vendorsLoading } = useSelector((state: RootState) => state.vendors);
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customers);

  const [dateRange, setDateRange] = useState("month");
  const [reportType, setReportType] = useState("all");

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchPayments());
    dispatch(fetchVendors());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const loading = transactionsLoading || paymentsLoading || vendorsLoading || customersLoading;

  // Calculate report data
  const totalMilkReceived = transactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalMilkSent = transactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalRevenue = transactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalCost = transactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const netProfit = totalRevenue - totalCost;

  const handleExportCSV = () => {
    const data = transactions.map(t => ({
      Date: new Date(t.date!).toLocaleDateString(),
      Type: t.type,
      Party: t.vendorId 
        ? vendors.find(v => v.id === t.vendorId)?.name || 'Unknown Vendor'
        : customers.find(c => c.id === t.customerId)?.name || 'Unknown Customer',
      'Milk Type': t.milkType,
      Quantity: t.quantity,
      Rate: t.rate,
      'Total Amount': t.totalAmount,
    }));
    exportToCSV(data, 'milk-transactions-report');
  };

  const handleExportExcel = () => {
    const data = transactions.map(t => ({
      Date: new Date(t.date!).toLocaleDateString(),
      Type: t.type,
      Party: t.vendorId 
        ? vendors.find(v => v.id === t.vendorId)?.name || 'Unknown Vendor'
        : customers.find(c => c.id === t.customerId)?.name || 'Unknown Customer',
      'Milk Type': t.milkType,
      Quantity: t.quantity,
      Rate: t.rate,
      'Total Amount': t.totalAmount,
    }));
    exportToExcel(data, 'milk-transactions-report');
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Skeleton className="h-96" />
          <div className="lg:col-span-3">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">Generate detailed reports and export data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="vendor">Vendor Ledger</SelectItem>
                  <SelectItem value="customer">Customer Ledger</SelectItem>
                  <SelectItem value="profit">Profit/Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => {}}>
              Generate Report
            </Button>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleExportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" className="w-full" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Results */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Summary Report</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Milk Received</p>
                  <p className="text-lg font-bold text-primary">{totalMilkReceived.toLocaleString()}L</p>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Milk Sent</p>
                  <p className="text-lg font-bold text-secondary">{totalMilkSent.toLocaleString()}L</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-lg font-bold text-orange-600">₹{netProfit.toLocaleString()}</p>
                </div>
              </div>

              {/* Detailed Table */}
              <TransactionTable 
                transactions={transactions} 
                vendors={vendors} 
                customers={customers}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
