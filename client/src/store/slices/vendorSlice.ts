import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import type { Vendor, InsertVendor } from '@shared/schema';

export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async () => {
    const response = await apiRequest('GET', '/api/vendors');
    return response.json();
  }
);

export const createVendor = createAsyncThunk(
  'vendors/createVendor',
  async (vendor: InsertVendor) => {
    const response = await apiRequest('POST', '/api/vendors', vendor);
    return response.json();
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/updateVendor',
  async ({ id, vendor }: { id: number; vendor: Partial<InsertVendor> }) => {
    const response = await apiRequest('PUT', `/api/vendors/${id}`, vendor);
    return response.json();
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/deleteVendor',
  async (id: number) => {
    await apiRequest('DELETE', `/api/vendors/${id}`);
    return id;
  }
);

interface VendorState {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  vendors: [],
  loading: false,
  error: null,
};

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vendors';
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.push(action.payload);
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(v => v.id !== action.payload);
      });
  },
});

export const { clearError } = vendorSlice.actions;
export default vendorSlice.reducer;
