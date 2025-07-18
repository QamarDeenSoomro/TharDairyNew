import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createPayment } from "@/store/slices/paymentSlice";
import { insertPaymentSchema, type InsertPayment, type Vendor, type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PaymentFormProps {
  vendors: Vendor[];
  customers: Customer[];
  onSuccess?: () => void;
}

export default function PaymentForm({ vendors, customers, onSuccess }: PaymentFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      type: "received",
      vendorId: null,
      customerId: null,
      amount: 0,
      method: "cash",
      reference: "",
    },
  });

  const watchedType = form.watch("type");

  const onSubmit = async (data: InsertPayment) => {
    try {
      setLoading(true);
      
      console.log('PaymentForm - Creating payment with data:', data);
      await dispatch(createPayment(data)).unwrap();
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableParties = watchedType === "received" ? customers : vendors;
  const partyKey = watchedType === "received" ? "customerId" : "vendorId";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="type">Payment Type</Label>
        <Select
          value={form.watch("type")}
          onValueChange={(value: "received" | "paid") => {
            form.setValue("type", value);
            form.setValue("vendorId", null);
            form.setValue("customerId", null);
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="received">Payment Received</SelectItem>
            <SelectItem value="paid">Payment Made</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="party">Party</Label>
        <Select
          value={form.watch(partyKey)?.toString() || ""}
          onValueChange={(value) => {
            if (watchedType === "received") {
              form.setValue("customerId", parseInt(value));
              form.setValue("vendorId", null);
            } else {
              form.setValue("vendorId", parseInt(value));
              form.setValue("customerId", null);
            }
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select party" />
          </SelectTrigger>
          <SelectContent>
            {availableParties.map((party) => (
              <SelectItem key={party.id} value={party.id.toString()}>
                {party.name} ({watchedType === "received" ? "Customer" : "Vendor"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(form.formState.errors.vendorId || form.formState.errors.customerId) && (
          <p className="text-sm text-destructive mt-1">Please select a party</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Amount</Label>
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
        <Label htmlFor="method">Payment Method</Label>
        <Select
          value={form.watch("method")}
          onValueChange={(value: "cash" | "bank" | "cheque") => form.setValue("method", value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.method && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.method.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="reference">Reference (Optional)</Label>
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
        {loading ? "Recording..." : "Record Payment"}
      </Button>
    </form>
  );
}
