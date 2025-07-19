import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSMSToasts() {
  const { toast } = useToast();

  useEffect(() => {
    const handleSMSSent = (event: CustomEvent) => {
      const { phone, type } = event.detail;
      
      let message = '';
      let title = 'SMS App Opened';
      
      if (type.includes('_fallback')) {
        title = 'SMS Ready';
        message = 'Copy the message from console and send manually';
      } else {
        switch (type) {
          case 'milk_transaction':
            message = 'Milk transaction SMS ready to send';
            break;
          case 'payment':
            message = 'Payment notification SMS ready to send';
            break;
          case 'ledger':
            message = 'Ledger shared via WhatsApp';
            title = 'WhatsApp Opened';
            break;
          default:
            message = 'SMS ready to send';
        }
      }
      
      toast({
        title,
        description: `${message} to ${phone}`,
        duration: 4000,
      });
    };

    // Listen for SMS sent events
    window.addEventListener('sms-sent', handleSMSSent as EventListener);

    return () => {
      window.removeEventListener('sms-sent', handleSMSSent as EventListener);
    };
  }, [toast]);
}