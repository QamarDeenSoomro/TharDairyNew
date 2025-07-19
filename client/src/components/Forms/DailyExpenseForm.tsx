import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useExpenses } from '@/hooks/useFirestore';
import { insertDailyExpenseSchema, type InsertDailyExpense } from '@shared/schema';

interface DailyExpenseFormProps {
  open: boolean;
  onClose: () => void;
  expense?: any;
}

const expenseCategories = [
  { value: 'fuel', label: 'Fuel & Transportation' },
  { value: 'maintenance', label: 'Equipment Maintenance' },
  { value: 'feed', label: 'Animal Feed' },
  { value: 'veterinary', label: 'Veterinary Services' },
  { value: 'labor', label: 'Labor & Wages' },
  { value: 'utilities', label: 'Utilities (Electric, Water)' },
  { value: 'other', label: 'Other Expenses' },
];

export function DailyExpenseForm({ open, onClose, expense }: DailyExpenseFormProps) {
  const { toast } = useToast();
  const { createExpense, updateExpense } = useExpenses();

  const form = useForm<InsertDailyExpense>({
    resolver: zodResolver(insertDailyExpenseSchema),
    defaultValues: {
      description: expense?.description || '',
      amount: expense?.amount || 0,
      category: expense?.category || '',
      date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: InsertDailyExpense) => {
    try {
      if (expense?.id) {
        await updateExpense(expense.id, data);
        toast({
          title: 'Success',
          description: 'Expense updated successfully',
        });
      } else {
        await createExpense(data);
        toast({
          title: 'Success', 
          description: 'Expense added successfully',
        });
      }
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'Edit' : 'Add'} Daily Expense
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter expense description..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (PKR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : expense ? 'Update' : 'Add'} Expense
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}