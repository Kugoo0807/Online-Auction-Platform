const productService = require('../services/product.service.js');

// (GET /api/products)
const getAllProducts = async (req, res) => {
    try {
        const products = await productService.findAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// (GET /api/products/:id)
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.findProductById(id);

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById
};