export interface OrderSummary {
  orderId: string;
  createdDate: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  customerNumber: string;
  invoiceDate: string;
  paymentAccount: string;
  orderTotal: number;
  status: string;
}

export interface OrdersResponse {
  nextPage?: string;
  orders: OrderSummary[];
}

export interface OrderAttachment {
  attachmentId: number;
  attachmentUrl: string;
}

export interface OrderLineItem {
  vendorItemCode: string;
  vendorItemName: string;
  quantity: number;
  unitPrice: number;
  linePrice: number;
  companyConceptProductId: string;
  categoryId: string;
  packagingId: string;
}

export interface OrderDetail {
  orderId: string;
  vendorId: string;
  vendorName: string;
  customerNumber: string;
  invoiceDate: string;
  invoiceNumber: string;
  orderTotal: number;
  deliveryCharges: number;
  otherCharges: number;
  otherDescription: string;
  tax: number;
  inputTaxCredits: number;
  creditAmount: number;
  isCredit: boolean;
  createdDate: string;
  paymentAccount: string;
  status: string;
  attachments: OrderAttachment[];
  lineItems: OrderLineItem[];
}
