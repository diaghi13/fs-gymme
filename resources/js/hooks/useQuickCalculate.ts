import { useCallback, useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { PageProps } from '@/types';
import { array } from 'yup';

interface QuickCalculateRow {
  unit_price: number;
  quantity: number;
  percentage_discount?: number | null;
  absolute_discount?: number | null;
  vat_rate_percentage?: number | Array<number> | null;
  vat_breakdown?: {
    subtotal: number;
    vat_rate: number;
  }[];
}

interface QuickCalculateParams {
  rows: QuickCalculateRow[];
  sale_percentage_discount?: number | null;
  sale_absolute_discount?: number | null;
  tax_included?: boolean;
}

interface QuickCalculateResult {
  subtotal: number;
  tax_total: number;
  stamp_duty_applied: boolean;
  stamp_duty_amount: number;
  total: number;
  vat_breakdown?: Array<{
    rate: number;
    amount: number;
    percentage: number;
    taxable_amount: number;
    tax_amount: number;
  }>;
}

interface UseQuickCalculateReturn {
  result: QuickCalculateResult | null;
  isCalculating: boolean;
  error: string | null;
  calculate: (params: QuickCalculateParams) => void;
}

/**
 * Hook for real-time sale calculations using backend API
 *
 * Features:
 * - Debounced API calls (300ms default)
 * - Automatic error handling
 * - Loading state management
 * - Cancellation of in-flight requests
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
export function useQuickCalculate(debounceMs: number = 300): UseQuickCalculateReturn {
  const [result, setResult] = useState<QuickCalculateResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTenantId } = usePage<PageProps>().props;

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const calculate = useCallback((params: QuickCalculateParams) => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Cancel any in-flight request
    if (abortController.current) {
      abortController.current.abort();
    }

    // Set debounced calculation
    debounceTimer.current = setTimeout(async () => {
      try {
        setIsCalculating(true);
        setError(null);

        // Create new abort controller for this request
        abortController.current = new AbortController();

        const response = await axios.post<QuickCalculateResult>(
          route('app.sales.quick-calculate', { tenant: currentTenantId }),
          params,
          { signal: abortController.current.signal }
        );

        // console.log('Quick calculate params:', params );
        // console.log('Route:', route('app.sales.quick-calculate', { tenant: currentTenantId }));
        // console.log('Quick calculate response:', response.data );

        setResult(response.data);
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Quick calculate error:', err);
          setError(err.response?.data?.message || 'Errore nel calcolo');
        }
      } finally {
        setIsCalculating(false);
      }
    }, debounceMs);
  }, [debounceMs, currentTenantId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    result,
    isCalculating,
    error,
    calculate,
  };
}
