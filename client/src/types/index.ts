export interface DashboardStats {
  todayReceived: number;
  todaySent: number;
  todayProfit: number;
  pendingPayments: number;
  totalReceived: number;
  totalPaid: number;
}

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  vendorId?: number;
  customerId?: number;
  reportType?: 'all' | 'vendor' | 'customer' | 'profit';
}

export interface PartyBalance {
  totalTransactions: number;
  totalPayments: number;
  balance: number;
  quantity: number;
}

export interface ProfitLossReport {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  receivedQuantity: number;
  sentQuantity: number;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  filename: string;
  includeTransactions?: boolean;
  includePayments?: boolean;
  includeVendors?: boolean;
  includeCustomers?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'receive' | 'send' | 'payment';
  description: string;
  timestamp: Date;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

export interface FilterOptions {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
  partyId?: number;
  milkType?: 'cow' | 'buffalo';
  transactionType?: 'receive' | 'send';
  paymentType?: 'received' | 'paid';
}

export interface ChartData {
  date: string;
  received: number;
  sent: number;
  profit: number;
}

export interface MilkQuality {
  fat: number;
  snf: number;
  quality: 'excellent' | 'good' | 'average' | 'poor';
}

export interface NotificationSettings {
  lowStock: boolean;
  paymentReminders: boolean;
  dailyReports: boolean;
  emailNotifications: boolean;
}

export interface UserPreferences {
  defaultCurrency: string;
  dateFormat: string;
  notifications: NotificationSettings;
  autoBackup: boolean;
  exportFormat: 'csv' | 'excel';
}
