import { useState, useEffect } from 'react';
import { settlementService, type FirebaseSettlement } from '@/services/firebase-realtime';

export function useSettlements() {
  const [settlements, setSettlements] = useState<FirebaseSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = settlementService.subscribe((data) => {
      console.log('Settlements updated:', data);
      setSettlements(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createSettlement = async (
    entityId: string,
    entityType: 'vendor' | 'customer',
    finalBalance: number,
    notes?: string
  ) => {
    try {
      setError(null);
      return await settlementService.archiveEntityData(entityId, entityType, finalBalance, notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create settlement');
      throw err;
    }
  };

  const getLatestSettlement = async (entityId: string, entityType: 'vendor' | 'customer') => {
    try {
      setError(null);
      return await settlementService.getLatestSettlement(entityId, entityType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get latest settlement');
      throw err;
    }
  };

  const getEntitySettlements = (entityId: string, entityType: 'vendor' | 'customer') => {
    const entitySettlements = settlements.filter(s => 
      s.entityType === entityType && 
      (entityType === 'vendor' ? s.vendorId === entityId : s.customerId === entityId)
    ).sort((a, b) => new Date(b.settlementDate).getTime() - new Date(a.settlementDate).getTime());
    
    console.log(`Getting settlements for ${entityType} ${entityId}:`, entitySettlements);
    return entitySettlements;
  };

  return {
    settlements,
    loading,
    error,
    createSettlement,
    getLatestSettlement,
    getEntitySettlements,
  };
}