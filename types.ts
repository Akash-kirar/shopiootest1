
export enum Role {
  SHOPPER = 'Shopper',
  CUSTOMER = 'Shop Owner',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Product {
  id: string;
  name: string;
  imageBase64: string;
  mimeType: string;
  searchKeywords: string;
}

export interface Shop {
  id: string;
  name: string;
  location: Coordinates;
  products: Product[];
}

export interface SearchResult extends Product {
  shopId: string;
  shopName: string;
  shopLocation: Coordinates;
  distance: number;
}
