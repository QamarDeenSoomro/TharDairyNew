import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Download, FileText, MessageSquare, Smartphone, Receipt, ArrowDown, ArrowUp } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, formatDistanceToNow, parseISO } from "date-fns";
import { useFirestore } from "@/hooks/useFirestore";
import { formatCurrency } from "@/lib/utils";
import type { Vendor, Customer, Transaction, Payment } from "@shared/schema";
import * as XLSX from "xlsx";

interface StatementEntry {
  id: string;
  date: Date;
  type: 'transaction' | 'payment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
  method?: string;
  milkType?: string;
  quantity?: number;
  rate?: number;
}

type DateFilter = 'today' | 'week' | 'month' | 'range' | 'all';

export default function BankStatement() {
  const [, setLocation] = useLocation();
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [partyType, setPartyType] = useState<'vendor' | 'customer'>('vendor');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);
  const [showSMSConfirm, setShowSMSConfirm] = useState(false);

  const { data: vendors = [] } = useFirestore<Vendor>('vendors');
  const { data: customers = [] } = useFirestore<Customer>('customers');
  const { data: transactions = [] } = useFirestore<Transaction>('milk_transactions');
  const { data: payments = [] } = useFirestore<Payment>('payments');

  const currentParty = useMemo(() => {
    if (!selectedParty) return null;
    if (partyType === 'vendor') {
      return vendors.find(v => v.id === selectedParty);
    } else {
      return customers.find(c => c.id === selectedParty);
    }
  }, [selectedParty, partyType, vendors, customers]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'range':
        if (startDate && endDate) {
          return { 
            start: startOfDay(parseISO(startDate)), 
            end: endOfDay(parseISO(endDate)) 
          };
        }
        return null;
      case 'all':
      default:
        return null;
    }
  };

  const statementEntries = useMemo(() => {
    if (!selectedParty || !currentParty) return [];

    const dateRange = getDateRange();
    const entries: StatementEntry[] = [];

    // Get relevant transactions
    const partyTransactions = transactions.filter(t => {
      if (partyType === 'vendor') {
        return t.vendorId === selectedParty;
      } else {
        return t.customerId === selectedParty;
      }
    }).filter(t => {
      if (!dateRange) return true;
      const transactionDate = new Date(t.date!);
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    });

    // Get relevant payments
    const partyPayments = payments.filter(p => {
      if (partyType === 'vendor') {
        return p.vendorId === selectedParty;
      } else {
        return p.customerId === selectedParty;
      }
    }).filter(p => {
      if (!dateRange) return true;
      const paymentDate = new Date(p.date!);
      return paymentDate >= dateRange.start && paymentDate <= dateRange.end;
    });

    // Convert transactions to statement entries
    partyTransactions.forEach(transaction => {
      const isDebit = partyType === 'vendor'; // For vendors, milk purchases are debits (we owe them)
      entries.push({
        id: transaction.id,
        date: new Date(transaction.date!),
        type: 'transaction',
        description: `Milk ${transaction.type} - ${transaction.milkType} (${transaction.quantity}L @ ${formatCurrency(transaction.rate)}/L)`,
        debit: isDebit ? transaction.totalAmount : 0,
        credit: isDebit ? 0 : transaction.totalAmount,
        balance: 0, // Will be calculated later
        milkType: transaction.milkType,
        quantity: transaction.quantity,
        rate: transaction.rate
      });
    });

    // Convert payments to statement entries
    partyPayments.forEach(payment => {
      const isCredit = (partyType === 'vendor' && payment.type === 'paid') || 
                      (partyType === 'customer' && payment.type === 'received');
      entries.push({
        id: payment.id,
        date: new Date(payment.date!),
        type: 'payment',
        description: `Payment ${payment.type} - ${payment.method}${payment.notes ? ` (${payment.notes})` : ''}`,
        debit: isCredit ? 0 : payment.amount,
        credit: isCredit ? payment.amount : 0,
        balance: 0, // Will be calculated later
        reference: payment.reference,
        method: payment.method
      });
    });

    // Sort by date
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance
    let runningBalance = 0;
    entries.forEach(entry => {
      runningBalance += entry.debit - entry.credit;
      entry.balance = runningBalance;
    });

    return entries;
  }, [selectedParty, currentParty, partyType, transactions, payments, dateFilter, startDate, endDate]);

  const summaryStats = useMemo(() => {
    const totalDebits = statementEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredits = statementEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const finalBalance = totalDebits - totalCredits;
    const transactionCount = statementEntries.filter(e => e.type === 'transaction').length;
    const paymentCount = statementEntries.filter(e => e.type === 'payment').length;

    return {
      totalDebits,
      totalCredits,
      finalBalance,
      transactionCount,
      paymentCount,
      totalEntries: statementEntries.length
    };
  }, [statementEntries]);

  const downloadStatement = () => {
    if (!currentParty || statementEntries.length === 0) return;

    const worksheetData = [
      ['STATEMENT'],
      ['Party Name:', currentParty.name],
      ['Contact:', currentParty.contact],
      ['Statement Period:', dateFilter === 'all' ? 'All Time' : `${startDate || 'Start'} to ${endDate || 'End'}`],
      ['Generated On:', format(new Date(), "dd/MM/yyyy HH:mm")],
      [''],
      ['Date', 'Description', 'Debit', 'Credit', 'Balance', 'Reference']
    ];

    statementEntries.forEach(entry => {
      worksheetData.push([
        format(entry.date, "dd/MM/yyyy"),
        entry.description,
        entry.debit || '',
        entry.credit || '',
        entry.balance,
        entry.reference || ''
      ]);
    });

    worksheetData.push(
      [''],
      ['SUMMARY'],
      ['Total Debits:', summaryStats.totalDebits],
      ['Total Credits:', summaryStats.totalCredits],
      ['Final Balance:', summaryStats.finalBalance],
      ['Total Transactions:', summaryStats.transactionCount],
      ['Total Payments:', summaryStats.paymentCount]
    );

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statement');
    
    const fileName = `${currentParty.name.replace(/\s+/g, '_')}_Statement_${format(new Date(), 'ddMMyyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const generateMessage = () => {
    if (!currentParty) return "";

    const dateRangeText = dateFilter === 'all' ? 'All Time' : 
      dateFilter === 'range' ? `${startDate} to ${endDate}` :
      dateFilter === 'today' ? 'Today' :
      dateFilter === 'week' ? 'This Week' :
      dateFilter === 'month' ? 'This Month' : '';

    return `*${currentParty.name} - Statement*

Period: ${dateRangeText}
Total Entries: ${summaryStats.totalEntries}
Total Debits: ${formatCurrency(summaryStats.totalDebits)}
Total Credits: ${formatCurrency(summaryStats.totalCredits)}
Final Balance: ${formatCurrency(Math.abs(summaryStats.finalBalance))} ${summaryStats.finalBalance >= 0 ? (partyType === 'vendor' ? '(Due)' : '(Credit)') : (partyType === 'vendor' ? '(Advance)' : '(Due)')}

*Recent Entries:*
${statementEntries.slice(-5).map(entry => 
  `${format(entry.date, "dd/MM")} | ${entry.description.substring(0, 30)}... | ${formatCurrency(entry.balance)}`
).join('\n')}

Generated by Thar Dairy Management System`;
  };

  const sendViaWhatsApp = () => {
    if (!currentParty) return;
    const message = generateMessage();
    const phoneNumber = currentParty.contact.replace(/\D/g, '');
    const whatsappURL = `https://wa.me/92${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    setShowWhatsAppConfirm(false);
  };

  const sendViaSMS = () => {
    if (!currentParty) return;
    const message = generateMessage();
    const phoneNumber = currentParty.contact.replace(/\D/g, '');
    const smsURL = `sms:+92${phoneNumber}?body=${encodeURIComponent(message)}`;
    window.open(smsURL, '_self');
    setShowSMSConfirm(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Statement</h1>
            <p className="text-muted-foreground">Complete transaction history for vendors and customers</p>
          </div>
        </div>
      </div>

      {/* Party Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Party Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Party Type</Label>
              <Select value={partyType} onValueChange={(value: 'vendor' | 'customer') => {
                setPartyType(value);
                setSelectedParty("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Party</Label>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a party" />
                </SelectTrigger>
                <SelectContent>
                  {(partyType === 'vendor' ? vendors : customers).map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name} - {party.contact}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedParty && currentParty && (
        <>
          {/* Date Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Period</Label>
                  <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="range">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dateFilter === 'range' && (
                  <>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{currentParty.name} - Statement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Debits</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(summaryStats.totalDebits)}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Credits</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(summaryStats.totalCredits)}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Final Balance</div>
                  <div className={`text-xl font-bold ${summaryStats.finalBalance > 0 ? 'text-red-600' : summaryStats.finalBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(summaryStats.finalBalance))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {summaryStats.finalBalance > 0 
                      ? (partyType === 'vendor' ? 'Due' : 'Credit') 
                      : summaryStats.finalBalance < 0 
                      ? (partyType === 'vendor' ? 'Advance' : 'Due')
                      : 'Settled'}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="text-xl font-bold text-purple-600">{summaryStats.transactionCount}</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Payments</div>
                  <div className="text-xl font-bold text-orange-600">{summaryStats.paymentCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={() => setShowWhatsAppConfirm(true)} 
              className="flex items-center justify-center gap-2"
              disabled={statementEntries.length === 0}
            >
              <MessageSquare className="h-4 w-4" />
              Send via WhatsApp
            </Button>
            
            <Button 
              onClick={() => setShowSMSConfirm(true)} 
              variant="outline"
              className="flex items-center justify-center gap-2"
              disabled={statementEntries.length === 0}
            >
              <Smartphone className="h-4 w-4" />
              Send via SMS
            </Button>
            
            <Button 
              variant="outline" 
              onClick={downloadStatement}
              className="flex items-center justify-center gap-2"
              disabled={statementEntries.length === 0}
            >
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
          </div>

          {/* Statement Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Statement Entries ({statementEntries.length} records)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statementEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No entries found for the selected period</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Debit</TableHead>
                          <TableHead>Credit</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Reference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statementEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <div>
                                <div>{format(entry.date, "dd/MM/yyyy")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(entry.date, { addSuffix: true })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {entry.type === 'transaction' ? (
                                  <Receipt className="h-4 w-4 text-blue-600" />
                                ) : entry.debit > 0 ? (
                                  <ArrowUp className="h-4 w-4 text-red-600" />
                                ) : (
                                  <ArrowDown className="h-4 w-4 text-green-600" />
                                )}
                                <div>
                                  <div className="font-medium">{entry.description}</div>
                                  <Badge variant="secondary" className="text-xs">
                                    {entry.type === 'transaction' ? 'Transaction' : 'Payment'}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.debit > 0 && (
                                <span className="text-red-600">{formatCurrency(entry.debit)}</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.credit > 0 && (
                                <span className="text-green-600">{formatCurrency(entry.credit)}</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <span className={entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-gray-600'}>
                                {formatCurrency(Math.abs(entry.balance))}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {entry.reference || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {statementEntries.map((entry) => (
                      <Card key={entry.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {entry.type === 'transaction' ? (
                              <Receipt className="h-4 w-4 text-blue-600" />
                            ) : entry.debit > 0 ? (
                              <ArrowUp className="h-4 w-4 text-red-600" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-green-600" />
                            )}
                            <div>
                              <div className="font-medium text-sm">{format(entry.date, "dd/MM/yyyy")}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(entry.date, { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {entry.type === 'transaction' ? 'Transaction' : 'Payment'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">{entry.description}</div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Debit:</span>
                              <div className="font-medium text-red-600">
                                {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Credit:</span>
                              <div className="font-medium text-green-600">
                                {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Balance:</span>
                              <div className={`font-bold ${entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                {formatCurrency(Math.abs(entry.balance))}
                              </div>
                            </div>
                          </div>
                          {entry.reference && (
                            <div className="text-xs text-muted-foreground">
                              Reference: {entry.reference}
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
        </>
      )}

      {/* WhatsApp Confirmation Dialog */}
      <AlertDialog open={showWhatsAppConfirm} onOpenChange={setShowWhatsAppConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Statement via WhatsApp</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send the statement to {currentParty?.name} via WhatsApp?
              <br />
              <span className="text-sm text-muted-foreground">Contact: {currentParty?.contact}</span>
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
            <AlertDialogTitle>Send Statement via SMS</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send the statement to {currentParty?.name} via SMS?
              <br />
              <span className="text-sm text-muted-foreground">Contact: {currentParty?.contact}</span>
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
    </div>
  );
}