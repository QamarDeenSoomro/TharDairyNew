import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Send, Download, X, MessageSquare, Smartphone } from "lucide-react";
import { useTransactions, usePayments } from "@/hooks/useFirestore";
import { formatDistanceToNow, format, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { FirebaseVendor, FirebaseCustomer } from "@/services/firebase-realtime";
import { formatCurrency } from "@/lib/utils";

interface LedgerViewProps {
  entity: FirebaseVendor | FirebaseCustomer;
  entityType: "vendor" | "customer";
  isOpen: boolean;
  onClose: () => void;
}

export default function LedgerView({ entity, entityType, isOpen, onClose }: LedgerViewProps) {
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  // Filter transactions for this entity
  const entityTransactions = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (entityType === "vendor") {
        return t.vendorId === entity.id && t.type === "receive";
      } else {
        return t.customerId === entity.id && t.type === "send";
      }
    });

    // Apply date filter if dates are selected
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date
      
      return filtered.filter(t => {
        const transactionDate = new Date(t.date!);
        return isWithinInterval(transactionDate, { start, end });
      });
    }

    return filtered;
  }, [transactions, entity.id, entityType, startDate, endDate]);

  // Filter payments for this entity
  const entityPayments = useMemo(() => {
    const filtered = payments.filter(p => {
      if (entityType === "vendor") {
        return p.vendorId === entity.id && p.type === "paid";
      } else {
        return p.customerId === entity.id && p.type === "received";
      }
    });

    // Apply date filter if dates are selected
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return filtered.filter(p => {
        const paymentDate = new Date(p.date!);
        return isWithinInterval(paymentDate, { start, end });
      });
    }

    return filtered;
  }, [payments, entity.id, entityType, startDate, endDate]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalTransactions = entityTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPayments = entityPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = entityType === "vendor" ? totalTransactions - totalPayments : totalPayments - totalTransactions;
    
    return {
      transactions: totalTransactions,
      payments: totalPayments,
      balance,
    };
  }, [entityTransactions, entityPayments, entityType]);

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
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Add transactions
    if (entityTransactions.length > 0) {
      text += `*${entityType === "vendor" ? "MILK RECEIVED" : "MILK DELIVERED"}:*\n`;
      entityTransactions.forEach(t => {
        const date = format(new Date(t.date!), "dd/MM/yyyy");
        text += `${date} - ${t.quantity}L ${t.milkType} - ${formatCurrency(t.totalAmount)}\n`;
      });
      text += `Subtotal: ${formatCurrency(totals.transactions)}\n\n`;
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
    text += `*BALANCE: ${formatCurrency(Math.abs(totals.balance))}*\n`;
    text += totals.balance > 0 
      ? `Status: ${entityType === "vendor" ? "Amount Due" : "Credit Balance"}\n`
      : totals.balance < 0 
      ? `Status: ${entityType === "vendor" ? "Advance Payment" : "Amount Due"}\n`
      : `Status: Settled\n`;
    
    return text;
  };

  const sendViaWhatsApp = async () => {
    try {
      setIsSendingWhatsApp(true);
      const message = generateLedgerText();
      const phoneNumber = entity.contact.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      
      // Format phone number for WhatsApp (add country code if not present)
      const formattedNumber = phoneNumber.startsWith("91") ? phoneNumber : `91${phoneNumber}`;
      
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

  const sendViaSMS = async () => {
    try {
      setIsSendingSMS(true);
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

  return (
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
                <div className="flex-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  {(startDate || endDate) && (
                    <Button variant="outline" onClick={clearDateFilter}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <div className="text-sm text-muted-foreground">Balance</div>
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
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Button variant="outline" className="h-16 flex flex-col gap-1">
                  <span className="material-icons text-lg">payment</span>
                  <span className="text-xs">Make Payment</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-1">
                  <span className="material-icons text-lg">receipt</span>
                  <span className="text-xs">Receive Payment</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-1">
                  <span className="material-icons text-lg">move_down</span>
                  <span className="text-xs">{entityType === "vendor" ? "Record Milk" : "Send Milk"}</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col gap-1">
                  <span className="material-icons text-lg">edit</span>
                  <span className="text-xs">Edit Details</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Communication Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={sendViaWhatsApp} 
              disabled={isSendingWhatsApp} 
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {isSendingWhatsApp ? "Opening WhatsApp..." : "Send via WhatsApp"}
            </Button>
            
            <Button 
              onClick={sendViaSMS} 
              disabled={isSendingSMS} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              {isSendingSMS ? "Opening SMS..." : "Send via SMS"}
            </Button>
            
            <Button variant="outline" onClick={downloadLedger} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Ledger
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
      </DialogContent>
    </Dialog>
  );
}