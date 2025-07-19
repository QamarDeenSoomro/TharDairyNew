import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCustomers } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LedgerView from "@/components/Ledger/LedgerView";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerLedger() {
  const [, setLocation] = useLocation();
  const { customers, loading } = useCustomers();
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Get customer ID from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setCustomerId(id);
    } else {
      // If no ID provided, redirect to customers page
      setLocation('/customers');
    }
  }, [setLocation]);

  const customer = customers.find(c => c.id === customerId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => setLocation('/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Customer Not Found</h2>
            <p className="text-muted-foreground">The requested customer could not be found</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Customer not found. Please check the URL or go back to customers list.</p>
            <Button onClick={() => setLocation('/customers')} className="mt-4">
              Back to Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => setLocation('/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Customer Ledger</h2>
          <p className="text-muted-foreground">Ledger for {customer.name}</p>
        </div>
      </div>

      <LedgerView entity={customer} entityType="customer" />
    </div>
  );
}