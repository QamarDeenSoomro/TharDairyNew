import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, Upload, RotateCcw } from "lucide-react";
import { vendorService, customerService, transactionService, paymentService } from "@/services/firebase-realtime";
import { format } from "date-fns";

export default function DatabaseManagement() {
  const { toast } = useToast();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Backup database
  const handleBackup = async () => {
    try {
      setIsProcessing(true);
      
      // Fetch all data
      const [vendors, customers, transactions, payments] = await Promise.all([
        vendorService.getAll(),
        customerService.getAll(),
        transactionService.getAll(),
        paymentService.getAll()
      ]);

      // Create backup object
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          vendors,
          customers,
          transactions,
          payments
        }
      };

      // Convert to JSON and create download
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `milk-system-backup-${format(new Date(), "yyyy-MM-dd-HHmmss")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Database backup created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore database
  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      // Read file
      const text = await file.text();
      const backup = JSON.parse(text);

      // Validate backup structure
      if (!backup.version || !backup.data) {
        throw new Error("Invalid backup file format");
      }

      // Clear existing data
      await handleReset(false);

      // Restore data
      const { vendors, customers, transactions, payments } = backup.data;

      // Restore vendors
      for (const vendor of vendors || []) {
        const { id, ...vendorData } = vendor;
        await vendorService.create(vendorData);
      }

      // Restore customers
      for (const customer of customers || []) {
        const { id, ...customerData } = customer;
        await customerService.create(customerData);
      }

      // Wait a bit to ensure vendors/customers are created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Restore transactions
      for (const transaction of transactions || []) {
        const { id, ...transactionData } = transaction;
        await transactionService.create(transactionData);
      }

      // Restore payments
      for (const payment of payments || []) {
        const { id, ...paymentData } = payment;
        await paymentService.create(paymentData);
      }

      toast({
        title: "Success",
        description: "Database restored successfully",
      });

      // Reset file input
      event.target.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to restore backup",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setRestoreDialogOpen(false);
    }
  };

  // Reset database
  const handleReset = async (showToast = true) => {
    try {
      setIsProcessing(true);

      // Get all data
      const [vendors, customers, transactions, payments] = await Promise.all([
        vendorService.getAll(),
        customerService.getAll(),
        transactionService.getAll(),
        paymentService.getAll()
      ]);

      // Delete all records
      const deletePromises = [
        ...vendors.map(v => vendorService.delete(v.id)),
        ...customers.map(c => customerService.delete(c.id)),
        ...transactions.map(t => transactionService.delete(t.id)),
        ...payments.map(p => paymentService.delete(p.id))
      ];

      await Promise.all(deletePromises);

      if (showToast) {
        toast({
          title: "Success",
          description: "Database reset successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset database",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setResetDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-8 w-8" />
          Database Management
        </h1>
        <p className="text-muted-foreground mt-2">Backup, restore, and manage your database</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Backup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup Database
            </CardTitle>
            <CardDescription>
              Download a complete backup of your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleBackup} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Download Backup"}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore Database
            </CardTitle>
            <CardDescription>
              Restore from a previous backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setRestoreDialogOpen(true)}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Upload Backup"}
            </Button>
          </CardContent>
        </Card>

        {/* Reset Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Reset Database
            </CardTitle>
            <CardDescription>
              Clear all data and start fresh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setResetDialogOpen(true)}
              disabled={isProcessing}
              variant="destructive"
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Reset Database"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all vendors, customers, transactions, and payments from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleReset()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Database</AlertDialogTitle>
            <AlertDialogDescription>
              Select a backup file to restore. This will replace all current data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}