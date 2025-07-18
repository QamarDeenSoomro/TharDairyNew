import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { deleteVendor } from "@/store/slices/vendorSlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VendorForm from "@/components/Forms/VendorForm";
import type { Vendor } from "@shared/schema";

interface VendorTableProps {
  vendors: Vendor[];
}

export default function VendorTable({ vendors }: VendorTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteVendor(id)).unwrap();
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

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No vendors found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Cow Rate</TableHead>
              <TableHead>Buffalo Rate</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {getInitials(vendor.name)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{vendor.name}</div>
                      <div className="text-sm text-muted-foreground">{vendor.location}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{vendor.contact}</TableCell>
                <TableCell>
                  <Badge variant="secondary">₹{vendor.cowRate}/L</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">₹{vendor.buffaloRate}/L</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{vendor.location}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingVendor(vendor);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {vendor.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(vendor.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm
            vendor={editingVendor || undefined}
            onSuccess={() => {
              setDialogOpen(false);
              setEditingVendor(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
