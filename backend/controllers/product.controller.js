import { productService } from "../services/product.service.js";

class ProductController {
    async createProduct(req, res) {
        try {
            // Seller_id
            const seller = req.user._id;

            // Ảnh
            if (!req.files || !req.files['thumbnail'] || !req.files['images']) {
                return res.status(400).json({ message: 'Vui lòng upload ảnh thumbnail và ảnh chi tiết!' });
            }
            const thumbnailPath = req.files['thumbnail'][0].path;
            const imagesPaths = req.files['images'].map(file => file.path);

            // Xử lí dữ liệu
            const start_price = Number(req.body.start_price);
            const buy_it_now_price = req.body.buy_it_now_price ? Number(req.body.buy_it_now_price) : null;
            const bid_increment = Number(req.body.bid_increment);
            const auction_end_time = new Date(req.body.auction_end_time);
            const productData = { ...req.body, start_price, buy_it_now_price, bid_increment, auction_end_time, seller, thumbnail: thumbnailPath, images: imagesPaths };

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

    async appendDescription(req, res) {
        try {
            const seller = req.user._id;
            const productId = req.params.id;
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({ message: 'Vui lòng nhập nội dung mô tả bổ sung!' });
            }
            console.log('Sanitized content:', content);

            const updatedProduct = await productService.appendDescription(seller, productId, content);

            return res.status(200).json({
                message: 'Cập nhật mô tả thành công!',
                data: updatedProduct
            });
        } catch (error) {
            return res.status(400).json({ 
                message: error.message
            });
        }
    }

    async getAllProducts(req, res) {
        try {
            const products = await productService.findAllProducts();
            return res.status(200).json({
                message: 'Lấy danh sách sản phẩm thành công!',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ 
                message: error.message 
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

            const products = await productService.getProductsByCategorySlug(slug);

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
            
            const products = await productService.getProductsBySellerId(sellerId);

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
            const { keyword } = req.query;

            if (!keyword) {
                return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm' });
            }

            const products = await productService.searchProducts(keyword);

            return res.status(200).json({
                message: 'Kết quả tìm kiếm',
                data: products
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getMinValidPrice(req, res) {
        try {
            const user = req.user._id.toString();
            const { id } = req.params;

            const result = await productService.getMinValidPrice(id, user);
            return res.status(200).json({
                message: 'Lấy giá trị đặt thấp nhất thành công',
                min_valid_price: result.min_valid_price,
                last_bid: result.last_bid
            })
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: error.message });
        }
    }

    async banBidder(req, res) {
        try {
            const seller = req.user._id.toString();
            const product = req.params.id;
            const { bidder } = req.body;
            
            const result = await productService.banBidder(seller, product, bidder);
            return res.status(200).json({
                message: "Đã chặn người dùng và cập nhật lại giá sàn",
                result
            })
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async unbanBidder(req, res) {
        try {
            const seller = req.user._id.toString();
            const product = req.params.id;
            const { bidder } = req.body;
            
            const result = await productService.unbanBidder(seller, product, bidder);
            return res.status(200).json({
                message: "Đã bỏ chặn và khôi phục quyền đấu giá",
                result
            })
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async toggleWatchList(req, res) {
        try {
            const user = req.user._id;
            const product = req.params.id;
            
            const result = await productService.toggleWatchList(user, product);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getWatchList(req, res) {
        try {
            const user = req.user._id;
            const products = await productService.getWatchList(user);

            return res.status(200).json({
                message: 'Đã lấy thành công danh sách yêu thích',
                data: products
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async checkIsWatching(req, res) {
        try {
            const user = req.user._id;
            const product = req.params.id;

            const isWatching = await productService.checkIsWatching(user, product);

            return res.status(200).json({
                is_watching: isWatching
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async buyProductNow(req, res) {
        try {
            const buyer = req.user._id;
            const productId = req.params.id;
            const result = await productService.buyProductNow(buyer, productId);

            return res.status(200).json({
                message: 'Mua ngay sản phẩm thành công!',
                data: result
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }   
    }

    async cancelProduct(req, res) {
        try {
            const seller = req.user._id.toString();
            const isAdmin = req.user.role === 'admin';
            const productId = req.params.id;

            const result = await productService.cancelProduct(seller, productId, isAdmin);

            return res.status(200).json({
                message: 'Hủy sản phẩm thành công!',
                data: result
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export const productController = new ProductController();