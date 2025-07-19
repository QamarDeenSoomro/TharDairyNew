import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingDown, Calendar, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenses } from '@/hooks/useFirestore';
import { DailyExpenseForm } from '@/components/Forms/DailyExpenseForm';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { DailyExpense } from '@shared/schema';

const expenseCategories = {
  fuel: { label: 'Fuel', color: 'bg-red-100 text-red-800' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  feed: { label: 'Feed', color: 'bg-green-100 text-green-800' },
  veterinary: { label: 'Veterinary', color: 'bg-blue-100 text-blue-800' },
  labor: { label: 'Labor', color: 'bg-purple-100 text-purple-800' },
  utilities: { label: 'Utilities', color: 'bg-yellow-100 text-yellow-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

export default function DailyExpenses() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  const { expenses, loading: isLoading } = useExpenses();

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = expenseDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= weekAgo;
          break;
        case 'month':
          matchesDate = expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Calculate statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayExpenses = expenses.filter(expense => 
    new Date(expense.date).toDateString() === new Date().toDateString()
  ).reduce((sum, expense) => sum + expense.amount, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Daily Expenses</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Expenses</h1>
          <p className="text-muted-foreground">Track daily business expenses that reduce profit</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Expenses</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(todayExpenses)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impact on Profit</p>
                <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(expenseCategories).map(([key, category]) => (
                  <SelectItem key={key} value={key}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No expenses found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{expense.description}</h3>
                      <Badge className={expenseCategories[expense.category as keyof typeof expenseCategories]?.color}>
                        {expenseCategories[expense.category as keyof typeof expenseCategories]?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Form */}
      {showForm && (
        <DailyExpenseForm 
          open={showForm} 
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}