import { useState } from "react";
import { useCustomers } from "@/hooks/useFirestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import CustomerTable from "@/components/Tables/CustomerTable";
import CustomerForm from "@/components/Forms/CustomerForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { InsertCustomer } from "@shared/schema";

export default function Customers() {
  const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddCustomer = async (customerData: InsertCustomer) => {
    try {
      await createCustomer(customerData);
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.includes(searchTerm) ||
    customer.location?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Customer Management</h2>
          <p className="text-muted-foreground">Manage your milk buyers and their rates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center justify-center space-x-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm onSuccess={handleAddCustomer} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Customers</CardTitle>
            <div className="relative w-full sm:w-auto sm:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <CustomerTable customers={filteredCustomers} onDelete={handleDeleteCustomer} />
        </CardContent>
      </Card>
    </div>
  );
}
