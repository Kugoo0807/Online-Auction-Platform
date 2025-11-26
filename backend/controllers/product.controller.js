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
                message: 'Lỗi server khi lấy thông tin sản phẩm!', 
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

    async getProductsByCategory(req, res) {
        try {
            const { slug } = req.params;
            const { page } = req.query;
            const pageNumber = parseInt(page) || 1;

            const products = await productService.getProductsByCategorySlug(slug, pageNumber);

            return res.status(200).json({
                message: 'Lấy danh sách sản phẩm theo thư mục thành công!',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getRandom5ProductsByCategory(req, res) {
        try {
            const { slug } = req.params;
            const products = await productService.getRandom5ProductsByCategorySlug(slug);

            return res.status(200).json({
                message: 'Lấy 5 sản phẩm ngẫu nhiên thành công',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getSellerProducts(req, res) {
        try {
            const sellerId = req.user._id; 
            
            const { page } = req.query;

            const pageNumber = parseInt(page) || 1;
            const products = await productService.getProductsBySellerId(sellerId, pageNumber);

            return res.status(200).json({
                message: 'Lấy danh sách sản phẩm của seller thành công',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async searchProducts(req, res) {
        try {
            const { keyword, page } = req.query;

            if (!keyword) {
                return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm' });
            }

            const pageNumber = parseInt(page) || 1;
            const products = await productService.searchProducts(keyword, pageNumber);

            return res.status(200).json({
                message: 'Kết quả tìm kiếm',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export const productController = new ProductController();