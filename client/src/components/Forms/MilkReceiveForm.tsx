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
  const [showSMSConfirmDialog, setShowSMSConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

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

    // Save entry directly without confirmation
    await saveTransaction(transformedData);
  };

  const saveTransaction = async (transformedData: any) => {
    try {
      setLoading(true);
      
      if (transaction) {
        // Update existing transaction
        onSuccess?.(transformedData);
        toast({
          title: "Success",
          description: "Milk receipt updated successfully",
        });
      } else {
        // Create new transaction
        console.log('MilkReceiveForm - Creating transaction with vendorId:', transformedData.vendorId);
        console.log('MilkReceiveForm - Full transformedData:', transformedData);
        
        await transactionService.create(transformedData);
        
        toast({
          title: "Success",
          description: "Milk receipt recorded successfully",
        });
        
        form.reset();
        setSelectedVendor(null);
        setTotalAmount(0);
      }
      
      onSuccess?.(transformedData);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save milk receipt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSMSWithConfirmation = async () => {
    if (!selectedVendor?.contact) {
      toast({
        title: "Error",
        description: "No contact number available for vendor",
        variant: "destructive",
      });
      return;
    }

    // Get current form data
    const currentData = form.getValues();
    
    setPendingData({
      ...currentData,
      vendor: selectedVendor,
      totalAmount: totalAmount
    });
    setShowSMSConfirmDialog(true);
  };

  const confirmSendSMS = async () => {
    try {
      if (!selectedVendor?.contact || !pendingData) return;

      console.log('MilkReceiveForm - Attempting to send SMS to vendor:', selectedVendor.name, selectedVendor.contact);
      const smsResult = await smsService.sendMilkTransactionSMS(
        selectedVendor.contact,
        'receive',
        {
          name: selectedVendor.name,
          quantity: pendingData.quantity,
          milkType: pendingData.milkType,
          rate: pendingData.rate,
          totalAmount: pendingData.totalAmount,
          time: pendingData.time,
          date: new Date().toISOString(),
        }
      );
      
      console.log('MilkReceiveForm - SMS result:', smsResult);
      
      toast({
        title: "Success",
        description: "SMS sent to vendor successfully",
      });
      
      setShowSMSConfirmDialog(false);
    } catch (error) {
      console.error('MilkReceiveForm - SMS notification failed:', error);
      toast({
        title: "Error",
        description: "Failed to send SMS notification",
        variant: "destructive",
      });
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

      {/* SMS/WhatsApp Actions */}
      {selectedVendor?.contact && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium mb-3">Send Notification</h3>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={sendSMSWithConfirmation}
              className="flex-1"
            >
              📱 Send SMS
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => {
                const formData = form.getValues();
                const message = `🥛 Milk Received\n\nDear ${selectedVendor.name},\n\nMilk received: ${formData.quantity}L ${formData.milkType} at rate ${formData.rate}.\nTotal: ${totalAmount}\nTime: ${formData.time}\n\nThank you!\n- Thar Dairy`;
                const whatsappUrl = `https://wa.me/${selectedVendor.contact}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="flex-1"
            >
              💬 WhatsApp
            </Button>
          </div>
        </div>
      )}

      {/* SMS Confirmation Dialog */}
      <AlertDialog open={showSMSConfirmDialog} onOpenChange={setShowSMSConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm SMS Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send SMS notification to vendor?
              <br /><br />
              <strong>Vendor:</strong> {selectedVendor?.name}
              <br />
              <strong>Contact:</strong> {selectedVendor?.contact}
              <br />
              <strong>Details:</strong> {pendingData?.quantity}L {pendingData?.milkType} - Rs. {pendingData?.totalAmount}
              <br /><br />
              <span className="text-sm text-muted-foreground">
                This will open your SMS app with a pre-filled message.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendSMS}>
              Send SMS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
