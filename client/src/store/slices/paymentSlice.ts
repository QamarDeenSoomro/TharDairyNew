import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Payment, InsertPayment } from '@shared/schema';

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params?: { startDate?: string; endDate?: string; vendorId?: number; customerId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.vendorId) searchParams.append('vendorId', params.vendorId.toString());
    if (params?.customerId) searchParams.append('customerId', params.customerId.toString());
    
    const response = await apiRequest('GET', `/api/payments?${searchParams}`);
    return response.json();
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (payment: InsertPayment) => {
    const response = await apiRequest('POST', '/api/payments', payment);
    return response.json();
  }
);

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      });
  },
});

export const { clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
