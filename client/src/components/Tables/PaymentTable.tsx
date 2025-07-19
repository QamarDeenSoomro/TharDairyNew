import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowDown, ArrowUp, Receipt, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Payment, Vendor, Customer } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { paymentService } from "@/services/firebase-realtime";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "@/components/Forms/PaymentForm";

interface PaymentTableProps {
  payments: Payment[];
  vendors: Vendor[];
  customers: Customer[];
  showPagination?: boolean;
  showActions?: boolean;
}

export default function PaymentTable({ payments, vendors, customers, showPagination = true, showActions = true }: PaymentTableProps) {
  const { toast } = useToast();
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setDialogOpen(true);
  };

  const handleDelete = async (paymentId: string) => {
    try {
      await paymentService.delete(paymentId);
      toast({
        title: "Success",
        description: "Payment record deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment record",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (paymentData: any) => {
    if (!editingPayment) return;
    
    try {
      await paymentService.update(editingPayment.id.toString(), paymentData);
      toast({
        title: "Success",
        description: "Payment record updated successfully",
      });
      setDialogOpen(false);
      setEditingPayment(null);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update payment record",
        variant: "destructive",
      });
    }
  };
  const getPartyName = (payment: Payment) => {
    if (payment.vendorId) {
      const vendor = vendors.find(v => v.id === payment.vendorId);
      return vendor?.name || 'Unknown Vendor';
    }
    if (payment.customerId) {
      const customer = customers.find(c => c.id === payment.customerId);
      return customer?.name || 'Unknown Customer';
    }
    return 'Unknown';
  };

  const getPartyType = (payment: Payment) => {
    return payment.vendorId ? 'Vendor' : 'Customer';
  };

  const getTypeIcon = (type: string) => {
    return type === 'received' ? (
      <ArrowDown className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUp className="h-4 w-4 text-orange-600" />
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'received' ? (
      <Badge variant="outline" className="text-green-600 border-green-600">
        Received
      </Badge>
    ) : (
      <Badge variant="outline" className="text-orange-600 border-orange-600">
        Paid
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodColors = {
      cash: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      bank: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      cheque: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    };

    return (
      <Badge variant="secondary" className={methodColors[method as keyof typeof methodColors]}>
        {method.toUpperCase()}
      </Badge>
    );
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No payments found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reference</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="hover:bg-muted/50">
              <TableCell className="text-muted-foreground">
                {new Date(payment.date!).toLocaleDateString()}
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(payment.date!), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(payment.type)}
                  <div>
                    <div className="font-medium">{getPartyName(payment)}</div>
                    <div className="text-xs text-muted-foreground">{getPartyType(payment)}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getTypeBadge(payment.type)}
              </TableCell>
              <TableCell>
                {getMethodBadge(payment.method)}
              </TableCell>
              <TableCell className="font-medium">
                <span className={payment.type === 'received' ? 'text-green-600' : 'text-orange-600'}>
                  {payment.type === 'received' ? '+' : '-'}{formatCurrency(payment.amount)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {payment.reference || '-'}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(payment)}
                      title="Edit Payment"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Delete Payment">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this payment record? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(payment.id.toString())}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm
            vendors={vendors}
            customers={customers}
            payment={editingPayment || undefined}
            onSuccess={handleUpdate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
