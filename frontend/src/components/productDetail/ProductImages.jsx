export default function ProductImages({ product, selectedImage, onSelectImage }) {
    const allImages = [product.thumbnail, ...(product.images || [])]
    return (
        <div>
            <div className="mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <img
                src={allImages[selectedImage]}
                alt={product.product_name}
                className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
                />
            </div>
            <div className="flex gap-3 flex-wrap">
                {allImages.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    alt={`Ảnh ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedImage === index
                    ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
                    : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => onSelectImage(index)}
                    onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
                />
                ))}
            </div>
        </div>
    )
}
