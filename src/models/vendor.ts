export interface VendorAccount {
  vendorAccountNumber: string;
}

export interface Vendor {
  vendorId: string;
  vendorName: string;
  centralVendorId: string;
  vendorAccounts: VendorAccount[];
}

export interface VendorsResponse {
  nextPage?: string;
  vendors: Vendor[];
}

export interface VendorItem {
  vendorItemCode: string;
  centralVendorItemId: string;
  vendorId: string;
  vendorName: string;
  centralVendorId: string;
  companyConceptProductId: string;
  productName: string;
}

export interface VendorItemsResponse {
  nextPage?: string;
  vendorItems: VendorItem[];
}

export interface Packaging {
  packagingId: string;
  packagingName: string;
  unit: string;
  quantity: number;
}

export interface PackagingResponse {
  nextPage?: string;
  packagings: Packaging[];
}
