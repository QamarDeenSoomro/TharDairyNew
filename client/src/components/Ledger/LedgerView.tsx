import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Send, Download, X, MessageSquare, Smartphone, Archive, History } from "lucide-react";
import { useTransactions, usePayments } from "@/hooks/useFirestore";
import { useSettlements } from "@/hooks/useSettlements";
import { formatDistanceToNow, format, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { FirebaseVendor, FirebaseCustomer } from "@/services/firebase-realtime";
import { formatCurrency } from "@/lib/utils";

interface LedgerViewProps {
  entity: FirebaseVendor | FirebaseCustomer;
  entityType: "vendor" | "customer";
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LedgerView({ entity, entityType, isOpen = true, onClose }: LedgerViewProps) {
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { settlements, createSettlement, getLatestSettlement, getEntitySettlements } = useSettlements();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);
  const [showSMSConfirm, setShowSMSConfirm] = useState(false);
  const [showSettlementDialog, setShowSettlementDialog] = useState(false);
  const [showArchiveView, setShowArchiveView] = useState(false);
  const [settlementNotes, setSettlementNotes] = useState("");
  const [latestSettlement, setLatestSettlement] = useState<any>(null);

  // Get latest settlement for filtering
  const entitySettlements = useMemo(() => {
    const settlements = getEntitySettlements(entity.id, entityType);
    console.log(`Entity settlements for ${entity.name}:`, settlements);
    return settlements;
  }, [settlements, entity.id, entityType, getEntitySettlements]);

  const latestSettlementDate = useMemo(() => {
    if (entitySettlements.length === 0) return null;
    return entitySettlements[0].settlementDate; // Already sorted by date desc
  }, [entitySettlements]);

  // Filter transactions for this entity (only show after latest settlement if any)
  const entityTransactions = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (entityType === "vendor") {
        return t.vendorId === entity.id && t.type === "receive";
      } else {
        return t.customerId === entity.id && t.type === "send";
      }
    });

    // Filter out transactions before latest settlement
    let afterSettlement = filtered;
    if (latestSettlementDate) {
      const settlementDate = new Date(latestSettlementDate);
      afterSettlement = filtered.filter(t => new Date(t.date!) > settlementDate);
    }

    // Apply date filter if dates are selected
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date
      
      return afterSettlement.filter(t => {
        const transactionDate = new Date(t.date!);
        return isWithinInterval(transactionDate, { start, end });
      });
    }

    return afterSettlement;
  }, [transactions, entity.id, entityType, startDate, endDate, latestSettlementDate]);

  // Filter payments for this entity (only show after latest settlement if any)
  const entityPayments = useMemo(() => {
    const filtered = payments.filter(p => {
      if (entityType === "vendor") {
        return p.vendorId === entity.id && p.type === "paid";
      } else {
        return p.customerId === entity.id && p.type === "received";
      }
    });

    // Filter out payments before latest settlement
    let afterSettlement = filtered;
    if (latestSettlementDate) {
      const settlementDate = new Date(latestSettlementDate);
      afterSettlement = filtered.filter(p => new Date(p.date!) > settlementDate);
    }

    // Apply date filter if dates are selected
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return afterSettlement.filter(p => {
        const paymentDate = new Date(p.date!);
        return isWithinInterval(paymentDate, { start, end });
      });
    }

    return afterSettlement;
  }, [payments, entity.id, entityType, startDate, endDate, latestSettlementDate]);

  // Calculate previous balance (before date filter)
  const previousBalance = useMemo(() => {
    if (!startDate) return 0;
    
    const startFilterDate = new Date(startDate);
    
    // Get all transactions before start date
    const allTransactionsBefore = transactions.filter(t => {
      const transactionDate = new Date(t.date!);
      if (entityType === "vendor") {
        return t.vendorId === entity.id && t.type === "receive" && transactionDate < startFilterDate;
      } else {
        return t.customerId === entity.id && t.type === "send" && transactionDate < startFilterDate;
      }
    });
    
    // Get all payments before start date
    const allPaymentsBefore = payments.filter(p => {
      const paymentDate = new Date(p.date!);
      if (entityType === "vendor") {
        return p.vendorId === entity.id && p.type === "paid" && paymentDate < startFilterDate;
      } else {
        return p.customerId === entity.id && p.type === "received" && paymentDate < startFilterDate;
      }
    });
    
    const totalTransactionsBefore = allTransactionsBefore.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPaymentsBefore = allPaymentsBefore.reduce((sum, p) => sum + p.amount, 0);
    
    return entityType === "vendor" ? totalTransactionsBefore - totalPaymentsBefore : totalPaymentsBefore - totalTransactionsBefore;
  }, [transactions, payments, entity.id, entityType, startDate]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalTransactions = entityTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPayments = entityPayments.reduce((sum, p) => sum + p.amount, 0);
    const milkWeight = entityTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const balance = entityType === "vendor" ? totalTransactions - totalPayments : totalPayments - totalTransactions;
    const finalBalance = balance + previousBalance;
    
    // Calculate previous milk weight if date filter is applied
    let previousMilkWeight = 0;
    if (startDate) {
      const startFilterDate = new Date(startDate);
      const allTransactionsBefore = transactions.filter(t => {
        const transactionDate = new Date(t.date!);
        if (entityType === "vendor") {
          return t.vendorId === entity.id && t.type === "receive" && transactionDate < startFilterDate;
        } else {
          return t.customerId === entity.id && t.type === "send" && transactionDate < startFilterDate;
        }
      });
      previousMilkWeight = allTransactionsBefore.reduce((sum, t) => sum + (t.quantity || 0), 0);
    }
    
    return {
      transactions: totalTransactions,
      payments: totalPayments,
      balance,
      previousBalance,
      finalBalance,
      milkWeight,
      previousMilkWeight,
      totalMilkWeight: previousMilkWeight + milkWeight
    };
  }, [entityTransactions, entityPayments, entityType, previousBalance, startDate, transactions, entity.id]);

  // Find last settlement date (last date when balance was zero or minimal)
  const lastSettlementInfo = useMemo(() => {
    const allTransactions = transactions.filter(t => {
      if (entityType === "vendor") {
        return t.vendorId === entity.id && t.type === "receive";
      } else {
        return t.customerId === entity.id && t.type === "send";
      }
    }).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    
    const allPayments = payments.filter(p => {
      if (entityType === "vendor") {
        return p.vendorId === entity.id && p.type === "paid";
      } else {
        return p.customerId === entity.id && p.type === "received";
      }
    }).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    
    // Find the last date where balance was close to zero (within 10 rupees)
    let runningBalance = 0;
    let lastSettlementDate = null;
    let lastSettlementBalance = 0;
    
    // Combine and sort all records by date
    const allRecords = [
      ...allTransactions.map(t => ({ ...t, recordType: 'transaction' as const })),
      ...allPayments.map(p => ({ ...p, recordType: 'payment' as const }))
    ].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
    
    for (const record of allRecords) {
      if (record.recordType === 'transaction') {
        runningBalance += entityType === "vendor" ? record.totalAmount : -record.totalAmount;
      } else {
        runningBalance -= entityType === "vendor" ? record.amount : -record.amount;
      }
      
      // If balance is close to zero (settled), record this date
      if (Math.abs(runningBalance) <= 10) {
        lastSettlementDate = record.date!;
        lastSettlementBalance = runningBalance;
      }
    }
    
    return {
      date: lastSettlementDate,
      balance: lastSettlementBalance
    };
  }, [transactions, payments, entity.id, entityType]);

  // Auto-settlement logic: settle when balance is less than 1
  const isAutoSettled = Math.abs(totals.finalBalance) < 1;
  
  // Settlement handlers
  const handleManualSettlement = async () => {
    try {
      await createSettlement(entity.id, entityType, totals.finalBalance, settlementNotes || undefined);
      setShowSettlementDialog(false);
      setSettlementNotes("");
      toast({
        title: "Auto-Settlement Completed",
        description: `${entity.name}'s account has been automatically settled and all data archived. Starting fresh with zero balance.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create settlement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShowArchive = () => {
    setShowArchiveView(true);
  };

  // Generate ledger text for WhatsApp
  const generateLedgerText = () => {
    const dateRange = startDate && endDate 
      ? `${format(new Date(startDate), "dd/MM/yyyy")} to ${format(new Date(endDate), "dd/MM/yyyy")}`
      : "All Time";
    
    const entityName = entity.name;
    const entityContact = entity.contact;
    
    let text = `*${entityType.toUpperCase()} LEDGER*\n`;
    text += `Name: ${entityName}\n`;
    text += `Contact: ${entityContact}\n`;
    text += `Period: ${dateRange}\n`;
    
    // Add settlement information
    if (lastSettlementInfo.date) {
      text += `Last Settled: ${format(new Date(lastSettlementInfo.date), "dd/MM/yyyy")}\n`;
    } else {
      text += `Last Settled: Never\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add previous balance if date filter is applied
    if (startDate && Math.abs(totals.previousBalance) > 0.01) {
      text += `*PREVIOUS BALANCE:*\n`;
      text += `Before ${format(new Date(startDate), "dd/MM/yyyy")}: ${formatCurrency(Math.abs(totals.previousBalance))}\n`;
      text += totals.previousBalance > 0 
        ? `Status: ${entityType === "vendor" ? "Amount Due" : "Credit Balance"}\n\n`
        : totals.previousBalance < 0 
        ? `Status: ${entityType === "vendor" ? "Advance Payment" : "Amount Due"}\n\n`
        : `Status: Settled\n\n`;
    }
    
    // Add transactions
    if (entityTransactions.length > 0) {
      text += `*${entityType === "vendor" ? "MILK RECEIVED" : "MILK DELIVERED"}:*\n`;
      entityTransactions.forEach(t => {
        const date = format(new Date(t.date!), "dd/MM/yyyy");
        text += `${date} - ${t.quantity}L ${t.milkType} - ${formatCurrency(t.totalAmount)}\n`;
      });
      text += `Subtotal: ${formatCurrency(totals.transactions)} (${totals.milkWeight}L)\n\n`;
    }
    
    // Add payments
    if (entityPayments.length > 0) {
      text += `*PAYMENTS:*\n`;
      entityPayments.forEach(p => {
        const date = format(new Date(p.date!), "dd/MM/yyyy");
        const method = p.method ? ` via ${p.method.toUpperCase()}` : '';
        const reference = p.reference ? ` (Ref: ${p.reference})` : '';
        const notes = p.notes ? ` - ${p.notes}` : '';
        text += `${date} - ${formatCurrency(p.amount)}${method}${reference}${notes}\n`;
      });
      text += `Subtotal: ${formatCurrency(totals.payments)}\n\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    // Add milk weight summary
    if (startDate && totals.previousMilkWeight > 0) {
      text += `*MILK WEIGHT SUMMARY:*\n`;
      text += `Previous: ${totals.previousMilkWeight}L\n`;
      text += `Period: ${totals.milkWeight}L\n`;
      text += `Total: ${totals.totalMilkWeight}L\n\n`;
    } else if (totals.milkWeight > 0) {
      text += `*TOTAL MILK WEIGHT: ${totals.milkWeight}L*\n\n`;
    }
    
    // Show period balance and final balance
    if (startDate && Math.abs(totals.previousBalance) > 0.01) {
      text += `*PERIOD BALANCE: ${formatCurrency(Math.abs(totals.balance))}*\n`;
      text += totals.balance > 0 
        ? `Period Status: ${entityType === "vendor" ? "Amount Due" : "Credit Balance"}\n`
        : totals.balance < 0 
        ? `Period Status: ${entityType === "vendor" ? "Advance Payment" : "Amount Due"}\n`
        : `Period Status: Settled\n`;
      
      text += `\n*FINAL BALANCE: ${formatCurrency(Math.abs(totals.finalBalance))}*\n`;
      text += totals.finalBalance > 0 
        ? `Final Status: ${entityType === "vendor" ? "Amount Due" : "Credit Balance"}\n`
        : totals.finalBalance < 0 
        ? `Final Status: ${entityType === "vendor" ? "Advance Payment" : "Amount Due"}\n`
        : `Final Status: Settled\n`;
    } else {
      text += `*BALANCE: ${formatCurrency(Math.abs(totals.balance))}*\n`;
      text += totals.balance > 0 
        ? `Status: ${entityType === "vendor" ? "Amount Due" : "Credit Balance"}\n`
        : totals.balance < 0 
        ? `Status: ${entityType === "vendor" ? "Advance Payment" : "Amount Due"}\n`
        : `Status: Settled\n`;
    }
    
    return text;
  };

  const confirmWhatsAppSend = () => {
    setShowWhatsAppConfirm(true);
  };

  const sendViaWhatsApp = async () => {
    try {
      setIsSendingWhatsApp(true);
      setShowWhatsAppConfirm(false);
      const message = generateLedgerText();
      const phoneNumber = entity.contact.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      
      // Format phone number for WhatsApp with Pakistan country code (+92)
      const formattedNumber = phoneNumber.startsWith("92") ? phoneNumber : `92${phoneNumber}`;
      
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");
      
      toast({
        title: "Success",
        description: "WhatsApp opened with ledger message",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const confirmSMSSend = () => {
    setShowSMSConfirm(true);
  };

  const sendViaSMS = async () => {
    try {
      setIsSendingSMS(true);
      setShowSMSConfirm(false);
      const message = generateLedgerText();
      const phoneNumber = entity.contact.replace(/[^0-9]/g, "");
      
      // Create SMS URL to open device's SMS app
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      
      // On mobile devices, use window.location.href
      // On desktop, use window.open as fallback
      if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)) {
        window.location.href = smsUrl;
      } else {
        window.open(smsUrl, "_self");
      }
      
      toast({
        title: "SMS App Opened",
        description: "Your device's SMS app opened with the ledger message",
      });
    } catch (error) {
      // Fallback: copy to clipboard
      try {
        const phoneNumber = entity.contact.replace(/[^0-9]/g, "");
        const message = generateLedgerText();
        await navigator.clipboard.writeText(`Phone: ${phoneNumber}\n\nMessage:\n${message}`);
        
        toast({
          title: "SMS Details Copied",
          description: "Phone number and message copied to clipboard. Paste in your SMS app.",
        });
      } catch (clipboardError) {
        toast({
          title: "SMS Ready",
          description: `Send SMS to ${phoneNumber} with the ledger details shown above.`,
        });
      }
    } finally {
      setIsSendingSMS(false);
    }
  };

  const downloadLedger = () => {
    const text = generateLedgerText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity.name}_ledger_${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Ledger downloaded successfully",
    });
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const renderContent = () => (
    <div className="space-y-6">
          {/* Date Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Range Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 sm:flex-initial">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {(startDate || endDate) && (
                    <Button variant="outline" onClick={clearDateFilter}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settlement Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Settlement & Archive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  {latestSettlementDate && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Last Settlement: {format(new Date(latestSettlementDate), "dd/MM/yyyy")}
                    </div>
                  )}
                  <div className="text-sm">
                    Current Balance: <span className={`font-medium ${totals.finalBalance > 0 ? 'text-green-600' : totals.finalBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatCurrency(Math.abs(totals.finalBalance))}
                    </span>
                    {isAutoSettled ? (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Auto-Settled
                      </span>
                    ) : totals.finalBalance !== 0 && (
                      <span className="ml-1 text-xs">
                        ({totals.finalBalance > 0 ? (entityType === 'vendor' ? 'Due' : 'Credit') : (entityType === 'vendor' ? 'Advance' : 'Due')})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleShowArchive} className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    View Archive ({entitySettlements.length})
                  </Button>
                  {!isAutoSettled && (
                    <Button 
                      onClick={() => setShowSettlementDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Archive className="h-4 w-4" />
                      Auto-Settlement
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          

          {/* Previous Balance (shown only when date filter is applied) */}
          {startDate && Math.abs(totals.previousBalance) > 0.01 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent>
                <div className="text-center p-4">
                  <div className="text-sm text-muted-foreground">
                    Balance before {format(new Date(startDate), "dd/MM/yyyy")}
                  </div>
                  <div className={`text-3xl font-bold ${totals.previousBalance > 0 ? "text-red-600" : totals.previousBalance < 0 ? "text-green-600" : "text-gray-600"}`}>
                    {formatCurrency(Math.abs(totals.previousBalance))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {totals.previousBalance > 0 
                      ? (entityType === "vendor" ? "Amount Due" : "Credit Balance") 
                      : totals.previousBalance < 0 
                      ? (entityType === "vendor" ? "Advance Payment" : "Amount Due")
                      : "Settled"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                {startDate && Math.abs(totals.previousBalance) > 0.01 ? "Period Summary" : "Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    {startDate && totals.previousMilkWeight > 0 ? "Period Weight" : "Milk Weight"}
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{totals.milkWeight}L</div>
                  {startDate && totals.previousMilkWeight > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Total: {totals.totalMilkWeight}L
                    </div>
                  )}
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    {entityType === "vendor" ? "Milk Purchased" : "Milk Sold"}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.transactions)}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Payments</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.payments)}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    {startDate && Math.abs(totals.previousBalance) > 0.01 ? "Period Balance" : "Balance"}
                  </div>
                  <div className={`text-2xl font-bold ${totals.balance > 0 ? "text-red-600" : totals.balance < 0 ? "text-green-600" : "text-gray-600"}`}>
                    {formatCurrency(Math.abs(totals.balance))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totals.balance > 0 
                      ? (entityType === "vendor" ? "Amount Due" : "Credit") 
                      : totals.balance < 0 
                      ? (entityType === "vendor" ? "Advance" : "Amount Due")
                      : "Settled"}
                  </div>
                </div>
              </div>
              
              {/* Final Balance (shown only when there's a previous balance) */}
              {startDate && Math.abs(totals.previousBalance) > 0.01 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-center p-4 bg-slate-100 rounded-lg border-2 border-slate-300">
                    <div className="text-sm text-muted-foreground font-semibold">FINAL BALANCE</div>
                    <div className={`text-3xl font-bold ${totals.finalBalance > 0 ? "text-red-600" : totals.finalBalance < 0 ? "text-green-600" : "text-gray-600"}`}>
                      {formatCurrency(Math.abs(totals.finalBalance))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {totals.finalBalance > 0 
                        ? (entityType === "vendor" ? "Amount Due" : "Credit Balance") 
                        : totals.finalBalance < 0 
                        ? (entityType === "vendor" ? "Advance Payment" : "Amount Due")
                        : "Settled"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          

          {/* Communication Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={confirmWhatsAppSend} 
              disabled={isSendingWhatsApp} 
              className="flex items-center justify-center gap-2 w-full"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{isSendingWhatsApp ? "Opening WhatsApp..." : "Send via WhatsApp"}</span>
              <span className="sm:hidden">WhatsApp</span>
            </Button>
            
            <Button 
              onClick={confirmSMSSend} 
              disabled={isSendingSMS} 
              variant="outline"
              className="flex items-center justify-center gap-2 w-full"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">{isSendingSMS ? "Opening SMS..." : "Send via SMS"}</span>
              <span className="sm:hidden">SMS</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={downloadLedger} 
              className="flex items-center justify-center gap-2 w-full"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Ledger</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {entityType === "vendor" ? "Milk Purchases" : "Milk Sales"} 
                ({entityTransactions.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entityTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found for the selected period
                </p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entityTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div>
                                <div>{format(new Date(transaction.date!), "dd/MM/yyyy")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(transaction.date!), { addSuffix: true })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {transaction.milkType}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.quantity}L</TableCell>
                            <TableCell>{formatCurrency(transaction.rate)}/L</TableCell>
                            <TableCell className="font-medium">{formatCurrency(transaction.totalAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {entityTransactions.map((transaction) => (
                      <Card key={transaction.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">{format(new Date(transaction.date!), "dd/MM/yyyy")}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(transaction.date!), { addSuffix: true })}
                            </div>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {transaction.milkType}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <div className="font-medium">{transaction.quantity}L</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate:</span>
                            <div className="font-medium">{formatCurrency(transaction.rate)}/L</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Amount:</span>
                            <div className="font-bold text-lg">{formatCurrency(transaction.totalAmount)}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payments ({entityPayments.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              {entityPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No payments found for the selected period
                </p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entityPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div>
                                <div>{format(new Date(payment.date!), "dd/MM/yyyy")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(payment.date!), { addSuffix: true })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {payment.method}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.reference || "-"}</TableCell>
                            <TableCell>{payment.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {entityPayments.map((payment) => (
                      <Card key={payment.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">{format(new Date(payment.date!), "dd/MM/yyyy")}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(payment.date!), { addSuffix: true })}
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {payment.method}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-bold text-lg">{formatCurrency(payment.amount)}</span>
                          </div>
                          {payment.reference && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reference:</span>
                              <span>{payment.reference}</span>
                            </div>
                          )}
                          {payment.notes && (
                            <div>
                              <span className="text-muted-foreground">Notes:</span>
                              <div className="mt-1">{payment.notes}</div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
  );

  // If no onClose prop provided, render as standalone component
  if (!onClose) {
    return (
      <>
        {renderContent()}
        
        {/* WhatsApp Confirmation Dialog */}
        <AlertDialog open={showWhatsAppConfirm} onOpenChange={setShowWhatsAppConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send Ledger via WhatsApp</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to send the ledger details to {entity.name} via WhatsApp?
                <br />
                <span className="text-sm text-muted-foreground">Contact: {entity.contact}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={sendViaWhatsApp}>
                Send WhatsApp Message
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* SMS Confirmation Dialog */}
        <AlertDialog open={showSMSConfirm} onOpenChange={setShowSMSConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send Ledger via SMS</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to send the ledger details to {entity.name} via SMS?
                <br />
                <span className="text-sm text-muted-foreground">Contact: {entity.contact}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={sendViaSMS}>
                Send SMS Message
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Otherwise render as dialog
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{entity.name} - Ledger</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
      
      {/* WhatsApp Confirmation Dialog */}
      <AlertDialog open={showWhatsAppConfirm} onOpenChange={setShowWhatsAppConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Ledger via WhatsApp</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send the ledger details to {entity.name} via WhatsApp?
              <br />
              <span className="text-sm text-muted-foreground">Contact: {entity.contact}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendViaWhatsApp}>
              Send WhatsApp Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SMS Confirmation Dialog */}
      <AlertDialog open={showSMSConfirm} onOpenChange={setShowSMSConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Ledger via SMS</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send the ledger details to {entity.name} via SMS?
              <br />
              <span className="text-sm text-muted-foreground">Contact: {entity.contact}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={sendViaSMS}>
              Send SMS Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settlement Creation Dialog */}
      <Dialog open={showSettlementDialog} onOpenChange={setShowSettlementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Auto-Settlement</DialogTitle>
            <DialogDescription>
              This will automatically settle all transactions and payments, clear the remaining balance, and archive all data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">What will happen:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {Math.abs(totals.finalBalance) > 0.01 ? (
                  <>
                    <li>• Clear remaining balance of {formatCurrency(Math.abs(totals.finalBalance))}</li>
                    <li>• {totals.finalBalance > 0 
                      ? `Create settlement payment to clear what ${entity.name} owes`
                      : `Create settlement entry to clear what you owe ${entity.name}`}
                    </li>
                  </>
                ) : (
                  <li>• Balance is already settled</li>
                )}
                <li>• Archive all existing transactions and payments</li>
                <li>• Start fresh with zero balance</li>
              </ul>
            </div>
            <div>
              <Label htmlFor="settlement-notes">Settlement Notes (Optional)</Label>
              <Input
                id="settlement-notes"
                placeholder="e.g., Full payment received, Account settled"
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettlementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualSettlement}>
              {Math.abs(totals.finalBalance) > 0.01 ? "Auto-Settle & Archive" : "Archive Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive View Dialog */}
      <Dialog open={showArchiveView} onOpenChange={setShowArchiveView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Archive History - {entity.name}</DialogTitle>
            <DialogDescription>
              View historical settlements and archived data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {entitySettlements.map((settlement) => (
              <Card key={settlement.id} className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Settlement - {format(new Date(settlement.settlementDate), "dd/MM/yyyy")}</span>
                    <Badge variant="secondary">
                      {formatCurrency(Math.abs(settlement.amount))}
                    </Badge>
                  </CardTitle>
                  {settlement.notes && (
                    <p className="text-sm text-muted-foreground">{settlement.notes}</p>
                  )}
                </CardHeader>
              </Card>
            ))}
            {entitySettlements.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>No settlements found.</p>
                <p className="text-sm mt-2">Settlements are automatically created when balance is less than ₹1.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowArchiveView(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}