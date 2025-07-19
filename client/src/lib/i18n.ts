// Internationalization configuration
export type Language = 'en' | 'sd';

export interface Translation {
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  loading: string;
  error: string;
  success: string;
  
  // Navigation
  dashboard: string;
  vendors: string;
  customers: string;
  milkReceiving: string;
  milkSending: string;
  payments: string;
  dailyExpenses: string;
  reports: string;
  vendorLedger: string;
  customerLedger: string;
  pendingPayments: string;
  databaseManagement: string;
  
  // Dashboard
  todaysMilkReceived: string;
  todaysMilkSent: string;
  balanceMilk: string;
  todaysProfit: string;
  pendingPaymentsAmount: string;
  weeklyMilkFlow: string;
  recentActivity: string;
  
  // Forms
  name: string;
  contact: string;
  rate: string;
  quantity: string;
  milkType: string;
  cow: string;
  buffalo: string;
  vendor: string;
  customer: string;
  amount: string;
  method: string;
  cash: string;
  bank: string;
  cheque: string;
  reference: string;
  date: string;
  time: string;
  morning: string;
  evening: string;
  
  // Daily Expenses
  description: string;
  category: string;
  fuel: string;
  maintenance: string;
  feed: string;
  veterinary: string;
  labor: string;
  utilities: string;
  other: string;
  todaysExpenses: string;
  totalFiltered: string;
  totalExpenses: string;
  records: string;
  
  // Messages
  addVendor: string;
  editVendor: string;
  addCustomer: string;
  editCustomer: string;
  addExpense: string;
  editExpense: string;
  addPayment: string;
  milkReceived: string;
  milkSent: string;
  
  // SMS Messages
  smsNewMilkReceived: string;
  smsNewMilkSent: string;
  smsPaymentReceived: string;
  smsPaymentMade: string;
  
  // Language
  language: string;
  english: string;
  sindhi: string;
  
  // Page titles and descriptions
  paymentManagement: string;
  paymentManagementDesc: string;
  vendorManagement: string;
  vendorManagementDesc: string;
  customerManagement: string;
  customerManagementDesc: string;
  milkReceivingManagement: string;
  milkReceivingDesc: string;
  milkSendingManagement: string;
  milkSendingDesc: string;
  reportsAndAnalytics: string;
  reportsDesc: string;
  dailyExpenseTracking: string;
  dailyExpenseDesc: string;
  databaseBackupRestore: string;
  databaseDesc: string;
  
  // Payment page specific
  recordPayment: string;
  paymentSummary: string;
  totalReceived: string;
  totalPaid: string;
  recentPayments: string;
  currentBalance: string;
  customerOwes: string;
  amountDueToVendor: string;
  advancePaid: string;
  settled: string;
  paymentReceived: string;
  paymentMade: string;
  selectParty: string;
  selectPaymentType: string;
  selectPaymentMethod: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Navigation
    dashboard: 'Dashboard',
    vendors: 'Vendors',
    customers: 'Customers',
    milkReceiving: 'Milk Receiving',
    milkSending: 'Milk Sending',
    payments: 'Payments',
    dailyExpenses: 'Daily Expenses',
    reports: 'Reports',
    vendorLedger: 'Vendor Ledger',
    customerLedger: 'Customer Ledger',
    pendingPayments: 'Pending Payments',
    databaseManagement: 'Database Management',
    
    // Dashboard
    todaysMilkReceived: "Today's Milk Received",
    todaysMilkSent: "Today's Milk Sent",
    balanceMilk: 'Balance Milk',
    todaysProfit: "Today's Profit",
    pendingPaymentsAmount: 'Pending Payments',
    weeklyMilkFlow: 'Weekly Milk Flow',
    recentActivity: 'Recent Activity',
    
    // Forms
    name: 'Name',
    contact: 'Contact',
    rate: 'Rate',
    quantity: 'Quantity',
    milkType: 'Milk Type',
    cow: 'Cow',
    buffalo: 'Buffalo',
    vendor: 'Vendor',
    customer: 'Customer',
    amount: 'Amount',
    method: 'Method',
    cash: 'Cash',
    bank: 'Bank',
    cheque: 'Cheque',
    reference: 'Reference',
    date: 'Date',
    time: 'Time',
    morning: 'Morning',
    evening: 'Evening',
    
    // Daily Expenses
    description: 'Description',
    category: 'Category',
    fuel: 'Fuel',
    maintenance: 'Maintenance',
    feed: 'Feed',
    veterinary: 'Veterinary',
    labor: 'Labor',
    utilities: 'Utilities',
    other: 'Other',
    todaysExpenses: "Today's Expenses",
    totalFiltered: 'Total Filtered',
    totalExpenses: 'Total Expenses',
    records: 'records',
    
    // Messages
    addVendor: 'Add Vendor',
    editVendor: 'Edit Vendor',
    addCustomer: 'Add Customer',
    editCustomer: 'Edit Customer',
    addExpense: 'Add Expense',
    editExpense: 'Edit Expense',
    addPayment: 'Add Payment',
    milkReceived: 'Milk Received',
    milkSent: 'Milk Sent',
    
    // SMS Messages
    smsNewMilkReceived: 'New milk received: {quantity}L {milkType} from {vendor} at rate {rate}. Time: {time}. Total: {amount}',
    smsNewMilkSent: 'Milk sent: {quantity}L {milkType} to {customer} at rate {rate}. Time: {time}. Total: {amount}',
    smsPaymentReceived: 'Payment received: {amount} from {vendor} via {method}',
    smsPaymentMade: 'Payment made: {amount} to {customer} via {method}',
    
    // Language
    language: 'Language',
    english: 'English',
    sindhi: 'Sindhi',
    
    // Page titles and descriptions
    paymentManagement: 'Payment Management',
    paymentManagementDesc: 'Track payments to vendors and from customers',
    vendorManagement: 'Vendor Management',
    vendorManagementDesc: 'Manage milk suppliers and their information',
    customerManagement: 'Customer Management',
    customerManagementDesc: 'Manage milk buyers and customer details',
    milkReceivingManagement: 'Milk Receiving',
    milkReceivingDesc: 'Record milk received from vendors',
    milkSendingManagement: 'Milk Sending',
    milkSendingDesc: 'Record milk delivered to customers',
    reportsAndAnalytics: 'Reports & Analytics',
    reportsDesc: 'Generate reports and view analytics',
    dailyExpenseTracking: 'Daily Expense Tracking',
    dailyExpenseDesc: 'Track daily business expenses',
    databaseBackupRestore: 'Database Management',
    databaseDesc: 'Backup and restore system data',
    
    // Payment page specific
    recordPayment: 'Record Payment',
    paymentSummary: 'Payment Summary',
    totalReceived: 'Total Received',
    totalPaid: 'Total Paid',
    recentPayments: 'Recent Payments',
    currentBalance: 'Current Balance',
    customerOwes: 'Customer owes',
    amountDueToVendor: 'Amount due to vendor',
    advancePaid: 'Advance paid',
    settled: 'Settled',
    paymentReceived: 'Payment Received',
    paymentMade: 'Payment Made',
    selectParty: 'Select party',
    selectPaymentType: 'Select payment type',
    selectPaymentMethod: 'Select payment method',
  },
  
  sd: {
    // Common
    save: 'محفوظ ڪريو',
    cancel: 'منسوخ',
    delete: 'ڊاهيو',
    edit: 'تبديل ڪريو',
    add: 'شامل ڪريو',
    search: 'ڳوليو',
    filter: 'فلٽر',
    loading: 'لوڊ ٿي رهيو آهي...',
    error: 'خرابي',
    success: 'ڪاميابي',
    
    // Navigation
    dashboard: 'ڊيش بورڊ',
    vendors: 'وينڊرز',
    customers: 'گراهڪ',
    milkReceiving: 'کير وصول ڪرڻ',
    milkSending: 'کير موڪلڻ',
    payments: 'ادائيگيون',
    dailyExpenses: 'روزاني خرچ',
    reports: 'رپورٽون',
    vendorLedger: 'وينڊر ليجر',
    customerLedger: 'گراهڪ ليجر',
    pendingPayments: 'باقي ادائيگيون',
    databaseManagement: 'ڊيٽابيس منظوري',
    
    // Dashboard
    todaysMilkReceived: 'اڄ جو کير وصول',
    todaysMilkSent: 'اڄ جو کير موڪليو',
    balanceMilk: 'بيلنس کير',
    todaysProfit: 'اڄ جو منافعو',
    pendingPaymentsAmount: 'باقي ادائيگيون',
    weeklyMilkFlow: 'هفتيوار کير جو وهڪرو',
    recentActivity: 'تازي سرگرمي',
    
    // Forms
    name: 'نالو',
    contact: 'رابطو',
    rate: 'قيمت',
    quantity: 'مقدار',
    milkType: 'کير جو قسم',
    cow: 'ڳئون',
    buffalo: 'ڀينس',
    vendor: 'وينڊر',
    customer: 'گراهڪ',
    amount: 'رقم',
    method: 'طريقو',
    cash: 'نقد',
    bank: 'بئنڪ',
    cheque: 'چيڪ',
    reference: 'حوالو',
    date: 'تاريخ',
    time: 'وقت',
    morning: 'صبح',
    evening: 'شام',
    
    // Daily Expenses
    description: 'تفصيل',
    category: 'قسم',
    fuel: 'ايندھن',
    maintenance: 'مرمت',
    feed: 'چارو',
    veterinary: 'ڊاڪٽري',
    labor: 'مزدوري',
    utilities: 'سهولتون',
    other: 'ٻيو',
    todaysExpenses: 'اڄ جا خرچ',
    totalFiltered: 'ڪل فلٽر ٿيل',
    totalExpenses: 'ڪل خرچ',
    records: 'رڪارڊ',
    
    // Messages
    addVendor: 'وينڊر شامل ڪريو',
    editVendor: 'وينڊر تبديل ڪريو',
    addCustomer: 'گراهڪ شامل ڪريو',
    editCustomer: 'گراهڪ تبديل ڪريو',
    addExpense: 'خرچ شامل ڪريو',
    editExpense: 'خرچ تبديل ڪريو',
    addPayment: 'ادائيگي شامل ڪريو',
    milkReceived: 'کير وصول ٿيو',
    milkSent: 'کير موڪليو ويو',
    
    // SMS Messages
    smsNewMilkReceived: 'نئون کير وصول: {quantity}ل {milkType} {vendor} کان قيمت {rate} تي. وقت: {time}. ڪل: {amount}',
    smsNewMilkSent: 'کير موڪليو: {quantity}ل {milkType} {customer} کي قيمت {rate} تي. وقت: {time}. ڪل: {amount}',
    smsPaymentReceived: 'ادائيگي وصول: {amount} {vendor} کان {method} ذريعي',
    smsPaymentMade: 'ادائيگي ڪئي: {amount} {customer} کي {method} ذريعي',
    
    // Language
    language: 'ٻولي',
    english: 'انگريزي',
    sindhi: 'سنڌي',
    
    // Page titles and descriptions
    paymentManagement: 'ادائيگي جو انتظام',
    paymentManagementDesc: 'وينڊرز کي ادائيگيون ۽ گراهڪن کان ادائيگيون ٽريڪ ڪريو',
    vendorManagement: 'وينڊر جو انتظام',
    vendorManagementDesc: 'کير فراهم ڪندڙن ۽ انهن جي معلومات جو انتظام ڪريو',
    customerManagement: 'گراهڪ جو انتظام',
    customerManagementDesc: 'کير خريدار ۽ گراهڪن جي تفصيلات جو انتظام ڪريو',
    milkReceivingManagement: 'کير وصول ڪرڻ',
    milkReceivingDesc: 'وينڊرز کان وصول ٿيل کير جو رڪارڊ',
    milkSendingManagement: 'کير موڪلڻ',
    milkSendingDesc: 'گراهڪن کي پهچائيل کير جو رڪارڊ',
    reportsAndAnalytics: 'رپورٽون ۽ تجزيا',
    reportsDesc: 'رپورٽون ٺاهيو ۽ تجزيا ڏسو',
    dailyExpenseTracking: 'روزاني خرچ جي ٽريڪنگ',
    dailyExpenseDesc: 'روزاني ڪاروباري خرچ جي ٽريڪنگ',
    databaseBackupRestore: 'ڊيٽابيس جو انتظام',
    databaseDesc: 'سسٽم ڊيٽا جو بيڪ اپ ۽ بحالي',
    
    // Payment page specific
    recordPayment: 'ادائيگي رڪارڊ ڪريو',
    paymentSummary: 'ادائيگي جو خلاصو',
    totalReceived: 'ڪل وصول ٿيل',
    totalPaid: 'ڪل ادا ڪيل',
    recentPayments: 'تازيون ادائيگيون',
    currentBalance: 'موجوده بيلنس',
    customerOwes: 'گراهڪ جو قرض',
    amountDueToVendor: 'وينڊر کي ادا ڪرڻ وارو',
    advancePaid: 'اڳواٽ ادا ڪيل',
    settled: 'صاف ٿيل',
    paymentReceived: 'ادائيگي وصول ٿيل',
    paymentMade: 'ادائيگي ڪئي وئي',
    selectParty: 'پارٽي چونڊيو',
    selectPaymentType: 'ادائيگي جو قسم چونڊيو',
    selectPaymentMethod: 'ادائيگي جو طريقو چونڊيو',
  }
};

export const getTranslation = (language: Language): Translation => {
  return translations[language];
};

export const formatMessage = (template: string, variables: Record<string, string>): string => {
  let message = template;
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return message;
};