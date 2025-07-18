import { configureStore } from '@reduxjs/toolkit';
import vendorReducer from './slices/vendorSlice';
import customerReducer from './slices/customerSlice';
import transactionReducer from './slices/transactionSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    vendors: vendorReducer,
    customers: customerReducer,
    transactions: transactionReducer,
    payments: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
