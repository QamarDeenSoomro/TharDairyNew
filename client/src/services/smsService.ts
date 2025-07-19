// SMS Service for sending notifications to vendors and customers
// Using Pakistan country code (+92)

import { getTranslation } from '@/lib/i18n';

interface SMSData {
  to: string;
  message: string;
  type: 'milk_transaction' | 'payment' | 'ledger';
}

class SMSService {
  private getLanguage(): string {
    const stored = localStorage.getItem('thar-dairy-language');
    console.log('SMS Service - localStorage language:', stored);
    return stored || 'en';
  }

  private getTranslatedText() {
    const lang = this.getLanguage() as 'en' | 'sd';
    console.log('SMS Service - Final language used:', lang);
    const translation = getTranslation(lang);
    console.log('SMS Translation Sample:', {
      language: lang,
      header: translation.smsHeaderPaymentPaid,
      dear: translation.smsDear,
      amount: translation.smsAmount
    });
    return translation;
  }
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
      time?: string;
      date: string;
    }
  ): Promise<boolean> {
    try {
      const t = this.getTranslatedText();
      
      // Get translated header
      const header = type === 'receive' ? t.smsHeaderMilkReceived : t.smsHeaderMilkSent;
      
      // Get translated action description
      const actionDescription = type === 'receive' ? t.smsMilkReceivedFrom : t.smsMilkDeliveredTo;
      
      // Get translated milk type
      const translatedMilkType = data.milkType === 'cow' ? t.smsCow : 
                                 data.milkType === 'buffalo' ? t.smsBuffalo : 
                                 data.milkType;
      
      // Get translated time
      const translatedTime = data.time === 'morning' ? t.smsMorning :
                             data.time === 'evening' ? t.evening :
                             data.time || t.smsMorning;
      
      const message = `${header}\n\n` +
        `${t.smsDear} ${data.name},\n\n` +
        `${actionDescription}\n` +
        `• ${t.smsType}: ${translatedMilkType}\n` +
        `• ${t.smsQuantity}: ${data.quantity} ${t.smsLiters}\n` +
        `• ${t.smsRate}: ${data.rate}${t.smsPerLiter}\n` +
        `• ${t.smsTotalAmount}: ${data.totalAmount}\n` +
        `• ${t.smsTime}: ${translatedTime}\n` +
        `• ${t.smsDate}: ${new Date(data.date).toLocaleDateString()}\n\n` +
        `${t.smsThankYou}\n` +
        `${t.smsFromTharDairy}`;

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
      const t = this.getTranslatedText();
      
      // Get translated header
      const header = type === 'received' ? t.smsHeaderPaymentReceived : t.smsHeaderPaymentPaid;
      
      // Get translated action description
      const actionDescription = type === 'received' ? t.smsPaymentReceivedFrom : t.smsPaymentPaidTo;
      
      // Get translated payment method
      const translatedMethod = data.method === 'cash' ? t.smsCash :
                               data.method === 'bank' ? t.smsBank :
                               data.method;
      
      const message = `${header}\n\n` +
        `${t.smsDear} ${data.name},\n\n` +
        `${actionDescription}\n` +
        `• ${t.smsAmount}: ${data.amount}\n` +
        `• ${t.smsMethod}: ${translatedMethod}\n` +
        `${data.reference ? `• ${t.smsReference}: ${data.reference}\n` : ''}` +
        `• ${t.smsDate}: ${new Date(data.date).toLocaleDateString()}\n\n` +
        `${t.smsThankYou}\n` +
        `${t.smsFromTharDairy}`;

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
        `• Total Received: ${data.totalReceived}\n` +
        `• Total Paid: ${data.totalPaid}\n` +
        `• Balance: ${Math.abs(data.balance)} (${balanceStatus})\n\n` +
        `For detailed statement, please contact us.\n\n` +
        `Thank you for your business!\n` +
        `- Thar Dairy`;

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
      
      // Create SMS URL with phone number and message
      const smsUrl = `sms:${formattedPhone}?body=${encodeURIComponent(data.message)}`;
      
      // Open SMS app based on device type
      if (navigator.userAgent.match(/Android/i)) {
        // Android device - use location.href for direct app opening
        window.location.href = smsUrl;
        console.log('Android SMS app opened for:', formattedPhone);
      } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        // iOS device - use location.href for direct app opening
        window.location.href = smsUrl;
        console.log('iOS SMS app opened for:', formattedPhone);
      } else {
        // Desktop or other devices - open in new window
        window.open(smsUrl, "_blank");
        console.log('SMS URL opened in new window for:', formattedPhone);
      }
      
      console.log('SMS URL:', smsUrl);
      console.log('Message content:', data.message);
      
      // Dispatch event for toast notification
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