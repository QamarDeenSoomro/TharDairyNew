import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createCustomer, updateCustomer } from "@/store/slices/customerSlice";
import { insertCustomerSchema, type InsertCustomer, type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: () => void;
}

export default function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: customer?.name || "",
      contact: customer?.contact || "",
      location: customer?.location || "",
      cowRate: customer?.cowRate || 0,
      buffaloRate: customer?.buffaloRate || 0,
    },
  });

  const onSubmit = async (data: InsertCustomer) => {
    try {
      setLoading(true);
      
      if (customer) {
        await dispatch(updateCustomer({ id: customer.id, customer: data })).unwrap();
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        await dispatch(createCustomer(data)).unwrap();
        toast({
          title: "Success",
          description: "Customer created successfully",
        });
      }
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Enter customer name"
          className="mt-1"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contact">Contact</Label>
        <Input
          id="contact"
          {...form.register("contact")}
          placeholder="Enter contact number"
          className="mt-1"
        />
        {form.formState.errors.contact && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.contact.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...form.register("location")}
          placeholder="Enter location"
          className="mt-1"
        />
        {form.formState.errors.location && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cowRate">Cow Rate (₹/L)</Label>
          <Input
            id="cowRate"
            type="number"
            step="0.01"
            {...form.register("cowRate", { valueAsNumber: true })}
            placeholder="40"
            className="mt-1"
          />
          {form.formState.errors.cowRate && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.cowRate.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="buffaloRate">Buffalo Rate (₹/L)</Label>
          <Input
            id="buffaloRate"
            type="number"
            step="0.01"
            {...form.register("buffaloRate", { valueAsNumber: true })}
            placeholder="50"
            className="mt-1"
          />
          {form.formState.errors.buffaloRate && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.buffaloRate.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
      </Button>
    </form>
  );
}
