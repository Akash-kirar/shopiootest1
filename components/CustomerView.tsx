
import React, { useState, useEffect } from 'react';
import { Shop, Product, Coordinates } from '../types';
import * as storageService from '../services/storageService';
import * as locationService from '../services/locationService';
import * as geminiService from '../services/geminiService';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';

const SHOP_ID = "my-local-shop"; // Simplified: only one shop per user/browser

const CustomerView: React.FC = () => {
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Shop form state
    const [shopName, setShopName] = useState('');

    // Product form state
    const [productName, setProductName] = useState('');
    const [productImage, setProductImage] = useState<{ base64: string, mimeType: string } | null>(null);
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

    useEffect(() => {
        const existingShop = storageService.getShopById(SHOP_ID);
        if (existingShop) {
            setShop(existingShop);
        }
        setLoading(false);
    }, []);

    const handleCreateShop = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const location: Coordinates = await locationService.getUserLocation();
            const newShop: Shop = {
                id: SHOP_ID,
                name: shopName,
                location,
                products: [],
            };
            storageService.saveShop(newShop);
            setShop(newShop);
        } catch (err: any) {
            setError(err.message || 'Failed to create shop. Please ensure location is enabled.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !productImage || !shop) return;
        
        setIsSubmittingProduct(true);
        setError(null);
        
        try {
            const searchKeywords = await geminiService.getImageDescription(productImage.base64, productImage.mimeType);
            const newProduct: Product = {
                id: `prod_${Date.now()}`,
                name: productName,
                imageBase64: productImage.base64,
                mimeType: productImage.mimeType,
                searchKeywords: searchKeywords
            };
            
            storageService.addProductToShop(shop.id, newProduct);
            const updatedShop = storageService.getShopById(shop.id);
            if(updatedShop) setShop(updatedShop);

            // Reset form
            setProductName('');
            setProductImage(null);

        } catch (err: any) {
            setError(err.message || "Failed to add product.");
        } finally {
            setIsSubmittingProduct(false);
        }
    }

    if (loading && !shop) {
        return <div className="flex justify-center items-center h-64"><Spinner text="Loading your shop..."/></div>
    }

    if (!shop) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Create Your Shop</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">To list products, first create your shop. We'll use your current location as the shop's address.</p>
                {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                <form onSubmit={handleCreateShop}>
                    <div className="mb-4">
                        <label htmlFor="shopName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Shop Name</label>
                        <input
                            type="text"
                            id="shopName"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="e.g., The Fashion Hub"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-400">
                        {loading ? 'Creating...' : 'Create Shop & Set Location'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mt-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-1 text-gray-800 dark:text-white">Add New Product to {shop.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Upload a product image and name. We'll automatically generate search keywords.</p>
                {error && <p className="my-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                <form onSubmit={handleAddProduct}>
                    <div className="mb-4">
                        <label htmlFor="productName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product Name</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="e.g., Summer Cotton T-Shirt"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <ImageUploader onImageUpload={(base64, mimeType) => setProductImage({ base64, mimeType })} label="Product Image" />
                    </div>
                    <button type="submit" disabled={isSubmittingProduct || !productImage || !productName} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmittingProduct ? <div className="flex items-center justify-center gap-2"><Spinner size="sm" /> Analyzing & Adding...</div> : 'Add Product'}
                    </button>
                </form>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your Listed Products</h2>
                {shop.products.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">You haven't added any products yet.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                        {shop.products.map(product => (
                            <div key={product.id} className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                                <img src={`data:${product.mimeType};base64,${product.imageBase64}`} alt={product.name} className="w-full h-32 object-cover"/>
                                <div className="p-2">
                                    <h3 className="text-sm font-semibold truncate text-gray-800 dark:text-white">{product.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Keywords: {product.searchKeywords}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerView;
