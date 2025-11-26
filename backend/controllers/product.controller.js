import { productService } from "../services/product.service.js";

class ProductController {
    async createProduct(req, res) {
        try {
            const seller_id = req.user._id;
            const productData = { ...req.body, seller_id };

            const newProduct = await productService.createProduct(productData);

            res.status(201).json({
                message: 'Tạo sản phẩm thành công!',
                data: newProduct
            })
        } catch (error) {
            res.status(400).json({ 
                message: 'Tạo sản phẩm thất bại!', 
                error: error.message 
            });
        }
    }

    async getProductDetails(req, res) {
        try {
            const { id } = req.params; // Lấy ID từ URL
            const product = await productService.findProductDetails(id);

            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });
            }

            return res.status(200).json({
                message: 'Lấy thông tin sản phẩm thành công!',
                data: product
            });
        } catch (error) {
            return res.status(500).json({ 
                message: 'Lỗi server!', 
                error: error.message 
            });
        }
    }

    async getTop5EndingSoon(req, res) {
        try {
            const products = await productService.findTop5ProductsEndingSoon();
            return res.status(200).json({
                message: 'Lấy top 5 sản phẩm sắp kết thúc thành công!',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getTop5HighestPrice(req, res) {
        try {
            const products = await productService.findTop5HighestPriceProducts();
            return res.status(200).json({
                message: 'Lấy danh sách giá cao nhất thành công',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getTop5MostBidded(req, res) {
        try {
            const products = await productService.findTop5MostBiddedProducts();
            return res.status(200).json({
                message: 'Lấy danh sách hot trend thành công',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export const productController = new ProductController();