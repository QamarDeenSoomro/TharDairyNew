import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSMSToasts() {
  const { toast } = useToast();

  useEffect(() => {
    const handleSMSSent = (event: CustomEvent) => {
      const { phone, type } = event.detail;
      
      let message = '';
      switch (type) {
        case 'milk_transaction':
          message = 'SMS sent to notify about milk transaction';
          break;
        case 'payment':
          message = 'SMS sent to notify about payment';
          break;
        case 'ledger':
          message = 'Ledger shared via WhatsApp';
          break;
        default:
          message = 'SMS notification sent';
      }
      
      toast({
        title: 'SMS App Opened',
        description: `${message} - Check your messaging app`,
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