import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useVendors } from "@/hooks/useFirestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LedgerView from "@/components/Ledger/LedgerView";
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorLedger() {
  const [, setLocation] = useLocation();
  const { vendors, loading } = useVendors();
  const [vendorId, setVendorId] = useState<string | null>(null);

  // Get vendor ID from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setVendorId(id);
    } else {
      // If no ID provided, redirect to vendors page
      setLocation('/vendors');
    }
  }, [setLocation]);

  const vendor = vendors.find(v => v.id === vendorId);

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

  if (!vendor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => setLocation('/vendors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Vendor Not Found</h2>
            <p className="text-muted-foreground">The requested vendor could not be found</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Vendor not found. Please check the URL or go back to vendors list.</p>
            <Button onClick={() => setLocation('/vendors')} className="mt-4">
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => setLocation('/vendors')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Vendor Ledger</h2>
          <p className="text-muted-foreground">Ledger for {vendor.name}</p>
        </div>
      </div>

      <LedgerView entity={vendor} entityType="vendor" />
    </div>
  );
}