import { ProductCard } from '../product/ProductSection'

export default function RelatedProducts({ products, loading = false }) {
    if (loading) return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">🔄 Sản phẩm cùng chuyên mục</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!products?.length) return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">🔄 Sản phẩm cùng chuyên mục</h2>
            <div className="text-center py-8 text-gray-500 italic">Chưa có sản phẩm nào cùng chuyên mục</div>
        </div>
    );

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">🔄 Sản phẩm cùng chuyên mục ({products.length} sản phẩm)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
}
