// SMS Service for sending notifications to vendors and customers
// Using Pakistan country code (+92)

interface SMSData {
  to: string;
  message: string;
  type: 'milk_transaction' | 'payment' | 'ledger';
}

class SMSService {
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If number starts with 0, replace with +92
    if (cleaned.startsWith('0')) {
      return '+92' + cleaned.substring(1);
    }
    
    // If number starts with 92, add +
    if (cleaned.startsWith('92')) {
      return '+' + cleaned;
    }
    
    // If number doesn't start with country code, add +92
    if (!cleaned.startsWith('92')) {
      return '+92' + cleaned;
    }
    
    return '+' + cleaned;
  }

  private createWhatsAppURL(phone: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phone).replace('+', '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  // Send SMS notification for milk transactions
  async sendMilkTransactionSMS(
    contact: string,
    type: 'receive' | 'send',
    data: {
      name: string;
      quantity: number;
      milkType: string;
      rate: number;
      totalAmount: number;
      date: string;
    }
  ): Promise<boolean> {
    try {
      const action = type === 'receive' ? 'received from' : 'delivered to';
      const direction = type === 'receive' ? 'received' : 'sent';
      
      const message = `🥛 Thar Dairy - Milk ${direction.toUpperCase()}\n\n` +
        `Dear ${data.name},\n\n` +
        `Milk ${action} you:\n` +
        `• Type: ${data.milkType.charAt(0).toUpperCase() + data.milkType.slice(1)}\n` +
        `• Quantity: ${data.quantity} liters\n` +
        `• Rate: PKR ${data.rate}/liter\n` +
        `• Total Amount: PKR ${data.totalAmount}\n` +
        `• Date: ${new Date(data.date).toLocaleDateString()}\n\n` +
        `Thank you for your business!\n` +
        `- Thar Dairy Management`;

      return this.sendSMS({
        to: contact,
        message,
        type: 'milk_transaction'
      });
    } catch (error) {
      console.error('Failed to send milk transaction SMS:', error);
      return false;
    }
  }

  // Send SMS notification for payments
  async sendPaymentSMS(
    contact: string,
    type: 'received' | 'paid',
    data: {
      name: string;
      amount: number;
      method: string;
      reference?: string;
      date: string;
    }
  ): Promise<boolean> {
    try {
      const action = type === 'received' ? 'received from' : 'paid to';
      
      const message = `💰 Thar Dairy - Payment ${type.toUpperCase()}\n\n` +
        `Dear ${data.name},\n\n` +
        `Payment ${action} you:\n` +
        `• Amount: PKR ${data.amount}\n` +
        `• Method: ${data.method.charAt(0).toUpperCase() + data.method.slice(1)}\n` +
        `${data.reference ? `• Reference: ${data.reference}\n` : ''}` +
        `• Date: ${new Date(data.date).toLocaleDateString()}\n\n` +
        `Thank you for your business!\n` +
        `- Thar Dairy Management`;

      return this.sendSMS({
        to: contact,
        message,
        type: 'payment'
      });
    } catch (error) {
      console.error('Failed to send payment SMS:', error);
      return false;
    }
  }

  // Send ledger summary via WhatsApp
  async sendLedgerWhatsApp(
    contact: string,
    data: {
      name: string;
      totalReceived: number;
      totalPaid: number;
      balance: number;
      period: string;
    }
  ): Promise<boolean> {
    try {
      const balanceStatus = data.balance > 0 ? 'Credit' : data.balance < 0 ? 'Debit' : 'Balanced';
      
      const message = `📊 Thar Dairy - Account Statement\n\n` +
        `Dear ${data.name},\n\n` +
        `Account Summary (${data.period}):\n` +
        `• Total Received: PKR ${data.totalReceived}\n` +
        `• Total Paid: PKR ${data.totalPaid}\n` +
        `• Balance: PKR ${Math.abs(data.balance)} (${balanceStatus})\n\n` +
        `For detailed statement, please contact us.\n\n` +
        `Thank you for your business!\n` +
        `- Thar Dairy Management`;

      // Open WhatsApp with pre-filled message
      const whatsappURL = this.createWhatsAppURL(contact, message);
      window.open(whatsappURL, '_blank');
      
      return true;
    } catch (error) {
      console.error('Failed to send ledger WhatsApp:', error);
      return false;
    }
  }

  // Generic SMS sending function
  private async sendSMS(data: SMSData): Promise<boolean> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(data.to);
      
      // In production, integrate with SMS service like Twilio, MSG91, etc.
      // For now, we'll simulate sending and log the SMS
      console.log('SMS would be sent to:', formattedPhone);
      console.log('Message:', data.message);
      
      // Show a toast notification to user
      if (window.dispatchEvent) {
        const event = new CustomEvent('sms-sent', {
          detail: {
            phone: formattedPhone,
            message: data.message,
            type: data.type
          }
        });
        window.dispatchEvent(event);
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  // Get formatted phone number for display
  getFormattedPhone(phone: string): string {
    return this.formatPhoneNumber(phone);
  }
}

export const smsService = new SMSService();