import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Package2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { MilkTransaction, Vendor, Customer } from "@shared/schema";

interface TransactionTableProps {
  transactions: MilkTransaction[];
  vendors: Vendor[];
  customers: Customer[];
}

export default function TransactionTable({ transactions, vendors, customers }: TransactionTableProps) {
  const getPartyName = (transaction: MilkTransaction) => {
    if (transaction.vendorId) {
      const vendor = vendors.find(v => v.id === transaction.vendorId);
      return vendor?.name || 'Unknown Vendor';
    }
    if (transaction.customerId) {
      const customer = customers.find(c => c.id === transaction.customerId);
      return customer?.name || 'Unknown Customer';
    }
    return 'Unknown';
  };

  const getTypeIcon = (type: string) => {
    return type === 'receive' ? (
      <ArrowDown className="h-4 w-4 text-primary" />
    ) : (
      <ArrowUp className="h-4 w-4 text-secondary" />
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'receive' ? (
      <Badge variant="outline" className="text-primary border-primary">
        Received
      </Badge>
    ) : (
      <Badge variant="outline" className="text-secondary border-secondary">
        Sent
      </Badge>
    );
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Milk Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-muted/50">
              <TableCell className="text-muted-foreground">
                {new Date(transaction.date!).toLocaleDateString()}
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(transaction.date!), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getTypeIcon(transaction.type)}
                  <span className="font-medium">{getPartyName(transaction)}</span>
                </div>
              </TableCell>
              <TableCell>
                {getTypeBadge(transaction.type)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {transaction.milkType}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{transaction.quantity}L</TableCell>
              <TableCell>₹{transaction.rate}/L</TableCell>
              <TableCell className="font-medium">₹{transaction.totalAmount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
