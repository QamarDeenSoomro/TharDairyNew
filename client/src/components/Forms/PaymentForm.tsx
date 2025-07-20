import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema, type InsertPayment, type Payment, type Vendor, type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { paymentService } from "@/services/firebase-realtime";
import { smsService } from "@/services/smsService";
import { useTransactions, usePayments } from "@/hooks/useFirestore";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaymentFormProps {
  vendors: Vendor[];
  customers: Customer[];
  payment?: Payment;
  onSuccess?: (data?: any) => void;
}

export default function PaymentForm({ vendors, customers, payment, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPartyBalance, setSelectedPartyBalance] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [selectedNotificationMethod, setSelectedNotificationMethod] = useState<'none' | 'sms' | 'whatsapp'>('none');
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { t } = useLanguage();

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: payment ? {
      type: payment.type,
      vendorId: payment.vendorId,
      customerId: payment.customerId,
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference || "",
      date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    } : {
      type: "received",
      vendorId: null,
      customerId: null,
      amount: 0,
      method: "cash",
      reference: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedType = form.watch("type");
  const watchedVendorId = form.watch("vendorId");
  const watchedCustomerId = form.watch("customerId");

  // Calculate party balance when selection changes
  useEffect(() => {
    const calculateBalance = () => {
      let partyId = null;
      let isVendor = false;

      if (watchedType === "received" && watchedCustomerId) {
        partyId = watchedCustomerId;
        isVendor = false;
      } else if (watchedType === "paid" && watchedVendorId) {
        partyId = watchedVendorId;
        isVendor = true;
      }

      if (!partyId) {
        setSelectedPartyBalance(null);
        return;
      }

      // Calculate total transactions amount
      const partyTransactions = transactions.filter(t => 
        isVendor ? t.vendorId === partyId : t.customerId === partyId
      );

      const totalTransactionAmount = partyTransactions.reduce((sum, t) => {
        if (isVendor) {
          // For vendors: we owe them money for milk received
          return t.type === 'receive' ? sum + t.totalAmount : sum;
        } else {
          // For customers: they owe us money for milk delivered
          return t.type === 'send' ? sum + t.totalAmount : sum;
        }
      }, 0);

      // Calculate total payments
      const partyPayments = payments.filter(p => 
        isVendor ? p.vendorId === partyId : p.customerId === partyId
      );

      const totalPaymentAmount = partyPayments.reduce((sum, p) => {
        if (isVendor) {
          // For vendors: payments we made to them reduce our debt
          return p.type === 'paid' ? sum + p.amount : sum;
        } else {
          // For customers: payments we received from them reduce their debt
          return p.type === 'received' ? sum + p.amount : sum;
        }
      }, 0);

      // Calculate balance
      const balance = totalTransactionAmount - totalPaymentAmount;
      setSelectedPartyBalance(balance);
    };

    calculateBalance();
  }, [watchedType, watchedVendorId, watchedCustomerId, transactions, payments]);

  const onSubmit = async (data: InsertPayment) => {
    // Save payment directly without confirmation
    await savePayment(data);
  };

  const savePayment = async (data: InsertPayment) => {
    setLoading(true);
    try {
      if (payment) {
        // Update existing payment
        onSuccess?.(data);
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        // Create new payment
        console.log('PaymentForm - Creating payment with data:', data);
        await paymentService.create(data);
        
        // Send notification based on selected method
        let contactPerson = null;
        if (data.type === 'received' && data.customerId) {
          contactPerson = customers.find(c => c.id === data.customerId);
        } else if (data.type === 'paid' && data.vendorId) {
          contactPerson = vendors.find(v => v.id === data.vendorId);
        }
        
        if (contactPerson?.contact && selectedNotificationMethod !== 'none') {
          await sendSelectedNotification(data, contactPerson);
        }
        
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        });
        
        form.reset();
        setSelectedPartyBalance(null);
        setSelectedNotificationMethod('none');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: "Error",
        description: "Failed to save payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSelectedNotification = async (paymentData: any, contactPerson: any) => {
    try {
      if (selectedNotificationMethod === 'sms') {
        console.log('PaymentForm - Sending SMS to:', contactPerson.name, contactPerson.contact);
        await smsService.sendPaymentSMS(
          contactPerson.contact,
          paymentData.type,
          {
            name: contactPerson.name,
            amount: Number(paymentData.amount),
            method: paymentData.method,
            reference: paymentData.reference || undefined,
            date: new Date().toISOString(),
          }
        );
        console.log('PaymentForm - SMS sent successfully');
      } else if (selectedNotificationMethod === 'whatsapp') {
        const message = `💰 Payment ${paymentData.type === 'received' ? 'Received' : 'Made'}\n\nDear ${contactPerson.name},\n\nAmount: ${paymentData.amount}\nMethod: ${paymentData.method}\n${paymentData.reference ? `Reference: ${paymentData.reference}\n` : ''}Date: ${new Date().toLocaleDateString()}\n\nThank you!\n- Thar Dairy`;
        const whatsappUrl = `https://wa.me/${contactPerson.contact}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        console.log('PaymentForm - WhatsApp opened');
      }
    } catch (error) {
      console.error('PaymentForm - Notification failed:', error);
      toast({
        title: "Warning",
        description: "Payment saved but notification failed to send",
        variant: "destructive",
      });
    }
  };

  const availableParties = watchedType === "received" ? customers : vendors;
  const partyKey = watchedType === "received" ? "customerId" : "vendorId";

  const getSelectedParty = () => {
    if (pendingData?.type === "received" && pendingData.customerId) {
      return customers.find(c => c.id === pendingData.customerId);
    } else if (pendingData?.type === "paid" && pendingData.vendorId) {
      return vendors.find(v => v.id === pendingData.vendorId);
    }
    return null;
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="type">{t.type}</Label>
        <Select
          value={form.watch("type")}
          onValueChange={(value: "received" | "paid") => {
            form.setValue("type", value);
            form.setValue("vendorId", null);
            form.setValue("customerId", null);
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={t.selectPaymentType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="received">{t.paymentReceived}</SelectItem>
            <SelectItem value="paid">{t.paymentMade}</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="party">{watchedType === "received" ? t.customer : t.vendor}</Label>
        <Select
          value={form.watch(partyKey) || ""}
          onValueChange={(value) => {
            if (watchedType === "received") {
              form.setValue("customerId", value);
              form.setValue("vendorId", null);
            } else {
              form.setValue("vendorId", value);
              form.setValue("customerId", null);
            }
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={t.selectParty} />
          </SelectTrigger>
          <SelectContent>
            {availableParties.map((party) => (
              <SelectItem key={party.id} value={party.id}>
                {party.name} ({watchedType === "received" ? "Customer" : "Vendor"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(form.formState.errors.vendorId || form.formState.errors.customerId) && (
          <p className="text-sm text-destructive mt-1">Please select a party</p>
        )}
      </div>

      {/* Current Balance Display */}
      {selectedPartyBalance !== null && (watchedVendorId || watchedCustomerId) && (
        <Alert className={selectedPartyBalance > 0 ? "border-orange-200 bg-orange-50 dark:bg-orange-950/30" : "border-green-200 bg-green-50 dark:bg-green-950/30"}>
          <AlertCircle className={`h-4 w-4 ${selectedPartyBalance > 0 ? "text-orange-600" : "text-green-600"}`} />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              {t.currentBalance}: 
              <span className={`font-semibold ml-1 ${selectedPartyBalance > 0 ? "text-orange-700 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`}>
                {selectedPartyBalance.toLocaleString()}
              </span>
            </span>
            {selectedPartyBalance > 0 ? (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <TrendingUp className="h-3 w-3" />
                {watchedType === "received" ? t.customerOwes : t.amountDueToVendor}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingDown className="h-3 w-3" />
                {Math.abs(selectedPartyBalance) > 0 ? t.advancePaid : t.settled}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="amount">{t.amount}</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...form.register("amount", { valueAsNumber: true })}
          placeholder="5000"
          className="mt-1"
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="method">{t.method}</Label>
        <Select
          value={form.watch("method")}
          onValueChange={(value: "cash" | "bank" | "cheque") => form.setValue("method", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={t.selectPaymentMethod} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">{t.cash}</SelectItem>
            <SelectItem value="bank">{t.bank}</SelectItem>
            <SelectItem value="cheque">{t.cheque}</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.method && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.method.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="reference">{t.reference} (Optional)</Label>
        <Input
          id="reference"
          {...form.register("reference")}
          placeholder="Transaction reference"
          className="mt-1"
        />
        {form.formState.errors.reference && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.reference.message}</p>
        )}
      </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? `${t.loading}...` : (payment ? "Update Payment" : t.recordPayment)}
        </Button>
      </form>

      {/* Notification Method Selection */}
      {(() => {
        const formData = form.getValues();
        let contactPerson = null;
        if (formData.type === 'received' && formData.customerId) {
          contactPerson = customers.find(c => c.id === formData.customerId);
        } else if (formData.type === 'paid' && formData.vendorId) {
          contactPerson = vendors.find(v => v.id === formData.vendorId);
        }
        
        return contactPerson?.contact ? (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Notification Method (Optional)</h3>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant={selectedNotificationMethod === 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNotificationMethod('none')}
                className="flex-1"
              >
                🚫 No Notification
              </Button>
              <Button 
                type="button" 
                variant={selectedNotificationMethod === 'sms' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNotificationMethod('sms')}
                className="flex-1"
              >
                📱 SMS
              </Button>
              <Button 
                type="button" 
                variant={selectedNotificationMethod === 'whatsapp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNotificationMethod('whatsapp')}
                className="flex-1"
              >
                💬 WhatsApp
              </Button>
            </div>
            {selectedNotificationMethod !== 'none' && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedNotificationMethod === 'sms' 
                  ? `SMS will be sent after recording payment to ${contactPerson.name}` 
                  : `WhatsApp will open after recording payment to ${contactPerson.name}`
                }
              </p>
            )}
          </div>
        ) : null;
      })()}
    </>
  );
}
