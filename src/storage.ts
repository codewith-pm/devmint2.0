import { PaymentData } from './types';

const STORAGE_KEY = 'payment_data_records';

export const savePaymentData = (data: PaymentData): void => {
  const existing = getPaymentData();
  existing.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getPaymentData = (): PaymentData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deletePaymentData = (id: string): void => {
  const existing = getPaymentData();
  const filtered = existing.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearAllPaymentData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
