import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomerForm from "@/components/Forms/CustomerForm";
import LedgerView from "@/components/Ledger/LedgerView";
import type { FirebaseCustomer } from "@/services/firebase-realtime";
import { useTransactions, usePayments } from "@/hooks/useFirestore";
import { calculateCustomerBalance } from "@/utils/calculateBalance";

interface CustomerTableProps {
  customers: FirebaseCustomer[];
  onDelete?: (id: string) => void;
}

export default function CustomerTable({ customers, onDelete }: CustomerTableProps) {
  const { toast } = useToast();
  const [editingCustomer, setEditingCustomer] = useState<FirebaseCustomer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ledgerCustomer, setLedgerCustomer] = useState<FirebaseCustomer | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const { transactions } = useTransactions();
  const { payments } = usePayments();

  const handleDelete = async (id: string) => {
    try {
      if (onDelete) {
        await onDelete(id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No customers found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Cow Rate</TableHead>
              <TableHead>Buffalo Rate</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {getInitials(customer.name)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.location}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.contact}</TableCell>
                <TableCell>
                  <Badge variant="secondary">₹{customer.cowRate}/L</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">₹{customer.buffaloRate}/L</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={calculateCustomerBalance(customer.id, transactions, payments) > 0 ? "destructive" : "secondary"}>
                    ₹{calculateCustomerBalance(customer.id, transactions, payments).toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.location}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLedgerCustomer(customer);
                        setLedgerOpen(true);
                      }}
                      title="View Ledger"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {customer.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(customer.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {getInitials(customer.name)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.contact}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLedgerCustomer(customer);
                    setLedgerOpen(true);
                  }}
                  title="View Ledger"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCustomer(customer);
                    setDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {customer.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(customer.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Cow Rate</div>
                <Badge variant="secondary">₹{customer.cowRate}/L</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Buffalo Rate</div>
                <Badge variant="secondary">₹{customer.buffaloRate}/L</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Balance</div>
              <Badge variant={calculateCustomerBalance(customer.id, transactions, payments) > 0 ? "destructive" : "secondary"}>
                ₹{calculateCustomerBalance(customer.id, transactions, payments).toFixed(2)}
              </Badge>
            </div>
            {customer.location && (
              <div>
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="text-sm">{customer.location}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer || undefined}
            onSuccess={() => {
              setDialogOpen(false);
              setEditingCustomer(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {ledgerCustomer && (
        <LedgerView
          entity={ledgerCustomer}
          entityType="customer"
          isOpen={ledgerOpen}
          onClose={() => {
            setLedgerOpen(false);
            setLedgerCustomer(null);
          }}
        />
      )}
    </>
  );
}
