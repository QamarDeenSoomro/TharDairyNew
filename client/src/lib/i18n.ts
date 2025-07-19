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
  
  // Table headers
  party: string;
  type: string;
  milkTypeCap: string;
  actions: string;
  
  // Status and badges
  received: string;
  sent: string;
  paid: string;
  online: string;
  offline: string;
  pending: string;
  active: string;
  disabled: string;
  installed: string;
  webVersion: string;
  connection: string;
  appInstallation: string;
  serviceWorker: string;
  offlineData: string;
  sync: string;
  
  // PWA
  pwaReady: string;
  installApp: string;
  installAppDesc: string;
  install: string;
  notNow: string;
  installOptionDesc: string;
  deployToEnable: string;
  developmentMode: string;
  devModeDesc: string;
  
  // Forms and UI
  generateReport: string;
  exportCSV: string;
  exportExcel: string;
  filters: string;
  dateRange: string;
  reportType: string;
  downloadBackup: string;
  uploadBackup: string;
  resetDatabase: string;
  backupDesc: string;
  restoreDesc: string;
  resetDesc: string;
  
  // Messages and notifications
  noExpensesFound: string;
  expenseRecords: string;
  recentReceipts: string;
  recentDeliveries: string;
  addMilkReceipt: string;
  addMilkDelivery: string;
  liters: string;
  
  // Additional content
  searchVendors: string;
  searchCustomers: string;
  addNewVendor: string;
  addNewCustomer: string;
  noRecentReceipts: string;
  noRecentDeliveries: string;
  unknownVendor: string;
  unknownCustomer: string;
  qty: string;
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
    
    // Table headers
    party: 'Party',
    type: 'Type',
    milkTypeCap: 'Milk Type',
    actions: 'Actions',
    
    // Status and badges
    received: 'Received',
    sent: 'Sent', 
    paid: 'Paid',
    online: 'Online',
    offline: 'Offline',
    pending: 'pending',
    active: 'Active',
    disabled: 'Disabled',
    installed: 'Installed',
    webVersion: 'Web Version',
    connection: 'Connection',
    appInstallation: 'App Installation',
    serviceWorker: 'Service Worker',
    offlineData: 'Offline Data',
    sync: 'Sync',
    
    // PWA
    pwaReady: 'PWA Ready!',
    installApp: 'Install App',
    installAppDesc: 'Install this app on your device for a better experience and offline access.',
    install: 'Install',
    notNow: 'Not Now',
    installOptionDesc: 'Install option will appear after deployment to production with HTTPS.',
    deployToEnable: 'Deploy to Firebase to enable "Add to Home Screen"',
    developmentMode: 'Development Mode',
    devModeDesc: 'Service workers are disabled. Full PWA features will be available in production.',
    
    // Forms and UI
    generateReport: 'Generate Report',
    exportCSV: 'Export CSV',
    exportExcel: 'Export Excel',
    filters: 'Filters',
    dateRange: 'Date Range',
    reportType: 'Report Type',
    downloadBackup: 'Download Backup',
    uploadBackup: 'Upload Backup',
    resetDatabase: 'Reset Database',
    backupDesc: 'Download a complete backup of your database',
    restoreDesc: 'Restore from a previous backup file',
    resetDesc: 'Clear all data and start fresh',
    
    // Messages and notifications
    noExpensesFound: 'No expenses found',
    expenseRecords: 'Expense Records',
    recentReceipts: 'Recent Receipts',
    recentDeliveries: 'Recent Deliveries',
    addMilkReceipt: 'Add Milk Receipt',
    addMilkDelivery: 'Add Milk Delivery',
    liters: 'Liters',
    
    // Additional content
    searchVendors: 'Search vendors...',
    searchCustomers: 'Search customers...',
    addNewVendor: 'Add New Vendor',
    addNewCustomer: 'Add New Customer',
    noRecentReceipts: 'No recent receipts',
    noRecentDeliveries: 'No recent deliveries',
    unknownVendor: 'Unknown Vendor',
    unknownCustomer: 'Unknown Customer',
    qty: 'Qty',
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
    
    // Table headers
    party: 'پارٽي',
    type: 'قسم',
    milkTypeCap: 'کير جو قسم',
    actions: 'عمل',
    
    // Status and badges
    received: 'وصول ٿيل',
    sent: 'موڪليل',
    paid: 'ادا ڪيل',
    online: 'آن لائن',
    offline: 'آف لائن',
    pending: 'باقي',
    active: 'فعال',
    disabled: 'بند',
    installed: 'انسٽال ٿيل',
    webVersion: 'ويب ورزن',
    connection: 'ڪنيڪشن',
    appInstallation: 'ايپ انسٽاليشن',
    serviceWorker: 'سروس ورڪر',
    offlineData: 'آف لائن ڊيٽا',
    sync: 'هم وقت ڪريو',
    
    // PWA
    pwaReady: 'PWA تيار!',
    installApp: 'ايپ انسٽال ڪريو',
    installAppDesc: 'بهتر تجربي ۽ آف لائن رسائي لاءِ هي ايپ پنهنجي ڊوائيس تي انسٽال ڪريو.',
    install: 'انسٽال ڪريو',
    notNow: 'هاڻي نه',
    installOptionDesc: 'انسٽاليشن جو اختيار HTTPS سان پروڊڪشن ۾ ڊپلائي ڪرڻ کان پوءِ ظاهر ٿيندو.',
    deployToEnable: '"هوم اسڪرين ۾ شامل ڪريو" کي فعال ڪرڻ لاءِ Firebase تي ڊپلائي ڪريو',
    developmentMode: 'ڊولپمينٽ موڊ',
    devModeDesc: 'سروس ورڪرز بند آهن. مڪمل PWA خصوصيات پروڊڪشن ۾ دستياب هونديون.',
    
    // Forms and UI
    generateReport: 'رپورٽ ٺاهيو',
    exportCSV: 'CSV ايڪسپورٽ ڪريو',
    exportExcel: 'Excel ايڪسپورٽ ڪريو',
    filters: 'فلٽرز',
    dateRange: 'تاريخ جي حد',
    reportType: 'رپورٽ جو قسم',
    downloadBackup: 'بيڪ اپ ڊائون لوڊ ڪريو',
    uploadBackup: 'بيڪ اپ اپ لوڊ ڪريو',
    resetDatabase: 'ڊيٽابيس ري سيٽ ڪريو',
    backupDesc: 'پنهنجي ڊيٽابيس جو مڪمل بيڪ اپ ڊائون لوڊ ڪريو',
    restoreDesc: 'اڳوڻي بيڪ اپ فائل مان بحالي ڪريو',
    resetDesc: 'سمورو ڊيٽا صاف ڪريو ۽ نئين سر شروع ڪريو',
    
    // Messages and notifications
    noExpensesFound: 'ڪوبه خرچ نه مليو',
    expenseRecords: 'خرچ جا رڪارڊ',
    recentReceipts: 'تازا رسيدون',
    recentDeliveries: 'تازيون ترسيلون',
    addMilkReceipt: 'کير جي رسيد شامل ڪريو',
    addMilkDelivery: 'کير جي ترسيل شامل ڪريو',
    liters: 'ليٽر',
    
    // Additional content
    searchVendors: 'وينڊرز ڳوليو...',
    searchCustomers: 'گراهڪ ڳوليو...',
    addNewVendor: 'نئون وينڊر شامل ڪريو',
    addNewCustomer: 'نئون گراهڪ شامل ڪريو',
    noRecentReceipts: 'ڪا تازي رسيد نه آهي',
    noRecentDeliveries: 'ڪا تازي ترسيل نه آهي',
    unknownVendor: 'اڻڄاتل وينڊر',
    unknownCustomer: 'اڻڄاتل گراهڪ',
    qty: 'مقدار',
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