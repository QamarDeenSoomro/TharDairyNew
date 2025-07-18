import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createTransaction } from "@/store/slices/transactionSlice";
import { insertMilkTransactionSchema, type InsertMilkTransaction, type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { calculateMilkAmount } from "@/utils/calculations";

interface MilkSendFormProps {
  customers: Customer[];
}

export default function MilkSendForm({ customers }: MilkSendFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<InsertMilkTransaction>({
    resolver: zodResolver(insertMilkTransactionSchema.extend({
      customerId: insertMilkTransactionSchema.shape.customerId.refine(val => val !== null),
    })),
    defaultValues: {
      type: "send",
      vendorId: null,
      customerId: null,
      milkType: "cow",
      quantity: 0,
      fat: 0,
      snf: 0,
      rate: 0,
      totalAmount: 0,
    },
  });

  const watchedFields = form.watch();

  useEffect(() => {
    if (selectedCustomer && watchedFields.milkType && watchedFields.quantity) {
      const rate = watchedFields.milkType === 'cow' ? selectedCustomer.cowRate : selectedCustomer.buffaloRate;
      const amount = calculateMilkAmount(watchedFields.quantity, rate, watchedFields.fat, watchedFields.snf);
      
      form.setValue('rate', rate);
      form.setValue('totalAmount', amount);
      setTotalAmount(amount);
    }
  }, [selectedCustomer, watchedFields.milkType, watchedFields.quantity, watchedFields.fat, watchedFields.snf, form]);

  const onSubmit = async (data: InsertMilkTransaction) => {
    try {
      setLoading(true);
      
      await dispatch(createTransaction(data)).unwrap();
      toast({
        title: "Success",
        description: "Milk delivery recorded successfully",
      });
      
      form.reset();
      setSelectedCustomer(null);
      setTotalAmount(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record milk delivery",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="customerId">Customer</Label>
        <Select
          value={watchedFields.customerId?.toString() || ""}
          onValueChange={(value) => {
            const customer = customers.find(c => c.id === parseInt(value));
            setSelectedCustomer(customer || null);
            form.setValue('customerId', parseInt(value));
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.customerId && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.customerId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            {...form.register("quantity", { valueAsNumber: true })}
            placeholder="50"
            className="mt-1"
          />
          {form.formState.errors.quantity && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.quantity.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fat">Fat %</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            {...form.register("fat", { valueAsNumber: true })}
            placeholder="4.5"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="snf">SNF %</Label>
          <Input
            id="snf"
            type="number"
            step="0.1"
            {...form.register("snf", { valueAsNumber: true })}
            placeholder="8.5"
            className="mt-1"
          />
        </div>
      </div>

      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Amount:</span>
          <span className="text-lg font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Recording..." : "Record Delivery"}
      </Button>
    </form>
  );
}
