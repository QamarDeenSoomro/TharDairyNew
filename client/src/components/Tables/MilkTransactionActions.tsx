import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { transactionService } from "@/services/firebase-realtime";
import MilkReceiveForm from "@/components/Forms/MilkReceiveForm";
import MilkSendForm from "@/components/Forms/MilkSendForm";
import type { MilkTransaction, Vendor, Customer } from "@shared/schema";

interface MilkTransactionActionsProps {
  transaction: MilkTransaction;
  vendors?: Vendor[];
  customers?: Customer[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MilkTransactionActions({ 
  transaction, 
  vendors = [], 
  customers = [], 
  onEdit, 
  onDelete 
}: MilkTransactionActionsProps) {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = () => {
    setEditDialogOpen(true);
    onEdit?.();
  };

  const handleDelete = async () => {
    try {
      await transactionService.delete(transaction.id.toString());
      toast({
        title: "Success",
        description: "Transaction record deleted successfully",
      });
      onDelete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction record",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (transactionData: any) => {
    try {
      await transactionService.update(transaction.id.toString(), transactionData);
      toast({
        title: "Success",
        description: "Transaction record updated successfully",
      });
      setEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update transaction record",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          title="Edit Transaction"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Delete Transaction">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this milk transaction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {transaction.type === 'receive' ? 'Milk Receipt' : 'Milk Delivery'}</DialogTitle>
          </DialogHeader>
          {transaction.type === 'receive' ? (
            <MilkReceiveForm
              vendors={vendors}
              transaction={transaction}
              onSuccess={handleUpdate}
            />
          ) : (
            <MilkSendForm
              customers={customers}
              transaction={transaction}
              onSuccess={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}