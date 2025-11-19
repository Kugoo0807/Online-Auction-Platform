import { Product } from './schema.js';

class ProductRepository { 
    async create(productData) {
        try {
            if(!productData.current_highest_price) {
                productData.current_highest_price = productData.start_price;
            }
            const product = new Product(productData);
            return await product.save();
        } catch (error) {
            throw new Error(`Lỗi tạo sản phẩm: ${error.message}`);
        }
    }

    async findById(productId) {
        try {
            return await Product.findById(productId)
            .populate('seller_id', 'full_name email phone_number')
            .populate('category_id', 'category_name');
        } catch (error) {
            throw new Error(`Lỗi tìm kiếm sản phẩm: ${error.message}`);
        }
    }
    
    async findByName(productName) {
        try {
            return await Product.find({ product_name: {$regex: productName, $options: 'i' }});
        } catch (error) {
            throw new Error(`Lỗi tìm kiếm sản phẩm: ${error.message}`);
        }
    }
    async findActiveProducts() {
        try {
            const now = new Date();
            return await Product.find({ auction_end_time: { $gt: now } })
            .sort({createdAt: -1})
            .populate('seller_id', 'full_name email phone_number')
            .select('-description');
        } catch (error) {
            throw new Error(`Lỗi lấy sản phẩm đang đấu giá: ${error.message}`);
        }
    }
    async updateHighestBid(productId, newPrice, userId) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                {  
                    _id: productId,
                    current_highest_price: { $lt: newPrice }
                },
                {
                    $set: {
                        current_highest_price: newPrice,
                        current_highest_bidder_id: userId
                    }
                },
                { new: true }
            );
            return updatedProduct;
        }  catch (error) {
            throw new Error(`Lỗi cập nhật giá cao nhất: ${error.message}`);
        }
    }

    async updateProductInfo(productId, updateData) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
            return updatedProduct;
        } catch (error) {
            throw new Error(`Lỗi cập nhật thông tin sản phẩm: ${error.message}`);
        }
    }

    async deleteProduct(productId) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(productId);
            return deletedProduct;
        } catch (error) {
            throw new Error(`Lỗi xóa sản phẩm: ${error.message}`);  
        }
    }
}

export default new ProductRepository();