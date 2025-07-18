export function calculateMilkAmount(
  quantity: number,
  rate: number,
  fat?: number,
  snf?: number
): number {
  if (!quantity || !rate) return 0;
  
  let baseAmount = quantity * rate;
  
  // Apply fat and SNF bonuses/penalties if provided
  if (fat !== undefined && snf !== undefined) {
    // Standard fat and SNF values for bonus calculation
    const standardFat = 4.0;
    const standardSnf = 8.5;
    
    // Calculate bonus/penalty based on fat content
    const fatDifference = fat - standardFat;
    const fatAdjustment = fatDifference * 0.5; // 50 paisa per 0.1% fat difference
    
    // Calculate bonus/penalty based on SNF content
    const snfDifference = snf - standardSnf;
    const snfAdjustment = snfDifference * 0.3; // 30 paisa per 0.1% SNF difference
    
    // Apply adjustments
    baseAmount += (fatAdjustment + snfAdjustment) * quantity;
  }
  
  return Math.max(0, Math.round(baseAmount * 100) / 100);
}

export function calculateDailyStats(transactions: any[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= today && transactionDate < tomorrow;
  });
  
  const received = todayTransactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const sent = todayTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const receivedAmount = todayTransactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const sentAmount = todayTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  return {
    received,
    sent,
    receivedAmount,
    sentAmount,
    profit: sentAmount - receivedAmount,
  };
}

export function calculateMonthlyStats(transactions: any[]) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startOfMonth && transactionDate < startOfNextMonth;
  });
  
  const received = monthlyTransactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const sent = monthlyTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const receivedAmount = monthlyTransactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const sentAmount = monthlyTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  return {
    received,
    sent,
    receivedAmount,
    sentAmount,
    profit: sentAmount - receivedAmount,
  };
}

export function calculatePartyBalance(
  partyId: number,
  transactions: any[],
  payments: any[],
  isVendor: boolean
): {
  totalTransactions: number;
  totalPayments: number;
  balance: number;
  quantity: number;
} {
  const partyTransactions = transactions.filter(t => 
    isVendor ? t.vendorId === partyId : t.customerId === partyId
  );
  
  const partyPayments = payments.filter(p => 
    isVendor ? p.vendorId === partyId : p.customerId === partyId
  );
  
  const totalTransactions = partyTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalPayments = partyPayments.reduce((sum, p) => sum + p.amount, 0);
  const quantity = partyTransactions.reduce((sum, t) => sum + t.quantity, 0);
  
  // For vendors: positive balance means we owe them money
  // For customers: positive balance means they owe us money
  const balance = isVendor ? totalTransactions - totalPayments : totalPayments - totalTransactions;
  
  return {
    totalTransactions,
    totalPayments,
    balance,
    quantity,
  };
}

export function calculateProfitLoss(
  transactions: any[],
  startDate?: Date,
  endDate?: Date
): {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  receivedQuantity: number;
  sentQuantity: number;
} {
  let filteredTransactions = transactions;
  
  if (startDate && endDate) {
    filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }
  
  const revenue = filteredTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const cost = filteredTransactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const receivedQuantity = filteredTransactions
    .filter(t => t.type === 'receive')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const sentQuantity = filteredTransactions
    .filter(t => t.type === 'send')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  return {
    totalRevenue: revenue,
    totalCost: cost,
    grossProfit: revenue - cost,
    receivedQuantity,
    sentQuantity,
  };
}
