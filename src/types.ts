export interface PaymentData {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  billingAddress: string;
  zipCode: string;
  email: string;
  amount: number;
  currency: string;
  transactionId: string;
  createdAt: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
}
