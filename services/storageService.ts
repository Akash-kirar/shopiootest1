
import { Shop, Product } from '../types';

const SHOPS_KEY = 'local_lens_shops';

export const getShops = (): Shop[] => {
  try {
    const shopsJson = localStorage.getItem(SHOPS_KEY);
    return shopsJson ? JSON.parse(shopsJson) : [];
  } catch (error) {
    console.error("Failed to parse shops from localStorage", error);
    return [];
  }
};

export const saveShops = (shops: Shop[]): void => {
  try {
    const shopsJson = JSON.stringify(shops);
    localStorage.setItem(SHOPS_KEY, shopsJson);
  } catch (error) {
    console.error("Failed to save shops to localStorage", error);
  }
};

export const getShopById = (shopId: string): Shop | undefined => {
    const shops = getShops();
    return shops.find(shop => shop.id === shopId);
}


export const saveShop = (shop: Shop): void => {
    const shops = getShops();
    const existingIndex = shops.findIndex(s => s.id === shop.id);
    if (existingIndex > -1) {
        shops[existingIndex] = shop;
    } else {
        shops.push(shop);
    }
    saveShops(shops);
}


export const addProductToShop = (shopId: string, product: Product): void => {
  const shops = getShops();
  const shopIndex = shops.findIndex((s) => s.id === shopId);
  if (shopIndex !== -1) {
    shops[shopIndex].products.push(product);
    saveShops(shops);
  } else {
      console.error(`Shop with id ${shopId} not found.`);
  }
};
