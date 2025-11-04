
import React, { useState, useCallback } from 'react';
import { SearchResult } from '../types';
import * as storageService from '../services/storageService';
import * as locationService from '../services/locationService';
import * as geminiService from '../services/geminiService';
import ImageUploader from './ImageUploader';
import Spinner from './Spinner';

const ProductCard: React.FC<{ result: SearchResult }> = ({ result }) => {
    const mapsUrl = `https://www.google.com/maps?q=${result.shopLocation.latitude},${result.shopLocation.longitude}`;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img src={`data:${result.mimeType};base64,${result.imageBase64}`} alt={result.name} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{result.shopName}</p>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{result.distance.toFixed(2)} km away</span>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Directions
                        <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

const ShopperView: React.FC = () => {
    const [searchImage, setSearchImage] = useState<{ base64: string, mimeType: string } | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!searchImage) return;

        setLoading(true);
        setError(null);
        setSearched(true);
        setSearchResults([]);

        try {
            setStatusText('Getting your location...');
            const userLocation = await locationService.getUserLocation();

            setStatusText('Analyzing your image...');
            const searchKeywords = (await geminiService.getImageDescription(searchImage.base64, searchImage.mimeType)).split(' ');
            
            setStatusText('Searching nearby shops...');
            const allShops = storageService.getShops();
            const matches: SearchResult[] = [];

            for (const shop of allShops) {
                for (const product of shop.products) {
                    const productKeywords = product.searchKeywords.split(' ');
                    const commonKeywords = searchKeywords.filter(kw => productKeywords.includes(kw));

                    if (commonKeywords.length > 0) { // Simple match: at least one keyword in common
                        const distance = locationService.calculateDistance(userLocation, shop.location);
                        matches.push({
                            ...product,
                            shopId: shop.id,
                            shopName: shop.name,
                            shopLocation: shop.location,
                            distance,
                        });
                    }
                }
            }

            matches.sort((a, b) => a.distance - b.distance);
            setSearchResults(matches);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during the search.');
        } finally {
            setLoading(false);
            setStatusText('');
        }
    }, [searchImage]);

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl self-start">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Find an Item</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Upload a photo of the product you're looking for, and we'll find similar items in shops near you.</p>
                    <ImageUploader 
                        onImageUpload={(base64, mimeType) => setSearchImage({ base64, mimeType })}
                        label="Upload Image to Search"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={!searchImage || loading}
                        className="mt-6 w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Searching...' : 'Find Similar Items Nearby'}
                    </button>
                    {error && <p className="mt-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
                </div>

                <div className="md:col-span-2">
                    {loading && (
                        <div className="flex flex-col justify-center items-center h-full min-h-[400px]">
                            <Spinner size="lg" text={statusText}/>
                        </div>
                    )}
                    {!loading && searched && searchResults.length === 0 && (
                        <div className="flex flex-col justify-center items-center h-full min-h-[400px] bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">No Matches Found</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">We couldn't find any items matching your image in nearby shops. Try a different photo or check back later!</p>
                        </div>
                    )}
                    {!loading && searchResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map(result => (
                                <ProductCard key={`${result.shopId}-${result.id}`} result={result} />
                            ))}
                        </div>
                    )}
                     {!loading && !searched && (
                        <div className="flex flex-col justify-center items-center h-full min-h-[400px] bg-white/50 dark:bg-gray-800/50 border-2 border-dashed dark:border-gray-700 p-8 rounded-lg">
                            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300">Your Search Results Will Appear Here</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">Upload an image and click search to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopperView;
