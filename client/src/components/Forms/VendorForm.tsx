import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVendorSchema, type InsertVendor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { FirebaseVendor } from "@/services/firebase-realtime";

interface VendorFormProps {
  vendor?: FirebaseVendor;
  onSuccess?: (data: InsertVendor) => void;
}

export default function VendorForm({ vendor, onSuccess }: VendorFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<InsertVendor>({
    resolver: zodResolver(insertVendorSchema),
    defaultValues: {
      name: vendor?.name || "",
      contact: vendor?.contact || "",
      location: vendor?.location || "",
      cowRate: vendor?.cowRate || 0,
      buffaloRate: vendor?.buffaloRate || 0,
    },
  });

  const onSubmit = async (data: InsertVendor) => {
    try {
      setLoading(true);
      
      if (onSuccess) {
        await onSuccess(data);
      }
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save vendor",
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
          placeholder="Enter vendor name"
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
            placeholder="35"
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
            placeholder="45"
            className="mt-1"
          />
          {form.formState.errors.buffaloRate && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.buffaloRate.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : vendor ? "Update Vendor" : "Create Vendor"}
      </Button>
    </form>
  );
}
