import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { MilkTransaction, InsertMilkTransaction } from '@shared/schema';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params?: { startDate?: string; endDate?: string; vendorId?: number; customerId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.vendorId) searchParams.append('vendorId', params.vendorId.toString());
    if (params?.customerId) searchParams.append('customerId', params.customerId.toString());
    
    const response = await apiRequest('GET', `/api/milk-transactions?${searchParams}`);
    return response.json();
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transaction: InsertMilkTransaction) => {
    const response = await apiRequest('POST', '/api/milk-transactions', transaction);
    return response.json();
  }
);

interface TransactionState {
  transactions: MilkTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
