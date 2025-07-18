import { useState } from "react";
import { useVendors } from "@/hooks/useFirestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import VendorTable from "@/components/Tables/VendorTable";
import VendorForm from "@/components/Forms/VendorForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { InsertVendor } from "@shared/schema";

export default function Vendors() {
  const { vendors, loading, error, createVendor, updateVendor, deleteVendor } = useVendors();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddVendor = async (vendorData: InsertVendor) => {
    try {
      console.log('handleAddVendor: Attempting to create vendor:', vendorData);
      await createVendor(vendorData);
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Vendor added successfully",
      });
    } catch (error) {
      console.error('handleAddVendor: Error creating vendor:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add vendor",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      await deleteVendor(id);
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contact.includes(searchTerm) ||
    vendor.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Vendor Management</h2>
          <p className="text-muted-foreground">Manage your milk suppliers and their rates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Vendor</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
            </DialogHeader>
            <VendorForm onSuccess={handleAddVendor} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendors</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VendorTable vendors={filteredVendors} onDelete={handleDeleteVendor} />
        </CardContent>
      </Card>
    </div>
  );
}
