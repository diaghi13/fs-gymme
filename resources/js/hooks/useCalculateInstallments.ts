import { useCallback, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { PageProps } from '@/types';

interface CalculateInstallmentsParams {
  total_amount: number;
  installments_count: number;
  first_due_date: string;
  days_between_installments?: number;
}

export interface Installment {
  installment_number: number;
  amount: number;
  due_date: string;
  payed_at: string | null;
}

interface CalculateInstallmentsResult {
  installments: Installment[];
}

interface UseCalculateInstallmentsReturn {
  installments: Installment[];
  isCalculating: boolean;
  error: string | null;
  generateInstallments: (params: CalculateInstallmentsParams) => Promise<void>;
  clearInstallments: () => void;
}

/**
 * Hook for automatic payment installments generation using backend API
 *
 * Features:
 * - Backend-calculated installments with proper remainder handling
 * - Error handling and loading states
 * - Support for flexible payment schedules (1-12 installments)
 */
export function useCalculateInstallments(): UseCalculateInstallmentsReturn {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTenantId } = usePage<PageProps>().props;

  const generateInstallments = useCallback(async (params: CalculateInstallmentsParams) => {
    try {
      setIsCalculating(true);
      setError(null);

      const response = await axios.post<CalculateInstallmentsResult>(
        route('app.sales.calculate-installments', { tenant: currentTenantId }),
        params
      );

      setInstallments(response.data.installments);
    } catch (err: any) {
      console.error('Calculate installments error:', err);
      setError(err.response?.data?.message || 'Errore nel calcolo delle rate');
      setInstallments([]);
    } finally {
      setIsCalculating(false);
    }
  }, [currentTenantId]);

  const clearInstallments = useCallback(() => {
    setInstallments([]);
    setError(null);
  }, []);

  return {
    installments,
    isCalculating,
    error,
    generateInstallments,
    clearInstallments,
  };
}
