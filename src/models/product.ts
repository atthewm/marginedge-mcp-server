export interface ProductCategory {
  categoryId: string;
  percentAllocation: number;
}

export interface Product {
  centralProductId: string | null;
  companyConceptProductId: string;
  productName: string;
  latestPrice: number;
  reportByUnit: string;
  taxExempt: boolean;
  itemCount: number;
  categories: ProductCategory[];
}

export interface ProductsResponse {
  nextPage?: string;
  products: Product[];
}

export interface Category {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  accountingCode: number;
}

export interface CategoriesResponse {
  nextPage?: string;
  categories: Category[];
}
