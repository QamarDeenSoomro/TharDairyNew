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
  const [pendingData, setPendingData] = useState<any>(null);
  const [selectedNotificationMethod, setSelectedNotificationMethod] = useState<'none' | 'sms' | 'whatsapp'>('none');

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
        
        // Send notification based on selected method
        if (selectedCustomer?.contact && selectedNotificationMethod !== 'none') {
          await sendSelectedNotification(transformedData);
        }
        
        toast({
          title: "Success",
          description: "Milk delivery recorded successfully",
        });
        
        form.reset();
        setSelectedCustomer(null);
        setTotalAmount(0);
        setSelectedNotificationMethod('none');
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

  const sendSelectedNotification = async (transactionData: any) => {
    if (!selectedCustomer?.contact) return;

    try {
      if (selectedNotificationMethod === 'sms') {
        console.log('MilkSendForm - Sending SMS to customer:', selectedCustomer.name, selectedCustomer.contact);
        await smsService.sendMilkTransactionSMS(
          selectedCustomer.contact,
          'send',
          {
            name: selectedCustomer.name,
            quantity: transactionData.quantity,
            milkType: transactionData.milkType,
            rate: transactionData.rate,
            totalAmount: transactionData.totalAmount,
            time: transactionData.time,
            date: new Date().toISOString(),
          }
        );
        console.log('MilkSendForm - SMS sent successfully');
      } else if (selectedNotificationMethod === 'whatsapp') {
        const message = `🥛 Milk Delivered\n\nDear ${selectedCustomer.name},\n\nMilk delivered: ${transactionData.quantity}L ${transactionData.milkType} at rate ${transactionData.rate}.\nTotal: ${transactionData.totalAmount}\nTime: ${transactionData.time}\n\nThank you!\n- Thar Dairy`;
        const whatsappUrl = `https://wa.me/${selectedCustomer.contact}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        console.log('MilkSendForm - WhatsApp opened');
      }
    } catch (error) {
      console.error('MilkSendForm - Notification failed:', error);
      toast({
        title: "Warning",
        description: "Delivery saved but notification failed to send",
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

      {/* Notification Method Selection */}
      {selectedCustomer?.contact && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-3">Notification Method (Optional)</h3>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant={selectedNotificationMethod === 'none' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedNotificationMethod('none')}
              className="flex-1 px-2"
            >
              🚫 No Notification
            </Button>
            <Button 
              type="button" 
              variant={selectedNotificationMethod === 'sms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedNotificationMethod('sms')}
              className="flex-1 px-2"
            >
              📱 SMS
            </Button>
            <Button 
              type="button" 
              variant={selectedNotificationMethod === 'whatsapp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedNotificationMethod('whatsapp')}
              className="flex-1 px-2"
            >
              💬 WhatsApp
            </Button>
          </div>
          {selectedNotificationMethod !== 'none' && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedNotificationMethod === 'sms' 
                ? 'SMS will be sent after recording delivery' 
                : 'WhatsApp will open after recording delivery'
              }
            </p>
          )}
        </div>
      )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Recording..." : "Record Delivery"}
        </Button>
      </form>
    </>
  );
}
