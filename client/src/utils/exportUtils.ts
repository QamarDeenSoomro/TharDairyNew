import * as XLSX from 'xlsx';

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Auto-size columns
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    )
  }));
  
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportMultipleSheets(
  sheets: Array<{
    name: string;
    data: any[];
  }>,
  filename: string
) {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    if (sheet.data && sheet.data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      
      // Auto-size columns
      const colWidths = Object.keys(sheet.data[0]).map(key => ({
        wch: Math.max(
          key.length,
          ...sheet.data.map(row => String(row[key] || '').length)
        )
      }));
      
      worksheet['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }
  });
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportReportData(
  transactions: any[],
  payments: any[],
  vendors: any[],
  customers: any[],
  filename: string
) {
  const sheets = [
    {
      name: 'Transactions',
      data: transactions.map(t => ({
        Date: new Date(t.date).toLocaleDateString(),
        Type: t.type,
        'Milk Type': t.milkType,
        Quantity: t.quantity,
        Rate: t.rate,
        'Total Amount': t.totalAmount,
        'Party ID': t.vendorId || t.customerId,
        'Party Type': t.vendorId ? 'Vendor' : 'Customer',
      }))
    },
    {
      name: 'Payments',
      data: payments.map(p => ({
        Date: new Date(p.date).toLocaleDateString(),
        Type: p.type,
        Amount: p.amount,
        Method: p.method,
        Reference: p.reference,
        'Party ID': p.vendorId || p.customerId,
        'Party Type': p.vendorId ? 'Vendor' : 'Customer',
      }))
    },
    {
      name: 'Vendors',
      data: vendors.map(v => ({
        Name: v.name,
        Contact: v.contact,
        Location: v.location,
        'Cow Rate': v.cowRate,
        'Buffalo Rate': v.buffaloRate,
        'Created At': new Date(v.createdAt).toLocaleDateString(),
      }))
    },
    {
      name: 'Customers',
      data: customers.map(c => ({
        Name: c.name,
        Contact: c.contact,
        Location: c.location,
        'Cow Rate': c.cowRate,
        'Buffalo Rate': c.buffaloRate,
        'Created At': new Date(c.createdAt).toLocaleDateString(),
      }))
    }
  ];

  exportMultipleSheets(sheets, filename);
}
