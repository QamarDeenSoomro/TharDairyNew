import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMilkTransactionSchema, type InsertMilkTransaction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { transactionService, type FirebaseVendor } from "@/services/firebase-realtime";
import { smsService } from "@/services/smsService";

interface MilkReceiveFormProps {
  vendors: FirebaseVendor[];
  transaction?: any;
  onSuccess?: (data?: any) => void;
}

export default function MilkReceiveForm({ vendors, transaction, onSuccess }: MilkReceiveFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<FirebaseVendor | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<InsertMilkTransaction | null>(null);

  const form = useForm<InsertMilkTransaction>({
    resolver: zodResolver(insertMilkTransactionSchema),
    defaultValues: transaction ? {
      type: "receive",
      vendorId: transaction.vendorId || "",
      customerId: null,
      milkType: transaction.milkType || "cow",
      quantity: transaction.quantity?.toString() || "",
      rate: transaction.rate?.toString() || "",
      totalAmount: transaction.totalAmount?.toString() || "",
      handlerPerson: transaction.handlerPerson || "",
      time: transaction.time || "morning",
      date: transaction.date ? new Date(transaction.date) : new Date(),
    } : {
      type: "receive",
      vendorId: "",
      customerId: null,
      milkType: "cow",
      quantity: "",
      rate: "",
      totalAmount: "",
      handlerPerson: "",
      time: "morning",
      date: new Date(),
    },
  });

  const watchedFields = form.watch();

  useEffect(() => {
    if (selectedVendor && watchedFields.milkType && watchedFields.quantity) {
      const rate = watchedFields.milkType === 'cow' ? selectedVendor.cowRate : selectedVendor.buffaloRate;
      const quantity = parseFloat(watchedFields.quantity) || 0;
      const amount = quantity * rate;
      
      form.setValue('rate', rate.toString());
      form.setValue('totalAmount', amount.toString());
      setTotalAmount(amount);
    }
  }, [selectedVendor, watchedFields.milkType, watchedFields.quantity, form]);

  const onSubmit = async (data: InsertMilkTransaction) => {
    // Validate that we have a vendor selected
    if (!data.vendorId || data.vendorId.trim() === '') {
      toast({
        title: "Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
      return;
    }

    // Transform the data to ensure correct types
    const transformedData = {
      ...data,
      vendorId: data.vendorId,
      customerId: null, // Always null for receive transactions
      quantity: Number(data.quantity),
      rate: Number(data.rate),
      totalAmount: Number(data.totalAmount),
    };

    // Show confirmation dialog for new transactions
    if (!transaction) {
      setPendingData(transformedData);
      setShowConfirmDialog(true);
      return;
    }

    // For updates, proceed directly
    await processTransaction(transformedData);
  };

  const processTransaction = async (transformedData: any) => {
    try {
      setLoading(true);
      
      if (transaction) {
        // Update existing transaction
        onSuccess?.(transformedData);
      } else {
        // Create new transaction
        console.log('MilkReceiveForm - Creating transaction with vendorId:', transformedData.vendorId);
        console.log('MilkReceiveForm - Full transformedData:', transformedData);
        
        await transactionService.create(transformedData);
        
        // Send SMS notification to vendor for new transactions only
        if (selectedVendor?.contact) {
          console.log('MilkReceiveForm - Attempting to send SMS to vendor:', selectedVendor.name, selectedVendor.contact);
          try {
            const smsResult = await smsService.sendMilkTransactionSMS(
              selectedVendor.contact,
              'receive',
              {
                name: selectedVendor.name,
                quantity: transformedData.quantity,
                milkType: transformedData.milkType,
                rate: transformedData.rate,
                totalAmount: transformedData.totalAmount,
                time: transformedData.time,
                date: new Date().toISOString(),
              }
            );
            console.log('MilkReceiveForm - SMS result:', smsResult);
          } catch (smsError) {
            console.error('MilkReceiveForm - SMS notification failed:', smsError);
          }
        } else {
          console.log('MilkReceiveForm - No vendor contact available for SMS');
        }
        
        toast({
          title: "Success",
          description: "Milk receipt recorded and vendor notified",
        });
        
        form.reset();
        setSelectedVendor(null);
        setTotalAmount(0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record milk receipt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmTransaction = async () => {
    if (pendingData) {
      setShowConfirmDialog(false);
      await processTransaction(pendingData);
      setPendingData(null);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      <div>
        <Label htmlFor="vendorId">Vendor</Label>
        <Select
          value={watchedFields.vendorId || ""}
          onValueChange={(value) => {
            const vendor = vendors.find(v => v.id === value);
            setSelectedVendor(vendor || null);
            form.setValue('vendorId', value);
            // Clear previous calculations when vendor changes
            form.setValue('rate', '');
            form.setValue('totalAmount', '');
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.vendorId && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.vendorId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="milkType">Milk Type</Label>
          <Select
            value={watchedFields.milkType}
            onValueChange={(value: 'cow' | 'buffalo') => form.setValue('milkType', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select milk type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cow">Cow</SelectItem>
              <SelectItem value="buffalo">Buffalo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity (L)</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            {...form.register("quantity")}
            placeholder="50"
            className="mt-1"
          />
          {form.formState.errors.quantity && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.quantity.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="time">Time</Label>
        <RadioGroup
          value={watchedFields.time || "morning"}
          onValueChange={(value: 'morning' | 'evening') => form.setValue('time', value)}
          className="flex gap-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="morning" id="morning" />
            <Label htmlFor="morning" className="font-normal cursor-pointer">Morning</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="evening" id="evening" />
            <Label htmlFor="evening" className="font-normal cursor-pointer">Evening</Label>
          </div>
        </RadioGroup>
        {form.formState.errors.time && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.time.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="handlerPerson">Handler Person</Label>
        <Input
          id="handlerPerson"
          {...form.register("handlerPerson")}
          placeholder="Enter person who handled this transaction"
          className="mt-1"
        />
        {form.formState.errors.handlerPerson && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.handlerPerson.message}</p>
        )}
      </div>

      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Amount:</span>
          <span className="text-lg font-bold text-primary">{totalAmount.toFixed(2)}</span>
        </div>
      </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Recording..." : "Record Receipt"}
        </Button>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Milk Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to record this milk receipt?
              <br /><br />
              <strong>Vendor:</strong> {selectedVendor?.name}
              <br />
              <strong>Quantity:</strong> {pendingData?.quantity}L ({pendingData?.milkType})
              <br />
              <strong>Amount:</strong> Rs. {pendingData?.totalAmount}
              <br />
              <strong>Time:</strong> {pendingData?.time}
              {selectedVendor?.contact && (
                <>
                  <br /><br />
                  <span className="text-sm text-muted-foreground">
                    SMS notification will be sent to: {selectedVendor.contact}
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTransaction}>
              Record Receipt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
