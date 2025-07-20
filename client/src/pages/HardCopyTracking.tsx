import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useVendors, useCustomers, useTransactions, usePayments } from "@/hooks/useFirestore";
import { hardCopyTrackingService, type PartyTrackingSummary } from "@/services/hardCopyTrackingService";
import { transactionService, paymentService } from "@/services/firebase-realtime";
import { FileCheck, FileX, Save, Download, Printer, Search, CheckCircle2, XCircle, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HardCopyTracking() {
  const { vendors } = useVendors();
  const { customers } = useCustomers();
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(false);
  const [partySummaries, setPartySummaries] = useState<PartyTrackingSummary[]>([]);
  const [selectedParty, setSelectedParty] = useState<PartyTrackingSummary | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'vendor' | 'customer'>('all');
  const [unsavedEntries, setUnsavedEntries] = useState<any>(null);

  // Load party summaries
  useEffect(() => {
    loadPartySummaries();
  }, [vendors, customers, transactions, payments]);

  const loadPartySummaries = async () => {
    try {
      const summaries = await hardCopyTrackingService.getPartyTrackingSummary(
        transactions,
        payments,
        vendors,
        customers
      );
      
      // Only show parties that have unsaved entries
      const partiesWithUnsavedEntries = summaries.filter(
        summary => summary.unsavedTransactions > 0 || summary.unsavedPayments > 0
      );
      
      setPartySummaries(partiesWithUnsavedEntries);
    } catch (error) {
      console.error('Error loading party summaries:', error);
    }
  };

  const loadUnsavedEntries = async (party: PartyTrackingSummary) => {
    try {
      const entries = await hardCopyTrackingService.getUnsavedEntriesForParty(
        party.partyId,
        party.partyType,
        transactions,
        payments
      );
      setUnsavedEntries(entries);
      setSelectedParty(party);
    } catch (error) {
      console.error('Error loading unsaved entries:', error);
    }
  };

  const handleMarkAsSaved = async () => {
    setLoading(true);
    try {
      if (selectedTransactions.length > 0) {
        await hardCopyTrackingService.markMultipleTransactionsAsSaved(selectedTransactions);
      }
      if (selectedPayments.length > 0) {
        await hardCopyTrackingService.markMultiplePaymentsAsSaved(selectedPayments);
      }

      toast({
        title: "Success",
        description: `Marked ${selectedTransactions.length + selectedPayments.length} entries as saved`,
      });

      // Reload data
      await loadPartySummaries();
      
      // Check if the selected party still has unsaved entries using fresh data
      if (selectedParty) {
        const freshTransactions = await transactionService.getAll();
        const freshPayments = await paymentService.getAll();
        
        const updatedEntries = await hardCopyTrackingService.getUnsavedEntriesForParty(
          selectedParty.partyId,
          selectedParty.partyType,
          freshTransactions,
          freshPayments
        );
        
        // If no more unsaved entries, clear the selection
        if (updatedEntries.transactions.length === 0 && updatedEntries.payments.length === 0) {
          setSelectedParty(null);
          setUnsavedEntries(null);
        } else {
          setUnsavedEntries(updatedEntries);
        }
      }
      
      // Clear selections
      setSelectedTransactions([]);
      setSelectedPayments([]);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error marking as saved:', error);
      toast({
        title: "Error",
        description: "Failed to mark entries as saved",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    if (!selectedParty || !unsavedEntries) return;

    const report = hardCopyTrackingService.generateUnsavedEntriesReport(
      selectedParty.partyName,
      unsavedEntries
    );

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Unsaved Entries Report - ${selectedParty.partyName}</title>
            <style>
              body { font-family: monospace; margin: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${report}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredSummaries = partySummaries.filter(summary => {
    const matchesSearch = summary.partyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || summary.partyType === filterType;
    return matchesSearch && matchesType;
  });

  const totalUnsaved = filteredSummaries.reduce(
    (sum, s) => sum + s.unsavedTransactions + s.unsavedPayments,
    0
  );

  const selectAllTransactions = () => {
    if (unsavedEntries?.transactions) {
      setSelectedTransactions(unsavedEntries.transactions.map((t: any) => t.id));
    }
  };

  const selectAllPayments = () => {
    if (unsavedEntries?.payments) {
      setSelectedPayments(unsavedEntries.payments.map((p: any) => p.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Hard Copy Tracking</h1>
        
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tracking Summary</span>
              <Badge variant={totalUnsaved > 0 ? "destructive" : "default"}>
                {totalUnsaved} Unsaved Entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span>Total Parties: {partySummaries.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileX className="h-5 w-5 text-orange-600" />
                <span>Parties with Unsaved: {partySummaries.filter(s => s.unsavedTransactions + s.unsavedPayments > 0).length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <span>Fully Saved: {partySummaries.filter(s => s.unsavedTransactions + s.unsavedPayments === 0).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search parties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="vendor">Vendors</TabsTrigger>
              <TabsTrigger value="customer">Customers</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Party List */}
      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            <div className="divide-y">
              {filteredSummaries.map((summary) => (
                <div
                  key={summary.partyId}
                  className="p-4 hover:bg-accent cursor-pointer"
                  onClick={() => loadUnsavedEntries(summary)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{summary.partyName}</h3>
                      <Badge variant="outline" className="mt-1">
                        {summary.partyType === 'vendor' ? 'Vendor' : 'Customer'}
                      </Badge>
                    </div>
                    {summary.unsavedTransactions + summary.unsavedPayments > 0 && (
                      <Badge variant="destructive">
                        {summary.unsavedTransactions + summary.unsavedPayments} unsaved
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Transactions:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">{summary.savedTransactions} saved</span>
                        {summary.unsavedTransactions > 0 && (
                          <span className="text-orange-600">{summary.unsavedTransactions} unsaved</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payments:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">{summary.savedPayments} saved</span>
                        {summary.unsavedPayments > 0 && (
                          <span className="text-orange-600">{summary.unsavedPayments} unsaved</span>
                        )}
                      </div>
                    </div>

                    {summary.lastSavedDate && (
                      <div className="flex items-center text-xs text-muted-foreground pt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last saved: {format(new Date(summary.lastSavedDate), 'dd/MM/yyyy')}
                      </div>
                    )}
                  </div>

                  <Progress 
                    value={((summary.savedTransactions + summary.savedPayments) / (summary.totalTransactions + summary.totalPayments)) * 100}
                    className="mt-3 h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-center">Payments</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead>Last Saved</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSummaries.map((summary) => (
                  <TableRow key={summary.partyId}>
                    <TableCell className="font-medium">{summary.partyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {summary.partyType === 'vendor' ? 'Vendor' : 'Customer'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600">{summary.savedTransactions}/{summary.totalTransactions}</span>
                        {summary.unsavedTransactions > 0 && (
                          <Badge variant="destructive" className="mt-1">
                            {summary.unsavedTransactions} unsaved
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-green-600">{summary.savedPayments}/{summary.totalPayments}</span>
                        {summary.unsavedPayments > 0 && (
                          <Badge variant="destructive" className="mt-1">
                            {summary.unsavedPayments} unsaved
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Progress 
                        value={((summary.savedTransactions + summary.savedPayments) / (summary.totalTransactions + summary.totalPayments)) * 100}
                        className="h-2"
                      />
                    </TableCell>
                    <TableCell>
                      {summary.lastSavedDate ? (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(summary.lastSavedDate), 'dd/MM/yyyy')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={summary.unsavedTransactions + summary.unsavedPayments > 0 ? "default" : "outline"}
                        onClick={() => loadUnsavedEntries(summary)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Unsaved Entries Dialog */}
      {selectedParty && unsavedEntries && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Unsaved Entries - {selectedParty.partyName}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrintReport}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={selectedTransactions.length === 0 && selectedPayments.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Mark as Saved
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unsavedEntries.transactions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Milk Transactions</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllTransactions}
                  >
                    Select All
                  </Button>
                </div>
                <div className="space-y-2">
                  {unsavedEntries.transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTransactions([...selectedTransactions, transaction.id]);
                          } else {
                            setSelectedTransactions(selectedTransactions.filter(id => id !== transaction.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {transaction.type === 'receive' ? 'Received' : 'Sent'} - {transaction.quantity}L @ ₹{transaction.rate}
                          </span>
                          <span className="font-semibold">₹{transaction.totalAmount}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(transaction.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unsavedEntries.payments.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Payments</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllPayments}
                  >
                    Select All
                  </Button>
                </div>
                <div className="space-y-2">
                  {unsavedEntries.payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedPayments.includes(payment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPayments([...selectedPayments, payment.id]);
                          } else {
                            setSelectedPayments(selectedPayments.filter(id => id !== payment.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {payment.type === 'received' ? 'Received' : 'Paid'} - {payment.method}
                          </span>
                          <span className="font-semibold">₹{payment.amount}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(payment.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Entries as Saved</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to mark {selectedTransactions.length + selectedPayments.length} entries as saved on hard copy.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsSaved} disabled={loading}>
              {loading ? "Saving..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}