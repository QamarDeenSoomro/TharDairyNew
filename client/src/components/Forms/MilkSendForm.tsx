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
import { transactionService, type FirebaseCustomer } from "@/services/firebase-realtime";
import { smsService } from "@/services/smsService";

interface MilkSendFormProps {
  customers: FirebaseCustomer[];
  transaction?: any;
  onSuccess?: (data?: any) => void;
}

export default function MilkSendForm({ customers, transaction, onSuccess }: MilkSendFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<FirebaseCustomer | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSMSConfirmDialog, setShowSMSConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const form = useForm<InsertMilkTransaction>({
    resolver: zodResolver(insertMilkTransactionSchema),
    defaultValues: transaction ? {
      type: "send",
      vendorId: null,
      customerId: transaction.customerId || "",
      milkType: transaction.milkType || "cow",
      quantity: transaction.quantity?.toString() || "",
      rate: transaction.rate?.toString() || "",
      totalAmount: transaction.totalAmount?.toString() || "",
      handlerPerson: transaction.handlerPerson || "",
      time: transaction.time || "morning",
      date: transaction.date ? new Date(transaction.date) : new Date(),
    } : {
      type: "send",
      vendorId: null,
      customerId: "",
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
    if (selectedCustomer && watchedFields.milkType && watchedFields.quantity) {
      const rate = watchedFields.milkType === 'cow' ? selectedCustomer.cowRate : selectedCustomer.buffaloRate;
      const quantity = parseFloat(watchedFields.quantity) || 0;
      const amount = quantity * rate;
      
      form.setValue('rate', rate.toString());
      form.setValue('totalAmount', amount.toString());
      setTotalAmount(amount);
    }
  }, [selectedCustomer, watchedFields.milkType, watchedFields.quantity, form]);

  const onSubmit = async (data: InsertMilkTransaction) => {
    // Validate that we have a customer selected
    if (!data.customerId || data.customerId.trim() === '') {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    // Transform the data to ensure correct types
    const transformedData = {
      ...data,
      vendorId: null, // Always null for send transactions
      customerId: data.customerId,
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
          description: "Milk delivery updated successfully",
        });
      } else {
        // Create new transaction
        console.log('MilkSendForm - Creating transaction with customerId:', transformedData.customerId);
        console.log('MilkSendForm - Full transformedData:', transformedData);
        
        await transactionService.create(transformedData);
        
        toast({
          title: "Success",
          description: "Milk delivery recorded successfully",
        });
        
        form.reset();
        setSelectedCustomer(null);
        setTotalAmount(0);
      }
      
      onSuccess?.(transformedData);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save milk delivery",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSMSWithConfirmation = async () => {
    if (!selectedCustomer?.contact) {
      toast({
        title: "Error",
        description: "No contact number available for customer",
        variant: "destructive",
      });
      return;
    }

    // Get current form data
    const currentData = form.getValues();
    
    setPendingData({
      ...currentData,
      customer: selectedCustomer,
      totalAmount: totalAmount
    });
    setShowSMSConfirmDialog(true);
  };

  const confirmSendSMS = async () => {
    try {
      if (!selectedCustomer?.contact || !pendingData) return;

      console.log('MilkSendForm - Attempting to send SMS to customer:', selectedCustomer.name, selectedCustomer.contact);
      const smsResult = await smsService.sendMilkTransactionSMS(
        selectedCustomer.contact,
        'send',
        {
          name: selectedCustomer.name,
          quantity: pendingData.quantity,
          milkType: pendingData.milkType,
          rate: pendingData.rate,
          totalAmount: pendingData.totalAmount,
          time: pendingData.time,
          date: new Date().toISOString(),
        }
      );
      
      console.log('MilkSendForm - SMS result:', smsResult);
      
      toast({
        title: "Success",
        description: "SMS sent to customer successfully",
      });
      
      setShowSMSConfirmDialog(false);
    } catch (error) {
      console.error('MilkSendForm - SMS notification failed:', error);
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
        <Label htmlFor="customerId">Customer</Label>
        <Select
          value={watchedFields.customerId || ""}
          onValueChange={(value) => {
            const customer = customers.find(c => c.id === value);
            setSelectedCustomer(customer || null);
            form.setValue('customerId', value);
            // Clear previous calculations when customer changes
            form.setValue('rate', '');
            form.setValue('totalAmount', '');
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.customerId && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.customerId.message}</p>
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
            <RadioGroupItem value="morning" id="morning-send" />
            <Label htmlFor="morning-send" className="font-normal cursor-pointer">Morning</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="evening" id="evening-send" />
            <Label htmlFor="evening-send" className="font-normal cursor-pointer">Evening</Label>
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
          placeholder="Enter person who handled this delivery"
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
          {loading ? "Recording..." : "Record Delivery"}
        </Button>
      </form>

      {/* SMS/WhatsApp Actions */}
      {selectedCustomer?.contact && (
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
                const message = `🥛 Milk Delivered\n\nDear ${selectedCustomer.name},\n\nMilk delivered: ${formData.quantity}L ${formData.milkType} at rate ${formData.rate}.\nTotal: ${totalAmount}\nTime: ${formData.time}\n\nThank you!\n- Thar Dairy`;
                const whatsappUrl = `https://wa.me/${selectedCustomer.contact}?text=${encodeURIComponent(message)}`;
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
              Are you sure you want to send SMS notification to customer?
              <br /><br />
              <strong>Customer:</strong> {selectedCustomer?.name}
              <br />
              <strong>Contact:</strong> {selectedCustomer?.contact}
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
